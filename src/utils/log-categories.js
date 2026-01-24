/**
 * Log Categories - Centralized category definitions
 * 
 * Defines all logging categories used throughout the application
 * Provides a single source of truth for consistency
 */

// Define all log categories
const LOG_CATEGORIES = {
  // Core modules
  SCANNER: 'scanner',
  INDICATORS: 'indicators',
  SCORING: 'scoring',
  DATA_FETCHER: 'data-fetcher',
  
  // Utilities and helpers
  UTILS: 'utils',
  VALIDATORS: 'validators',
  LOGGER: 'logger',
  
  // API and integration
  API: 'api',
  EXTERNAL_API: 'external-api',
  
  // Performance and monitoring
  PERFORMANCE: 'performance',
  METRICS: 'metrics',
  
  // Errors and debugging
  ERROR: 'error',
  DEBUG: 'debug'
};

module.exports = LOG_CATEGORIES;
