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
const {
  calculateMACD,
  interpretMACD,
  detectMACDDivergence,
  getMACDMomentum
} = require('./macd');

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
  
  // More indicators to be added:
  // calculateBollingerBands,
  // calculateADX,
  // calculateStochastic,
  // calculateParabolicSAR,
  // calculateIchimoku,
  // calculateOBV,
  // calculateFibonacci
};