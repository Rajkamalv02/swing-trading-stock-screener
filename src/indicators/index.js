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

  // More indicators to be added:
  // calculateADX,
  // calculateStochastic,
  // calculateParabolicSAR,
  // calculateIchimoku,
  // calculateOBV
};