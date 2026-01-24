/**
 * Scanner Module
 * Exports all scanning functions
 */

const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.SCANNER);

const {
  scanStocks,
  quickScan,
  deepScan
} = require('./main-scanner');

logger.debug('Scanner module initialized', { version: '1.0.0' });

module.exports = {
  scanStocks,
  quickScan,
  deepScan
};