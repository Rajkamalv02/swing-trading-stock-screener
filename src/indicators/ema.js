/**
 * EMA (Exponential Moving Average) Calculator
 * 
 * The EMA gives more weight to recent prices, making it more responsive
 * to new information than a Simple Moving Average (SMA).
 * 
 * Formula:
 * EMA(today) = (Price(today) × Multiplier) + (EMA(yesterday) × (1 - Multiplier))
 * Where Multiplier = 2 / (Period + 1)
 * 
 * For the first EMA value, we use SMA as the starting point.
 */

/**
 * Calculate Exponential Moving Average
 * 
 * @param {number[]} prices - Array of price values (typically closing prices)
 * @param {number} period - Number of periods for EMA calculation
 * @param {boolean} returnArray - If true, returns all EMA values; if false, returns only last value
 * @returns {number|number[]} - EMA value(s)
 * 
 * @example
 * const prices = [100, 102, 104, 106, 108];
 * const ema = calculateEMA(prices, 3); // Returns: 106.5
 */
function calculateEMA(prices, period, returnArray = false) {
  // Input validation
  if (!Array.isArray(prices)) {
    throw new Error('Prices must be an array');
  }

  if (period <= 0 || !Number.isInteger(period)) {
    throw new Error('Invalid period: must be a positive integer');
  }

  if (prices.length < period) {
    throw new Error(`Insufficient data: need at least ${period} prices, got ${prices.length}`);
  }

  // Validate all prices are numbers
  if (!prices.every(price => typeof price === 'number' && !isNaN(price))) {
    throw new Error('All prices must be numbers');
  }

  // Calculate multiplier (smoothing factor)
  const multiplier = 2 / (period + 1);
  
  // Calculate initial SMA as starting point for EMA
  const initialSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  // Initialize EMA array
  const emaValues = [initialSMA];
  
  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    const currentPrice = prices[i];
    const previousEMA = emaValues[emaValues.length - 1];
    
    // EMA formula: (Price × Multiplier) + (Previous EMA × (1 - Multiplier))
    const currentEMA = (currentPrice * multiplier) + (previousEMA * (1 - multiplier));
    
    emaValues.push(currentEMA);
  }
  
  // Return based on returnArray parameter
  if (returnArray) {
    // Pad beginning with nulls for consistency with price array length
    const paddedEMA = Array(period - 1).fill(null).concat(emaValues);
    return paddedEMA;
  } else {
    // Return only the last EMA value
    return emaValues[emaValues.length - 1];
  }
}

/**
 * Calculate Simple Moving Average (helper function for EMA initialization)
 * 
 * @param {number[]} prices - Array of price values
 * @param {number} period - Number of periods for SMA calculation
 * @returns {number} - SMA value
 */
function calculateSMA(prices, period) {
  if (prices.length < period) {
    throw new Error(`Insufficient data for SMA: need ${period} prices, got ${prices.length}`);
  }
  
  const sum = prices.slice(0, period).reduce((acc, price) => acc + price, 0);
  return sum / period;
}

module.exports = {
  calculateEMA,
  calculateSMA
};