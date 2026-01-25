/**
 * Rate Limiter Module
 *
 * Implements token bucket algorithm for rate limiting with:
 * - Configurable requests per second
 * - Exponential backoff on failures
 * - Circuit breaker pattern
 * - Request queuing
 */

const { getLogger } = require("./logger");
const LOG_CATEGORIES = require("./log-categories");
const logger = getLogger(LOG_CATEGORIES.UTILS);

/**
 * Token Bucket Rate Limiter
 */
class RateLimiter {
  /**
   * Create a rate limiter
   *
   * @param {Object} options - Configuration options
   * @param {number} options.requestsPerSecond - Maximum requests per second
   * @param {number} options.burstSize - Maximum burst size (tokens in bucket)
   */
  constructor(options = {}) {
    this.requestsPerSecond = options.requestsPerSecond || 5;
    this.burstSize = options.burstSize || 10;

    // Token bucket state
    this.tokens = this.burstSize;
    this.lastRefillTime = Date.now();

    // Request queue
    this.queue = [];
    this.processing = false;

    logger.info("RateLimiter initialized", {
      requestsPerSecond: this.requestsPerSecond,
      burstSize: this.burstSize,
    });
  }

  /**
   * Refill tokens based on elapsed time
   * @private
   */
  refillTokens() {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillTime;
    const elapsedSeconds = elapsedMs / 1000;

    // Add tokens based on elapsed time
    const tokensToAdd = elapsedSeconds * this.requestsPerSecond;
    this.tokens = Math.min(this.burstSize, this.tokens + tokensToAdd);
    this.lastRefillTime = now;

    logger.debug("Tokens refilled", {
      currentTokens: this.tokens.toFixed(2),
      elapsedMs,
      tokensAdded: tokensToAdd.toFixed(2),
    });
  }

  /**
   * Acquire a token (returns immediately if available)
   *
   * @returns {Promise<void>} - Resolves when token is acquired
   */
  async acquire() {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * Process the request queue
   * @private
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        // Token available, process request
        this.tokens -= 1;
        const resolve = this.queue.shift();
        resolve();

        logger.debug("Token acquired", {
          remainingTokens: this.tokens.toFixed(2),
          queueLength: this.queue.length,
        });
      } else {
        // No tokens available, wait before checking again
        const waitTime = (1 / this.requestsPerSecond) * 1000;

        logger.debug("No tokens available, waiting", {
          waitTimeMs: waitTime,
          queueLength: this.queue.length,
        });

        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.processing = false;
  }

  /**
   * Execute a function with rate limiting
   *
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>} - Result of the function
   */
  async execute(fn) {
    await this.acquire();
    return fn();
  }

  /**
   * Get current rate limiter stats
   *
   * @returns {Object} - Stats object
   */
  getStats() {
    this.refillTokens();
    return {
      tokens: this.tokens,
      queueLength: this.queue.length,
      requestsPerSecond: this.requestsPerSecond,
      burstSize: this.burstSize,
    };
  }
}

/**
 * Circuit Breaker for handling cascading failures
 */
class CircuitBreaker {
  /**
   * Create a circuit breaker
   *
   * @param {Object} options - Configuration options
   * @param {number} options.failureThreshold - Number of failures before opening circuit
   * @param {number} options.cooldownMs - Cooldown period in milliseconds
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownMs = options.cooldownMs || 60000;

    // Circuit state
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;

    logger.info("CircuitBreaker initialized", {
      failureThreshold: this.failureThreshold,
      cooldownMs: this.cooldownMs,
    });
  }

  /**
   * Check if circuit allows requests
   *
   * @returns {boolean} - True if request can proceed
   */
  canProceed() {
    if (this.state === "CLOSED") {
      return true;
    }

    if (this.state === "OPEN") {
      // Check if cooldown period has elapsed
      const now = Date.now();
      if (now - this.lastFailureTime >= this.cooldownMs) {
        logger.info("Circuit entering HALF_OPEN state", {
          failureCount: this.failureCount,
          cooldownElapsed: now - this.lastFailureTime,
        });
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }

    // HALF_OPEN state - allow request to test if service recovered
    return true;
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successCount++;

      // After 3 successful requests in HALF_OPEN, close circuit
      if (this.successCount >= 3) {
        logger.info("Circuit CLOSED after successful recovery", {
          successCount: this.successCount,
          previousFailures: this.failureCount,
        });
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === "CLOSED") {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // Failure during recovery - reopen circuit
      logger.warn("Circuit REOPENED after failure during recovery", {
        failureCount: this.failureCount,
      });
      this.state = "OPEN";
      this.successCount = 0;
    } else if (this.failureCount >= this.failureThreshold) {
      // Too many failures - open circuit
      logger.error("Circuit OPENED due to failures", {
        failureCount: this.failureCount,
        threshold: this.failureThreshold,
      });
      this.state = "OPEN";
    }
  }

  /**
   * Execute a function with circuit breaker protection
   *
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>} - Result of the function
   * @throws {Error} - If circuit is open
   */
  async execute(fn) {
    if (!this.canProceed()) {
      const error = new Error("Circuit breaker is OPEN - service unavailable");
      error.circuitState = this.state;
      throw error;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get current circuit breaker state
   *
   * @returns {Object} - State object
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      failureThreshold: this.failureThreshold,
      cooldownMs: this.cooldownMs,
    };
  }

  /**
   * Reset circuit breaker manually
   */
  reset() {
    logger.info("Circuit breaker manually reset", {
      previousState: this.state,
      previousFailures: this.failureCount,
    });
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Exponential backoff utility
 *
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {Object} options - Backoff options
 * @returns {number} - Delay in milliseconds
 */
function calculateBackoff(attempt, options = {}) {
  const initialDelay = options.initialDelayMs || 1000;
  const maxDelay = options.maxDelayMs || 10000;
  const multiplier = options.backoffMultiplier || 2;

  const delay = Math.min(
    initialDelay * Math.pow(multiplier, attempt),
    maxDelay,
  );

  // Add jitter (random variation ±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);

  return Math.floor(delay + jitter);
}

/**
 * Retry a function with exponential backoff
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise<any>} - Result of the function
 * @throws {Error} - If all attempts fail
 */
async function retryWithBackoff(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const context = options.context || "operation";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      logger.debug(`Attempting ${context}`, {
        attempt: attempt + 1,
        maxAttempts,
      });

      const result = await fn();

      if (attempt > 0) {
        logger.info(`${context} succeeded after retry`, {
          attempt: attempt + 1,
        });
      }

      return result;
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts - 1;

      if (isLastAttempt) {
        logger.error(`${context} failed after all attempts`, {
          attempts: maxAttempts,
          error: error.message,
        });
        throw error;
      }

      const backoffDelay = calculateBackoff(attempt, options);

      logger.warn(`${context} failed, retrying`, {
        attempt: attempt + 1,
        maxAttempts,
        backoffDelayMs: backoffDelay,
        error: error.message,
      });

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
}

module.exports = {
  RateLimiter,
  CircuitBreaker,
  calculateBackoff,
  retryWithBackoff,
};
