/**
 * Validators Module
 *
 * Provides comprehensive validation utilities for:
 * - Type checking (numbers, strings, arrays, objects)
 * - Stock market data validation
 * - Configuration validation
 * - Indicator parameter validation
 */

const { getLogger } = require("./logger");
const LOG_CATEGORIES = require("./log-categories");
const logger = getLogger(LOG_CATEGORIES.VALIDATORS);

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "ValidationError";
    this.context = context;
  }
}

// ============================================================================
// BASIC TYPE VALIDATORS
// ============================================================================

/**
 * Validate if value is a number
 *
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowNaN - Allow NaN values (default: false)
 * @param {boolean} options.allowInfinity - Allow Infinity values (default: false)
 * @returns {boolean} - True if valid
 */
function isNumber(value, options = {}) {
  const { allowNaN = false, allowInfinity = false } = options;

  if (typeof value !== "number") {
    return false;
  }

  // Check NaN first (NaN is typeof 'number' but isNaN)
  if (isNaN(value)) {
    return allowNaN;
  }

  if (!allowInfinity && !isFinite(value)) {
    return false;
  }

  return true;
}

/**
 * Validate if value is an integer
 *
 * @param {any} value - Value to validate
 * @returns {boolean} - True if valid
 */
function isInteger(value) {
  return Number.isInteger(value);
}

/**
 * Validate if number is positive
 *
 * @param {number} value - Value to validate
 * @param {boolean} strict - If true, zero is not allowed (default: false)
 * @returns {boolean} - True if valid
 */
function isPositive(value, strict = false) {
  if (!isNumber(value)) {
    return false;
  }

  return strict ? value > 0 : value >= 0;
}

/**
 * Validate if value is within range
 *
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} - True if valid
 */
function isInRange(value, min, max) {
  if (!isNumber(value) || !isNumber(min) || !isNumber(max)) {
    return false;
  }

  return value >= min && value <= max;
}

/**
 * Validate if value is a string
 *
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length
 * @param {number} options.maxLength - Maximum length
 * @returns {boolean} - True if valid
 */
function isString(value, options = {}) {
  if (typeof value !== "string") {
    return false;
  }

  const { minLength, maxLength } = options;

  if (minLength !== undefined && value.length < minLength) {
    return false;
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return false;
  }

  return true;
}

/**
 * Validate if value is an array
 *
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length
 * @param {number} options.maxLength - Maximum length
 * @returns {boolean} - True if valid
 */
function isArray(value, options = {}) {
  if (!Array.isArray(value)) {
    return false;
  }

  const { minLength, maxLength } = options;

  if (minLength !== undefined && value.length < minLength) {
    return false;
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return false;
  }

  return true;
}

/**
 * Validate if value is a plain object
 *
 * @param {any} value - Value to validate
 * @returns {boolean} - True if valid
 */
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validate if value is a valid date
 *
 * @param {any} value - Value to validate
 * @returns {boolean} - True if valid
 */
function isDate(value) {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============================================================================
// STOCK MARKET DATA VALIDATORS
// ============================================================================

/**
 * Validate stock symbol format
 *
 * @param {string} symbol - Stock symbol to validate
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If symbol is invalid
 */
function validateSymbol(symbol) {
  if (!isString(symbol, { minLength: 1 })) {
    throw new ValidationError("Symbol must be a non-empty string", { symbol });
  }

  // Check for valid format (e.g., 'RELIANCE.NS', 'TCS.NS')
  const symbolPattern = /^[A-Z0-9&-]+\.[A-Z]{1,5}$/;

  if (!symbolPattern.test(symbol)) {
    throw new ValidationError(
      `Invalid symbol format: ${symbol}. Expected format: 'SYMBOL.EXCHANGE' (e.g., 'RELIANCE.NS')`,
      { symbol },
    );
  }

  return true;
}

/**
 * Validate OHLCV candle data structure
 *
 * @param {Object} candle - OHLCV candle data
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If candle is invalid
 */
function validateOHLCV(candle) {
  if (!isObject(candle)) {
    throw new ValidationError("Candle must be an object", { candle });
  }

  const required = ["high", "low", "close", "volume"];
  const missing = required.filter((field) => !candle.hasOwnProperty(field));

  if (missing.length > 0) {
    throw new ValidationError(
      `Candle missing required fields: ${missing.join(", ")}`,
      { candle, missing },
    );
  }

  // Validate numeric values
  if (
    !isNumber(candle.high) ||
    !isNumber(candle.low) ||
    !isNumber(candle.close) ||
    !isNumber(candle.volume)
  ) {
    throw new ValidationError(
      "Candle fields (high, low, close, volume) must be numbers",
      { candle },
    );
  }

  // Validate logical relationships
  if (candle.high < candle.low) {
    throw new ValidationError("Candle high must be >= low", {
      candle,
      high: candle.high,
      low: candle.low,
    });
  }

  if (candle.close > candle.high || candle.close < candle.low) {
    throw new ValidationError("Candle close must be between high and low", {
      candle,
      close: candle.close,
      high: candle.high,
      low: candle.low,
    });
  }

  if (candle.volume < 0) {
    throw new ValidationError("Candle volume must be non-negative", {
      candle,
      volume: candle.volume,
    });
  }

  return true;
}

/**
 * Validate array of OHLCV data
 *
 * @param {Array} data - Array of OHLCV candles
 * @param {number} minLength - Minimum required length (optional)
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If data is invalid
 */
function validateOHLCVArray(data, minLength = 1) {
  if (!isArray(data, { minLength })) {
    throw new ValidationError(
      `OHLCV data must be an array with at least ${minLength} elements`,
      { dataLength: data?.length, minLength },
    );
  }

  // Validate each candle
  data.forEach((candle, index) => {
    try {
      validateOHLCV(candle);
    } catch (error) {
      throw new ValidationError(
        `Invalid candle at index ${index}: ${error.message}`,
        { index, candle, originalError: error },
      );
    }
  });

  return true;
}

/**
 * Validate array of price values
 *
 * @param {Array} prices - Array of prices
 * @param {number} minLength - Minimum required length (optional)
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If prices are invalid
 */
function validatePriceData(prices, minLength = 1) {
  if (!isArray(prices, { minLength })) {
    throw new ValidationError(
      `Price data must be an array with at least ${minLength} elements`,
      { pricesLength: prices?.length, minLength },
    );
  }

  // Validate all elements are numbers
  const invalidIndices = [];
  prices.forEach((price, index) => {
    if (!isNumber(price)) {
      invalidIndices.push(index);
    }
  });

  if (invalidIndices.length > 0) {
    throw new ValidationError(
      `Price data contains non-numeric values at indices: ${invalidIndices.join(", ")}`,
      { invalidIndices, sampleInvalid: prices[invalidIndices[0]] },
    );
  }

  return true;
}

/**
 * Validate candle interval
 *
 * @param {string} interval - Candle interval
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If interval is invalid
 */
function validateInterval(interval) {
  const validIntervals = [
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "4h",
    "1d",
    "1wk",
    "1mo",
  ];

  if (!isString(interval)) {
    throw new ValidationError("Interval must be a string", { interval });
  }

  if (!validIntervals.includes(interval)) {
    throw new ValidationError(
      `Invalid interval: ${interval}. Valid intervals: ${validIntervals.join(", ")}`,
      { interval, validIntervals },
    );
  }

  return true;
}

// ============================================================================
// CONFIGURATION VALIDATORS
// ============================================================================

/**
 * Validate universe name
 *
 * @param {string} name - Universe name
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If name is invalid
 */
function validateUniverseName(name) {
  if (!isString(name, { minLength: 1 })) {
    throw new ValidationError("Universe name must be a non-empty string", {
      name,
    });
  }

  // Alphanumeric and underscores only
  const namePattern = /^[A-Z0-9_]+$/;

  if (!namePattern.test(name)) {
    throw new ValidationError(
      `Invalid universe name: ${name}. Must contain only uppercase letters, numbers, and underscores`,
      { name },
    );
  }

  return true;
}

/**
 * Validate scan options
 *
 * @param {Object} options - Scan options
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If options are invalid
 */
function validateScanOptions(options) {
  if (!isObject(options)) {
    throw new ValidationError("Scan options must be an object", { options });
  }

  // Validate interval if provided
  if (options.interval !== undefined) {
    validateInterval(options.interval);
  }

  // Validate days if provided
  if (options.days !== undefined) {
    if (!isInteger(options.days) || !isPositive(options.days, true)) {
      throw new ValidationError(
        'Scan option "days" must be a positive integer',
        { days: options.days },
      );
    }
  }

  // Validate minScore if provided
  if (options.minScore !== undefined) {
    if (!isNumber(options.minScore) || !isInRange(options.minScore, 0, 100)) {
      throw new ValidationError(
        'Scan option "minScore" must be a number between 0 and 100',
        { minScore: options.minScore },
      );
    }
  }

  // Validate maxResults if provided
  if (options.maxResults !== undefined) {
    if (
      !isInteger(options.maxResults) ||
      !isPositive(options.maxResults, true)
    ) {
      throw new ValidationError(
        'Scan option "maxResults" must be a positive integer',
        { maxResults: options.maxResults },
      );
    }
  }

  return true;
}

/**
 * Validate API configuration
 *
 * @param {Object} config - API configuration
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If config is invalid
 */
function validateApiConfig(config) {
  if (!isObject(config)) {
    throw new ValidationError("API config must be an object", { config });
  }

  // Validate rate limit config
  if (config.rateLimit) {
    if (!isObject(config.rateLimit)) {
      throw new ValidationError("rateLimit must be an object", {
        rateLimit: config.rateLimit,
      });
    }

    if (
      !isNumber(config.rateLimit.requestsPerSecond) ||
      !isPositive(config.rateLimit.requestsPerSecond, true)
    ) {
      throw new ValidationError(
        "rateLimit.requestsPerSecond must be a positive number",
        { requestsPerSecond: config.rateLimit.requestsPerSecond },
      );
    }
  }

  // Validate retry config
  if (config.retry) {
    if (!isObject(config.retry)) {
      throw new ValidationError("retry must be an object", {
        retry: config.retry,
      });
    }

    if (
      !isInteger(config.retry.maxAttempts) ||
      !isPositive(config.retry.maxAttempts, true)
    ) {
      throw new ValidationError(
        "retry.maxAttempts must be a positive integer",
        { maxAttempts: config.retry.maxAttempts },
      );
    }
  }

  return true;
}

// ============================================================================
// INDICATOR PARAMETER VALIDATORS
// ============================================================================

/**
 * Validate indicator period
 *
 * @param {number} period - Period value
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum allowed period (default: 1)
 * @param {number} options.max - Maximum allowed period (default: 500)
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If period is invalid
 */
function validatePeriod(period, options = {}) {
  const { min = 1, max = 500 } = options;

  if (!isInteger(period)) {
    throw new ValidationError("Period must be an integer", { period });
  }

  if (!isInRange(period, min, max)) {
    throw new ValidationError(`Period must be between ${min} and ${max}`, {
      period,
      min,
      max,
    });
  }

  return true;
}

/**
 * Validate EMA period
 *
 * @param {number} period - EMA period
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If period is invalid
 */
function validateEMAPeriod(period) {
  return validatePeriod(period, { min: 1, max: 200 });
}

/**
 * Validate RSI period
 *
 * @param {number} period - RSI period
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If period is invalid
 */
function validateRSIPeriod(period) {
  return validatePeriod(period, { min: 2, max: 50 });
}

/**
 * Validate MACD parameters
 *
 * @param {number} fast - Fast EMA period
 * @param {number} slow - Slow EMA period
 * @param {number} signal - Signal line period
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If parameters are invalid
 */
function validateMACDParams(fast, slow, signal) {
  validatePeriod(fast, { min: 1, max: 50 });
  validatePeriod(slow, { min: 1, max: 100 });
  validatePeriod(signal, { min: 1, max: 50 });

  if (fast >= slow) {
    throw new ValidationError(
      "MACD fast period must be less than slow period",
      { fast, slow },
    );
  }

  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Error class
  ValidationError,

  // Basic type validators
  isNumber,
  isInteger,
  isPositive,
  isInRange,
  isString,
  isArray,
  isObject,
  isDate,

  // Stock market data validators
  validateSymbol,
  validateOHLCV,
  validateOHLCVArray,
  validatePriceData,
  validateInterval,

  // Configuration validators
  validateUniverseName,
  validateScanOptions,
  validateApiConfig,

  // Indicator parameter validators
  validatePeriod,
  validateEMAPeriod,
  validateRSIPeriod,
  validateMACDParams,
};
