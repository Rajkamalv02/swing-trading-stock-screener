/**
 * ATR (Average True Range) Calculator
 * 
 * ATR is a volatility indicator that measures the average range of price movement.
 * It accounts for gaps by using "true range" which considers:
 * 1. Current high - current low
 * 2. |Current high - previous close| (gap up scenario)
 * 3. |Current low - previous close| (gap down scenario)
 * 
 * The ATR is the moving average of these true range values.
 * 
 * Uses:
 * - Position sizing (larger ATR = smaller position size)
 * - Stop-loss placement (e.g., stop at 2× ATR below entry)
 * - Volatility regime identification
 * - Risk management
 * 
 * Typical values (as % of price):
 * - Low volatility: ATR < 2% of price
 * - Medium volatility: ATR 2-5% of price
 * - High volatility: ATR > 5% of price
 */

/**
 * Calculate True Range for a single period
 * 
 * @param {Object} current - Current period data {high, low, close}
 * @param {Object} previous - Previous period data {close} (optional for first period)
 * @returns {number} - True Range value
 * 
 * @example
 * const tr = calculateTrueRange(
 *   { high: 110, low: 105, close: 108 },
 *   { close: 106 }
 * ); // Returns: 5
 */
function calculateTrueRange(current, previous = null) {
  const { high, low } = current;
  
  // If no previous close (first period), TR = high - low
  if (!previous || previous.close === undefined) {
    return high - low;
  }
  
  const prevClose = previous.close;
  
  // Calculate three ranges
  const range1 = high - low;                    // Current range
  const range2 = Math.abs(high - prevClose);    // Gap up scenario
  const range3 = Math.abs(low - prevClose);     // Gap down scenario
  
  // True Range is the maximum of these three
  return Math.max(range1, range2, range3);
}

/**
 * Calculate Average True Range
 * 
 * @param {Array<Object>} data - Array of {high, low, close} objects
 * @param {number} period - Number of periods for ATR calculation (default: 14)
 * @param {boolean} returnArray - If true, returns all ATR values; if false, returns only last value
 * @returns {number|number[]} - ATR value(s)
 * 
 * @example
 * const data = [
 *   { high: 110, low: 105, close: 108 },
 *   { high: 112, low: 107, close: 110 },
 *   // ... more data
 * ];
 * const atr = calculateATR(data, 14); // Returns: 2.5
 */
function calculateATR(data, period = 14, returnArray = false) {
  // Input validation
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  if (period <= 0 || !Number.isInteger(period)) {
    throw new Error('Invalid period: must be a positive integer');
  }

  if (data.length < period) {
    throw new Error(`Insufficient data: need at least ${period} data points, got ${data.length}`);
  }

  // Validate data structure
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    if (!candle.high || !candle.low || !candle.close) {
      throw new Error('Each data point must have high, low, and close properties');
    }
    
    if (typeof candle.high !== 'number' || typeof candle.low !== 'number' || typeof candle.close !== 'number') {
      throw new Error('high, low, and close must be numbers');
    }
    
    if (isNaN(candle.high) || isNaN(candle.low) || isNaN(candle.close)) {
      throw new Error('high, low, and close must be valid numbers');
    }
  }

  // Calculate True Range for all periods
  const trueRanges = [];
  
  // First period: TR = high - low (no previous close)
  trueRanges.push(calculateTrueRange(data[0]));
  
  // Remaining periods: TR considers previous close
  for (let i = 1; i < data.length; i++) {
    const tr = calculateTrueRange(data[i], data[i - 1]);
    trueRanges.push(tr);
  }

  // Calculate initial ATR using SMA of first 'period' true ranges
  let currentATR = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
  
  const atrValues = [currentATR];

  // Calculate remaining ATR values using smoothing (EMA-style)
  // ATR = ((Previous ATR × (period - 1)) + Current TR) / period
  for (let i = period; i < trueRanges.length; i++) {
    currentATR = ((currentATR * (period - 1)) + trueRanges[i]) / period;
    atrValues.push(currentATR);
  }

  // Return based on returnArray parameter
  if (returnArray) {
    // Pad beginning with nulls for consistency with data array length
    // First 'period - 1' values don't have ATR yet
    const paddedATR = Array(period - 1).fill(null).concat(atrValues);
    return paddedATR;
  } else {
    // Return only the last ATR value
    return atrValues[atrValues.length - 1];
  }
}

/**
 * Calculate stop-loss level based on ATR
 * 
 * @param {number} entryPrice - Entry price for the trade
 * @param {number} atr - Current ATR value
 * @param {number} multiplier - ATR multiplier for stop distance (default: 2)
 * @param {string} direction - Trade direction: 'LONG' or 'SHORT'
 * @returns {number} - Stop-loss price level
 * 
 * @example
 * const stopLoss = calculateATRStopLoss(2500, 15, 2, 'LONG');
 * // For long trade: 2500 - (15 × 2) = 2470
 */
function calculateATRStopLoss(entryPrice, atr, multiplier = 2, direction = 'LONG') {
  if (direction.toUpperCase() === 'LONG') {
    return entryPrice - (atr * multiplier);
  } else {
    return entryPrice + (atr * multiplier);
  }
}

/**
 * Calculate position size based on ATR and risk amount
 * 
 * @param {number} accountSize - Total account size
 * @param {number} riskPercent - Percentage of account to risk (e.g., 1 for 1%)
 * @param {number} entryPrice - Entry price for the trade
 * @param {number} atr - Current ATR value
 * @param {number} atrMultiplier - ATR multiplier for stop distance (default: 2)
 * @returns {number} - Number of shares/contracts to trade
 * 
 * @example
 * const shares = calculateATRPositionSize(100000, 1, 2500, 15, 2);
 * // Risk: ₹1000 (1% of 100k)
 * // Stop distance: 15 × 2 = 30
 * // Shares: 1000 / 30 = 33 shares
 */
function calculateATRPositionSize(accountSize, riskPercent, entryPrice, atr, atrMultiplier = 2) {
  const riskAmount = accountSize * (riskPercent / 100);
  const stopDistance = atr * atrMultiplier;
  const shares = Math.floor(riskAmount / stopDistance);
  
  return shares;
}

/**
 * Interpret ATR value relative to price
 * 
 * @param {number} atr - Current ATR value
 * @param {number} price - Current price
 * @returns {Object} - Interpretation with percentage and category
 * 
 * @example
 * const interpretation = interpretATR(15, 2500);
 * // Returns: { percent: 0.6, category: 'LOW', description: 'Low volatility' }
 */
function interpretATR(atr, price) {
  const percent = (atr / price) * 100;
  
  let category, description;
  
  if (percent < 2) {
    category = 'LOW';
    description = 'Low volatility - tight trading range';
  } else if (percent < 5) {
    category = 'MEDIUM';
    description = 'Medium volatility - normal trading conditions';
  } else {
    category = 'HIGH';
    description = 'High volatility - wide price swings';
  }
  
  return {
    percent: parseFloat(percent.toFixed(2)),
    category,
    description
  };
}

module.exports = {
  calculateATR,
  calculateTrueRange,
  calculateATRStopLoss,
  calculateATRPositionSize,
  interpretATR
};