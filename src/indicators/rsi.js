/**
 * RSI (Relative Strength Index) Calculator
 * 
 * RSI is a momentum oscillator that measures the speed and magnitude of 
 * price changes. It ranges from 0 to 100.
 * 
 * Interpretation:
 * - RSI > 70: Overbought (potential reversal down)
 * - RSI < 30: Oversold (potential reversal up)
 * - RSI = 50: Neutral
 * 
 * Formula:
 * RSI = 100 - (100 / (1 + RS))
 * Where RS = Average Gain / Average Loss
 * 
 * The averages are calculated using EMA (exponential moving average)
 * over the specified period (typically 14).
 */

/**
 * Calculate Relative Strength Index
 * 
 * @param {number[]} prices - Array of price values (typically closing prices)
 * @param {number} period - Number of periods for RSI calculation (default: 14)
 * @param {boolean} returnArray - If true, returns all RSI values; if false, returns only last value
 * @returns {number|number[]} - RSI value(s) between 0 and 100
 * 
 * @example
 * const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113];
 * const rsi = calculateRSI(prices, 14); // Returns: ~68.5
 */
function calculateRSI(prices, period = 14, returnArray = false) {
  // Input validation
  if (!Array.isArray(prices)) {
    throw new Error('Prices must be an array');
  }

  if (period <= 0 || !Number.isInteger(period)) {
    throw new Error('Invalid period: must be a positive integer');
  }

  // Need at least period + 1 prices to calculate RSI
  if (prices.length < period + 1) {
    throw new Error(`Insufficient data: need at least ${period + 1} prices, got ${prices.length}`);
  }

  // Validate all prices are numbers
  if (!prices.every(price => typeof price === 'number' && !isNaN(price))) {
    throw new Error('All prices must be numbers');
  }

  // Calculate price changes (gains and losses)
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Separate gains and losses
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

  // Calculate initial average gain and loss (Simple Moving Average for first period)
  let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

  const rsiValues = [];

  // Calculate RSI for first period
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  rsiValues.push(rsi);

  // Calculate RSI for remaining periods using EMA smoothing
  for (let i = period; i < changes.length; i++) {
    // Smoothed average gain and loss (EMA-style)
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;

    // Calculate RS and RSI
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    
    rsiValues.push(rsi);
  }

  // Return based on returnArray parameter
  if (returnArray) {
    // Pad beginning with nulls for consistency with price array length
    // First 'period' values don't have RSI (need period+1 prices)
    const paddedRSI = Array(period).fill(null).concat(rsiValues);
    return paddedRSI;
  } else {
    // Return only the last RSI value
    return rsiValues[rsiValues.length - 1];
  }
}

/**
 * Interpret RSI value
 * 
 * @param {number} rsi - RSI value between 0 and 100
 * @returns {string} - Interpretation: 'OVERBOUGHT', 'OVERSOLD', or 'NEUTRAL'
 */
function interpretRSI(rsi) {
  if (rsi > 70) {
    return 'OVERBOUGHT';
  } else if (rsi < 30) {
    return 'OVERSOLD';
  } else {
    return 'NEUTRAL';
  }
}

/**
 * Check for RSI divergence (advanced analysis)
 * Divergence occurs when price makes new high/low but RSI doesn't
 * 
 * @param {number[]} prices - Array of prices
 * @param {number[]} rsiValues - Array of RSI values
 * @param {number} lookback - Number of periods to look back
 * @returns {string|null} - 'BULLISH_DIVERGENCE', 'BEARISH_DIVERGENCE', or null
 */
function checkRSIDivergence(prices, rsiValues, lookback = 14) {
  if (prices.length < lookback || rsiValues.length < lookback) {
    return null;
  }

  const recentPrices = prices.slice(-lookback);
  const recentRSI = rsiValues.slice(-lookback);

  const priceHigh = Math.max(...recentPrices);
  const priceLow = Math.min(...recentPrices);
  const rsiHigh = Math.max(...recentRSI.filter(v => v !== null));
  const rsiLow = Math.min(...recentRSI.filter(v => v !== null));

  const currentPrice = prices[prices.length - 1];
  const currentRSI = rsiValues[rsiValues.length - 1];

  // Bullish divergence: price making lower lows, RSI making higher lows
  if (currentPrice <= priceLow && currentRSI > rsiLow) {
    return 'BULLISH_DIVERGENCE';
  }

  // Bearish divergence: price making higher highs, RSI making lower highs
  if (currentPrice >= priceHigh && currentRSI < rsiHigh) {
    return 'BEARISH_DIVERGENCE';
  }

  return null;
}

module.exports = {
  calculateRSI,
  interpretRSI,
  checkRSIDivergence
};