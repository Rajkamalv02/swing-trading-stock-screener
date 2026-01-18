/**
 * Technical Indicators Module
 * Exports all indicator calculation functions
 */

const { calculateEMA, calculateSMA } = require('./ema');
const { calculateRSI, interpretRSI, checkRSIDivergence } = require('./rsi');
const { 
  calculateATR, 
  calculateTrueRange,
  calculateATRStopLoss,
  calculateATRPositionSize,
  interpretATR 
} = require('./atr');

module.exports = {
  // Moving Averages
  calculateEMA,
  calculateSMA,
  
  // Momentum Indicators
  calculateRSI,
  interpretRSI,
  checkRSIDivergence,
  
  // Volatility Indicators
  calculateATR,
  calculateTrueRange,
  calculateATRStopLoss,
  calculateATRPositionSize,
  interpretATR,
  
  // More indicators will be added here
  // calculateMACD,
  // calculateADX,
  // calculateBollingerBands,
  // calculateStochastic,
  // etc.
};