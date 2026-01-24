const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.INDICATORS);

const { calculateEMA, calculateSMA } = require('./ema');
const { calculateRSI, interpretRSI, checkRSIDivergence } = require('./rsi');
const { 
  calculateATR, 
  calculateTrueRange,
  calculateATRStopLoss,
  calculateATRPositionSize,
  interpretATR 
} = require('./atr');
const {
  calculateMACD,
  interpretMACD,
  detectMACDDivergence,
  getMACDMomentum
} = require('./macd');
const {
  calculateBollingerBands,
  interpretBollingerBands,
  detectBollingerSqueeze,
  detectBandWalk
} = require('./bollinger-bands');
const {
  calculateADX,
  interpretADX,
  isTrendTradeable,
  detectDICrossover
} = require('./adx');

logger.debug('Indicators module initialized', { 
  indicators: ['EMA', 'SMA', 'RSI', 'MACD', 'ATR', 'ADX', 'Bollinger Bands']
});

module.exports = {
  // Moving Averages
  calculateEMA,
  calculateSMA,
  
  // Momentum Indicators
  calculateRSI,
  interpretRSI,
  checkRSIDivergence,
  
  calculateMACD,
  interpretMACD,
  detectMACDDivergence,
  getMACDMomentum,
  
  // Volatility Indicators
  calculateATR,
  calculateTrueRange,
  calculateATRStopLoss,
  calculateATRPositionSize,
  interpretATR,
  
  calculateBollingerBands,
  interpretBollingerBands,
  detectBollingerSqueeze,
  detectBandWalk,
  
  // Trend Strength Indicators
  calculateADX,
  interpretADX,
  isTrendTradeable,
  detectDICrossover,
  
  // More indicators can be added:
  // calculateStochastic,
  // calculateParabolicSAR,
  // calculateIchimoku,
  // calculateOBV
};