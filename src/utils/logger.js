/**
 * Logger Module - Core Logging System
 * 
 * Provides structured logging with:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - File rotation based on date
 * - Categorized logs by module
 * - Timestamp recording
 * - Color-coded console output
 * - JSON structured logs for easy parsing
 */

const fs = require('fs');
const path = require('path');

// Log configuration
const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

// Level hierarchy for filtering (lower level = less important)
const LEVEL_RANK = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Console colors for different log levels
const COLORS = {
  DEBUG: '\x1b[36m',  // Cyan
  INFO: '\x1b[32m',   // Green
  WARN: '\x1b[33m',   // Yellow
  ERROR: '\x1b[31m',  // Red
  RESET: '\x1b[0m'    // Reset
};

// Minimum log level (can be adjusted via environment variable)
const MIN_LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

/**
 * Ensure logs directory exists
 * @private
 */
function ensureLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 * @private
 * @returns {string} - Date string
 */
function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get current timestamp in ISO format with milliseconds
 * @private
 * @returns {string} - Timestamp string
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message with structure
 * @private
 * @param {string} level - Log level
 * @param {string} category - Log category
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Formatted log object
 */
function formatLog(level, category, message, metadata = {}) {
  return {
    timestamp: getTimestamp(),
    level,
    category,
    message,
    processId: process.pid,
    ...metadata
  };
}

/**
 * Write log to file
 * @private
 * @param {string} category - Log category
 * @param {Object} logObject - Formatted log object
 */
function writeToFile(category, logObject) {
  ensureLogDirectory();

  // Determine file path: logs/[category]/[category]_YYYY-MM-DD.log
  const categoryDir = path.join(LOG_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const dateString = getDateString();
  const filePath = path.join(categoryDir, `${category}_${dateString}.log`);

  // Write as JSON line for easy parsing
  const logLine = JSON.stringify(logObject) + '\n';
  
  try {
    fs.appendFileSync(filePath, logLine, 'utf8');
  } catch (error) {
    console.error('Failed to write log file:', error.message);
  }
}

/**
 * Format console output with colors
 * @private
 * @param {Object} logObject - Formatted log object
 * @returns {string} - Formatted string for console
 */
function formatConsoleOutput(logObject) {
  const { timestamp, level, category, message } = logObject;
  const color = COLORS[level];
  const timeStr = timestamp.split('T')[1].split('Z')[0]; // HH:MM:SS.mmm
  
  return `${color}[${timeStr}]${COLORS.RESET} ${color}${level}${COLORS.RESET} ${category}: ${message}`;
}

/**
 * Main logger class
 */
class Logger {
  /**
   * Create a logger instance for a specific category
   * @param {string} category - Category name (e.g., 'scanner', 'indicators', 'data')
   */
  constructor(category) {
    this.category = category;
  }

  /**
   * Check if log level should be logged
   * @private
   * @param {string} level - Log level to check
   * @returns {boolean} - True if level should be logged
   */
  shouldLog(level) {
    return LEVEL_RANK[level] >= LEVEL_RANK[MIN_LOG_LEVEL];
  }

  /**
   * Internal log function
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  _log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const logObject = formatLog(level, this.category, message, metadata);

    // Write to file
    writeToFile(this.category, logObject);

    // Write to console
    console.log(formatConsoleOutput(logObject));
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  debug(message, metadata = {}) {
    this._log(LOG_LEVELS.DEBUG, message, metadata);
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  info(message, metadata = {}) {
    this._log(LOG_LEVELS.INFO, message, metadata);
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  warn(message, metadata = {}) {
    this._log(LOG_LEVELS.WARN, message, metadata);
  }

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {Object} error - Error object or metadata
   */
  error(message, error = {}) {
    const metadata = error instanceof Error
      ? {
          errorMessage: error.message,
          errorStack: error.stack,
          errorName: error.name
        }
      : error;

    this._log(LOG_LEVELS.ERROR, message, metadata);
  }

  /**
   * Log function entry (for performance tracking)
   * @param {string} functionName - Function name
   * @param {Object} args - Function arguments
   * @returns {string} - Trace ID for matching exit logs
   */
  enter(functionName, args = {}) {
    const traceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.debug(`→ Entering ${functionName}`, {
      function: functionName,
      args,
      traceId
    });
    return traceId;
  }

  /**
   * Log function exit (for performance tracking)
   * @param {string} functionName - Function name
   * @param {Object} result - Function result/return value
   * @param {string} traceId - Trace ID from enter()
   * @param {number} duration - Execution duration in ms
   */
  exit(functionName, result = {}, traceId = '', duration = 0) {
    this.debug(`← Exiting ${functionName}`, {
      function: functionName,
      result,
      traceId,
      durationMs: duration
    });
  }

  /**
   * Log performance metrics
   * @param {string} operationName - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metrics - Additional metrics
   */
  metric(operationName, duration, metrics = {}) {
    this.info(`METRIC: ${operationName}`, {
      operation: operationName,
      durationMs: duration,
      ...metrics
    });
  }
}

/**
 * Logger factory - creates loggers for different categories
 * Use this instead of instantiating Logger directly
 */
class LoggerFactory {
  constructor() {
    this.loggers = new Map();
  }

  /**
   * Get or create a logger for a category
   * @param {string} category - Category name
   * @returns {Logger} - Logger instance
   */
  getLogger(category) {
    if (!this.loggers.has(category)) {
      this.loggers.set(category, new Logger(category));
    }
    return this.loggers.get(category);
  }

  /**
   * Get all created loggers
   * @returns {Map<string, Logger>} - Map of loggers
   */
  getAllLoggers() {
    return this.loggers;
  }
}

// Export singleton instance
const factory = new LoggerFactory();

module.exports = {
  // Logger instance
  Logger,
  LoggerFactory,

  // Factory for getting loggers
  getLogger: (category) => factory.getLogger(category),

  // Log levels
  LOG_LEVELS,

  // Log directory path
  LOG_DIR,

  // Utility functions
  ensureLogDirectory,
  getDateString,
  getTimestamp
};
