const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.SCORING);

logger.debug('Scoring module initialized', { version: '1.0.0' });

const {
  scoreStock,
  calculateTrendAlignmentScore,
  detectSetupPattern,
  calculateRSIScore,
  calculateMACDScore,
  calculateVolumeScore,
  calculateBollingerScore,
  calculateMarketRegimeScore,
  generateReasoning
} = require('./scoring-engine');

module.exports = {
  scoreStock,
  calculateTrendAlignmentScore,
  detectSetupPattern,
  calculateRSIScore,
  calculateMACDScore,
  calculateVolumeScore,
  calculateBollingerScore,
  calculateMarketRegimeScore,
  generateReasoning
};