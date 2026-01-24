/**
 * Logger Configuration Reference
 * 
 * This file documents how to configure the logging system.
 * Copy settings as needed to customize for your environment.
 */

// ============================================
// LOG LEVELS
// ============================================

/**
 * LOG LEVELS (in order of severity):
 * 
 * 1. DEBUG (0)   - Detailed diagnostic information
 *    Use for: Variable values, function entry/exit, detailed tracing
 *    
 * 2. INFO (1)    - General information messages
 *    Use for: Important business events, milestones, completions
 *    
 * 3. WARN (2)    - Warning messages (potential issues)
 *    Use for: Degraded performance, fallback behaviors, recoverable errors
 *    
 * 4. ERROR (3)   - Error messages (something failed)
 *    Use for: Exceptions, failed operations, critical issues
 */

// Set minimum log level via environment variable
// LOG_LEVEL=DEBUG    # Show all logs
// LOG_LEVEL=INFO     # Default - show info and above
// LOG_LEVEL=WARN     # Show warnings and above
// LOG_LEVEL=ERROR    # Show only errors

// ============================================
// LOG DIRECTORY STRUCTURE
// ============================================

/**
 * Default location: project-root/logs/
 * 
 * Structure:
 * logs/
 * ├── scanner/
 * │   ├── scanner_2026-01-24.log
 * │   ├── scanner_2026-01-25.log
 * │   └── scanner_2026-01-26.log
 * ├── indicators/
 * │   └── indicators_YYYY-MM-DD.log
 * ├── scoring/
 * │   └── scoring_YYYY-MM-DD.log
 * ├── data-fetcher/
 * │   └── data-fetcher_YYYY-MM-DD.log
 * └── ... (one folder per category)
 * 
 * File naming: [category]_YYYY-MM-DD.log
 * - Automatically rotates daily
 * - Old logs preserved for audit trail
 * - Easy to archive/cleanup old files
 */

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * EXAMPLE 1: Initialize logger
 */
const { getLogger, LOG_CATEGORIES } = require('./utils');

// Create a logger for scanner module
const logger = getLogger(LOG_CATEGORIES.SCANNER);

/**
 * EXAMPLE 2: Log at different levels
 */

// DEBUG - Detailed diagnostic information
logger.debug('Entering processStock function', {
  symbol: 'RELIANCE.NS',
  days: 50,
  userId: 'user123'
});

// INFO - Important business events
logger.info('Stock processed successfully', {
  symbol: 'RELIANCE.NS',
  score: 87.5,
  classification: 'BULLISH',
  processingTime: 245
});

// WARN - Potential issues
logger.warn('Processing took longer than expected', {
  symbol: 'TCS.NS',
  expectedTime: 500,
  actualTime: 1200
});

// ERROR - Something failed
logger.error('Failed to fetch stock data', error);

/**
 * EXAMPLE 3: Custom metadata
 */
logger.info('API call completed', {
  endpoint: 'https://api.example.com/historical',
  method: 'GET',
  statusCode: 200,
  responseTime: 234,
  recordsReturned: 50
});

/**
 * EXAMPLE 4: Sensitive data masking
 */
// ❌ DON'T DO THIS:
// logger.info('Login', { username: 'john@example.com', password: 'secret123' });

// ✅ DO THIS:
logger.info('Authentication successful', {
  userId: 'john@example.com',
  timestamp: new Date().toISOString()
});

/**
 * EXAMPLE 5: Error logging with full context
 */
try {
  const data = await fetchStockData('RELIANCE.NS');
} catch (error) {
  logger.error('Stock data fetch failed', error);
  // Automatically captures:
  // - error.message
  // - error.stack
  // - error.name
}

/**
 * EXAMPLE 6: Performance tracking
 */
const startTime = Date.now();
const result = await heavyOperation();
const duration = Date.now() - startTime;

logger.info('Heavy operation completed', {
  operation: 'calculateIndicators',
  durationMs: duration,
  resultSize: result.length,
  throughput: Math.round(result.length / (duration / 1000)) // items/sec
});

/**
 * EXAMPLE 7: Batch processing with progress
 */
async function processBatch(items) {
  logger.info('Batch processing started', { count: items.length });
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await processItem(items[i]);
      results.push(result);
      
      // Log progress at intervals
      if ((i + 1) % 10 === 0) {
        logger.debug('Batch progress', {
          processed: i + 1,
          total: items.length,
          percentage: Math.round(((i + 1) / items.length) * 100)
        });
      }
    } catch (error) {
      errors.push({ item: items[i], error });
      logger.warn('Item processing failed', {
        item: items[i],
        error: error.message
      });
    }
  }
  
  logger.info('Batch processing completed', {
    total: items.length,
    successful: results.length,
    failed: errors.length,
    successRate: Math.round((results.length / items.length) * 100)
  });
  
  return { results, errors };
}

/**
 * EXAMPLE 8: Request/Response logging
 */
async function handleRequest(request) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  logger.info('Request received', {
    requestId,
    method: request.method,
    path: request.path,
    userId: request.userId
  });
  
  try {
    const response = await processRequest(request);
    const duration = Date.now() - startTime;
    
    logger.info('Request processed', {
      requestId,
      statusCode: 200,
      durationMs: duration
    });
    
    return response;
  } catch (error) {
    logger.error('Request processing failed', error);
    logger.info('Request error response', {
      requestId,
      statusCode: 500,
      errorType: error.name
    });
    
    throw error;
  }
}

/**
 * EXAMPLE 9: Structured audit trail
 */
function logAuditEvent(eventType, details) {
  logger.info(`AUDIT: ${eventType}`, {
    eventType,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    action: details.action,
    resource: details.resource,
    before: details.before,
    after: details.after,
    ipAddress: getClientIpAddress()
  });
}

// Usage:
logAuditEvent('PORTFOLIO_UPDATE', {
  action: 'UPDATE',
  resource: 'portfolio_id_123',
  before: { stocks: 5 },
  after: { stocks: 6 }
});

// ============================================
// ENVIRONMENT SETUP
// ============================================

/**
 * .env file example:
 */
// LOG_LEVEL=DEBUG        # Set to INFO for production
// LOG_DIR=./logs         # Can customize location
// ENABLE_FILE_LOGS=true  # Enable/disable file logging
// ENABLE_CONSOLE_LOGS=true  # Enable/disable console output

/**
 * package.json scripts:
 */
// "start": "node src/index.js",
// "dev": "LOG_LEVEL=DEBUG nodemon src/index.js",
// "test": "LOG_LEVEL=ERROR jest"

// ============================================
// BEST PRACTICES CHECKLIST
// ============================================

/**
 * ✅ DO:
 * - Use appropriate log levels
 * - Include relevant context
 * - Log entry/exit of critical functions
 * - Log timing for performance-critical operations
 * - Log errors with full error objects
 * - Use consistent message formats
 * - Log business-important events
 * - Include unique identifiers (request ID, user ID, etc.)
 * 
 * ❌ DON'T:
 * - Log sensitive data (passwords, tokens, PII)
 * - Log in tight loops without batching
 * - Use console.log instead of logger
 * - Log at wrong level (everything at INFO)
 * - Ignore log output in production
 * - Log without context/metadata
 * - Log stack traces for expected errors
 */

module.exports = {
  // This file is for documentation only
  // Logger is automatically configured in src/utils/logger.js
};
