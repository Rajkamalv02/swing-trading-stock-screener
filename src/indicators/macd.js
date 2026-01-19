/**
 * MACD (Moving Average Convergence Divergence) Calculator
 * 
 * MACD is a trend-following momentum indicator that shows the relationship
 * between two moving averages of a security's price.
 * 
 * Components:
 * - MACD Line: Fast EMA (12) - Slow EMA (26)
 * - Signal Line: EMA (9) of MACD Line
 * - Histogram: MACD Line - Signal Line
 * 
 * Signals:
 * - MACD Line crosses above Signal Line: Bullish
 * - MACD Line crosses below Signal Line: Bearish
 * - Histogram growing: Momentum increasing
 * - Histogram shrinking: Momentum decreasing
 * - MACD crosses above 0: Bullish trend
 * - MACD crosses below 0: Bearish trend
 */

const { calculateEMA } = require('./ema');

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * 
 * @param {number[]} prices - Array of price values (typically closing prices)
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line EMA period (default: 9)
 * @param {boolean} returnArray - If true, returns arrays; if false, returns only last values
 * @returns {Object} - MACD values {macdLine, signalLine, histogram}
 * 
 * @example
 * const prices = [100, 102, 104, 103, 105, ...];
 * const macd = calculateMACD(prices); // Uses default 12, 26, 9
 * console.log(macd); // { macdLine: 2.5, signalLine: 1.8, histogram: 0.7 }
 */
function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9, returnArray = false) {
  // Input validation
  if (!Array.isArray(prices)) {
    throw new Error('Prices must be an array');
  }

  if (fastPeriod <= 0 || slowPeriod <= 0 || signalPeriod <= 0) {
    throw new Error('Invalid period: all periods must be positive integers');
  }

  if (!Number.isInteger(fastPeriod) || !Number.isInteger(slowPeriod) || !Number.isInteger(signalPeriod)) {
    throw new Error('Invalid period: all periods must be integers');
  }

  if (fastPeriod >= slowPeriod) {
    throw new Error('Fast period must be less than slow period');
  }

  // Need enough data for slow EMA + signal EMA
  const minDataPoints = slowPeriod + signalPeriod;
  if (prices.length < minDataPoints) {
    throw new Error(`Insufficient data: need at least ${minDataPoints} prices, got ${prices.length}`);
  }

  // Validate all prices are numbers
  if (!prices.every(price => typeof price === 'number' && !isNaN(price))) {
    throw new Error('All prices must be numbers');
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(prices, fastPeriod, true);
  const slowEMA = calculateEMA(prices, slowPeriod, true);

  // Calculate MACD Line (fast EMA - slow EMA)
  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate Signal Line (EMA of MACD Line)
  // Filter out nulls for signal calculation
  const macdValues = macdLine.filter(v => v !== null);
  const signalLineValues = calculateEMA(macdValues, signalPeriod, true);

  // Reconstruct signal line array with nulls in proper positions
  const signalLine = [];
  let signalIndex = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
    } else {
      signalLine.push(signalLineValues[signalIndex]);
      signalIndex++;
    }
  }

  // Calculate Histogram (MACD Line - Signal Line)
  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(macdLine[i] - signalLine[i]);
    }
  }

  // Return based on returnArray parameter
  if (returnArray) {
    return {
      macdLine,
      signalLine,
      histogram
    };
  } else {
    // Return only the last values
    return {
      macdLine: macdLine[macdLine.length - 1],
      signalLine: signalLine[signalLine.length - 1],
      histogram: histogram[histogram.length - 1]
    };
  }
}

/**
 * Interpret MACD signal
 * 
 * @param {Object} macd - MACD values {macdLine, signalLine, histogram}
 * @param {Object} prevMACD - Previous MACD values (optional, for crossover detection)
 * @returns {Object} - Interpretation with signal and description
 * 
 * @example
 * const interpretation = interpretMACD(
 *   { macdLine: 2.5, signalLine: 1.8, histogram: 0.7 },
 *   { macdLine: 1.2, signalLine: 1.9, histogram: -0.7 }
 * );
 * // Returns: { signal: 'BULLISH_CROSSOVER', ... }
 */
function interpretMACD(macd, prevMACD = null) {
  const { macdLine, signalLine, histogram } = macd;

  // Check for crossovers if previous MACD provided
  if (prevMACD) {
    // Bullish crossover: MACD crosses above signal
    if (prevMACD.histogram < 0 && histogram > 0) {
      return {
        signal: 'BULLISH_CROSSOVER',
        description: 'MACD line crossed above signal line - bullish signal',
        strength: 'STRONG'
      };
    }

    // Bearish crossover: MACD crosses below signal
    if (prevMACD.histogram > 0 && histogram < 0) {
      return {
        signal: 'BEARISH_CROSSOVER',
        description: 'MACD line crossed below signal line - bearish signal',
        strength: 'STRONG'
      };
    }
  }
  
  // Histogram analysis (momentum strength)
  let momentumStrength;
  if (Math.abs(histogram) > 2) {
    momentumStrength = 'STRONG';
  } else if (Math.abs(histogram) > 0.5) {
    momentumStrength = 'MODERATE';
  } else {
    momentumStrength = 'WEAK';
  }
  
  // Overall signal based on current position
  let signal, description;
  
  if (macdLine > 0 && histogram > 0) {
    signal = 'BULLISH';
    description = 'MACD positive and above signal line - strong uptrend';
  } else if (macdLine > 0 && histogram < 0) {
    signal = 'BULLISH_WEAKENING';
    description = 'MACD positive but below signal line - uptrend losing momentum';
  } else if (macdLine < 0 && histogram < 0) {
    signal = 'BEARISH';
    description = 'MACD negative and below signal line - strong downtrend';
  } else if (macdLine < 0 && histogram > 0) {
    signal = 'BEARISH_WEAKENING';
    description = 'MACD negative but above signal line - downtrend losing momentum';
  } else {
    signal = 'NEUTRAL';
    description = 'MACD near zero - no clear trend';
  }
  
  return {
    signal,
    description,
    strength: momentumStrength,
    macdLine: parseFloat(macdLine.toFixed(2)),
    signalLine: parseFloat(signalLine.toFixed(2)),
    histogram: parseFloat(histogram.toFixed(2))
  };
}

/**
 * Detect MACD divergence (price vs MACD disagreement)
 * 
 * @param {number[]} prices - Array of prices
 * @param {number[]} macdHistogram - Array of MACD histogram values
 * @param {number} lookback - Number of periods to look back (default: 14)
 * @returns {string|null} - 'BULLISH_DIVERGENCE', 'BEARISH_DIVERGENCE', or null
 * 
 * @example
 * const divergence = detectMACDDivergence(prices, macdHistogram, 14);
 * // Returns: 'BULLISH_DIVERGENCE' if price lower lows but MACD higher lows
 */
function detectMACDDivergence(prices, macdHistogram, lookback = 14) {
  if (prices.length < lookback || macdHistogram.length < lookback) {
    return null;
  }

  // Get recent data
  const recentPrices = prices.slice(-lookback);
  const recentMACD = macdHistogram.slice(-lookback).filter(v => v !== null);
  
  if (recentMACD.length < lookback) {
    return null;
  }
  
  // Find highs and lows
  const priceHigh = Math.max(...recentPrices);
  const priceLow = Math.min(...recentPrices);
  const macdHigh = Math.max(...recentMACD);
  const macdLow = Math.min(...recentMACD);
  
  const currentPrice = prices[prices.length - 1];
  const currentMACD = recentMACD[recentMACD.length - 1];
  
  // Bullish divergence: price making lower lows, MACD making higher lows
  if (currentPrice <= priceLow && currentMACD > macdLow) {
    return 'BULLISH_DIVERGENCE';
  }
  
  // Bearish divergence: price making higher highs, MACD making lower highs
  if (currentPrice >= priceHigh && currentMACD < macdHigh) {
    return 'BEARISH_DIVERGENCE';
  }
  
  return null;
}

/**
 * Check if MACD histogram is expanding or contracting
 * 
 * @param {number[]} histogram - Array of histogram values
 * @param {number} periods - Number of periods to analyze (default: 3)
 * @returns {string} - 'EXPANDING', 'CONTRACTING', or 'FLAT'
 */
function getMACDMomentum(histogram, periods = 3) {
  if (histogram.length < periods + 1) {
    return 'INSUFFICIENT_DATA';
  }

  // Get recent histogram values (filter nulls)
  const recentValues = histogram.slice(-periods - 1).filter(v => v !== null);
  
  if (recentValues.length < periods + 1) {
    return 'INSUFFICIENT_DATA';
  }
  
  // Check if absolute values are increasing (expanding) or decreasing (contracting)
  const absValues = recentValues.map(v => Math.abs(v));
  
  let expanding = 0;
  let contracting = 0;
  
  for (let i = 1; i < absValues.length; i++) {
    if (absValues[i] > absValues[i - 1]) {
      expanding++;
    } else if (absValues[i] < absValues[i - 1]) {
      contracting++;
    }
  }
  
  if (expanding > contracting) {
    return 'EXPANDING';
  } else if (contracting > expanding) {
    return 'CONTRACTING';
  } else {
    return 'FLAT';
  }
}

module.exports = {
  calculateMACD,
  interpretMACD,
  detectMACDDivergence,
  getMACDMomentum
};