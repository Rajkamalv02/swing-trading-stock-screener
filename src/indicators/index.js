/**
 * Technical Indicators Module
 * Exports all indicator calculation functions
 */

const { calculateEMA, calculateSMA } = require('./ema');
const { calculateRSI, interpretRSI, checkRSIDivergence } = require('./rsi');

module.exports = {
  // Moving Averages
  calculateEMA,
  calculateSMA,
  
  // Momentum Indicators
  calculateRSI,
  interpretRSI,
  checkRSIDivergence,
  
  // More indicators will be added here
  // calculateMACD,
  // calculateATR,
  // calculateADX,
  // etc.
};