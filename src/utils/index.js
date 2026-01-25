/**
 * Utils Module - Utility functions and helpers
 */

const {
  getLogger,
  LOG_LEVELS,
  LOG_DIR,
  ensureLogDirectory,
  getDateString,
  getTimestamp,
} = require("./logger");
const LOG_CATEGORIES = require("./log-categories");
const validators = require("./validators");
const configLoader = require("./config-loader");
const rateLimiter = require("./rate-limiter");

module.exports = {
  // Logger
  getLogger,
  LOG_LEVELS,
  LOG_DIR,
  ensureLogDirectory,
  getDateString,
  getTimestamp,
  LOG_CATEGORIES,

  // Validators
  validators,

  // Configuration
  configLoader,

  // Rate Limiting
  RateLimiter: rateLimiter.RateLimiter,
  CircuitBreaker: rateLimiter.CircuitBreaker,
  retryWithBackoff: rateLimiter.retryWithBackoff,
};
