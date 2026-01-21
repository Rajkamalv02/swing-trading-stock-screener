const { calculateATR } = require('./atr');

/**
 * Calculate ADX (Average Directional Index)
 * 
 * @param {Array<Object>} data - Array of {high, low, close} objects
 * @param {number} period - Number of periods for ADX calculation (default: 14)
 * @param {boolean} returnArray - If true, returns arrays; if false, returns only last values
 * @returns {Object} - ADX values {adx, plusDI, minusDI}
 * 
 * @example
 * const data = [
 *   { high: 110, low: 105, close: 108 },
 *   { high: 112, low: 107, close: 110 },
 *   // ... more data
 * ];
 * const adx = calculateADX(data, 14); // Returns: { adx: 28.5, plusDI: 32.1, minusDI: 18.3 }
 */
function calculateADX(data, period = 14, returnArray = false) {
  // Input validation
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  if (period <= 0 || !Number.isInteger(period)) {
    throw new Error('Invalid period: must be a positive integer');
  }

  // Need enough data: period for initial smoothing + period for ADX smoothing
  const minDataPoints = period * 2;
  if (data.length < minDataPoints) {
    throw new Error(`Insufficient data: need at least ${minDataPoints} data points, got ${data.length}`);
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

  // Calculate +DM (Plus Directional Movement) and -DM (Minus Directional Movement)
  const plusDM = [];
  const minusDM = [];

  for (let i = 1; i < data.length; i++) {
    const highDiff = data[i].high - data[i - 1].high;
    const lowDiff = data[i - 1].low - data[i].low;

    // +DM: upward movement
    if (highDiff > lowDiff && highDiff > 0) {
      plusDM.push(highDiff);
    } else {
      plusDM.push(0);
    }

    // -DM: downward movement
    if (lowDiff > highDiff && lowDiff > 0) {
      minusDM.push(lowDiff);
    } else {
      minusDM.push(0);
    }
  }

  // Calculate ATR (Average True Range)
  const atrArray = calculateATR(data, period, true);
  const atrValues = atrArray.filter(v => v !== null);

  // Smooth +DM and -DM using Wilder's smoothing (similar to EMA)
  const smoothedPlusDM = [];
  const smoothedMinusDM = [];

  // Initial smoothed values (SMA of first period)
  let sumPlusDM = plusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0);
  let sumMinusDM = minusDM.slice(0, period).reduce((sum, dm) => sum + dm, 0);

  smoothedPlusDM.push(sumPlusDM);
  smoothedMinusDM.push(sumMinusDM);

  // Subsequent smoothed values using Wilder's formula
  for (let i = period; i < plusDM.length; i++) {
    sumPlusDM = sumPlusDM - (sumPlusDM / period) + plusDM[i];
    sumMinusDM = sumMinusDM - (sumMinusDM / period) + minusDM[i];

    smoothedPlusDM.push(sumPlusDM);
    smoothedMinusDM.push(sumMinusDM);
  }

  // Calculate +DI and -DI
  const plusDI = [];
  const minusDI = [];

  for (let i = 0; i < smoothedPlusDM.length; i++) {
    const atr = atrValues[i + 1];

    if (atr === 0) {
      plusDI.push(0);
      minusDI.push(0);
    } else {
      // ATR is an average, but smoothedPlusDM is a sum. 
      // Convert ATR to sum by multiplying by period
      const trSum = atr * period;
      plusDI.push((smoothedPlusDM[i] / trSum) * 100);
      minusDI.push((smoothedMinusDM[i] / trSum) * 100);
    }
  }

  // Calculate DX (Directional Movement Index)
  const dx = [];

  for (let i = 0; i < plusDI.length; i++) {
    const diSum = plusDI[i] + minusDI[i];

    if (diSum === 0) {
      dx.push(0);
    } else {
      const diDiff = Math.abs(plusDI[i] - minusDI[i]);
      dx.push((diDiff / diSum) * 100);
    }
  }

  // Calculate ADX (smoothed DX)
  const adxValues = [];

  // Initial ADX (SMA of first period DX values)
  let adx = dx.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  adxValues.push(adx);

  // Subsequent ADX values using Wilder's smoothing
  for (let i = period; i < dx.length; i++) {
    adx = ((adx * (period - 1)) + dx[i]) / period;
    adxValues.push(adx);
  }

  // Prepare output arrays with proper null padding
  const outputADX = [];
  const outputPlusDI = [];
  const outputMinusDI = [];

  // Null padding: need period-1 for initial smoothing + period for ADX smoothing
  const nullPadding = (period * 2) - 1;

  for (let i = 0; i < data.length; i++) {
    if (i < nullPadding) {
      outputADX.push(null);
      outputPlusDI.push(null);
      outputMinusDI.push(null);
    } else {
      const index = i - nullPadding;
      if (index >= adxValues.length) {
        // Debugging log (can remove later)
        // console.log(`Index out of bounds: i=${i}, nullPadding=${nullPadding}, index=${index}, adxValues.length=${adxValues.length}`);
      }
      outputADX.push(adxValues[index] ?? null);

      // Fixed logic was: plusDI[index + period - 1]
      // smoothedPlusDM length = N - period.
      // plusDI length = smoothedPlusDM.length.
      // max index = N - period - 1.
      // index goes up to N - 2*period.
      // index + period - 1 max = N - period - 1.
      outputPlusDI.push(plusDI[index + period - 1] ?? null);
      outputMinusDI.push(minusDI[index + period - 1] ?? null);
    }
  }

  // Return based on returnArray parameter
  if (returnArray) {
    return {
      adx: outputADX,
      plusDI: outputPlusDI,
      minusDI: outputMinusDI
    };
  } else {
    // Return only the last values
    return {
      adx: outputADX[outputADX.length - 1],
      plusDI: outputPlusDI[outputPlusDI.length - 1],
      minusDI: outputMinusDI[outputMinusDI.length - 1]
    };
  }
}

/**
 * Interpret ADX value
 * 
 * @param {Object} adx - ADX values {adx, plusDI, minusDI}
 * @returns {Object} - Interpretation with signal and description
 * 
 * @example
 * const interpretation = interpretADX({ adx: 28.5, plusDI: 32.1, minusDI: 18.3 });
 * // Returns: { trendStrength: 'STRONG', direction: 'BULLISH', ... }
 */
function interpretADX(adx) {
  const { adx: adxValue, plusDI, minusDI } = adx;

  // Determine trend strength
  let trendStrength, strengthDescription;

  if (adxValue < 20) {
    trendStrength = 'WEAK';
    strengthDescription = 'Weak trend or ranging market - avoid trend trading';
  } else if (adxValue < 25) {
    trendStrength = 'EMERGING';
    strengthDescription = 'Trend starting to develop - watch for confirmation';
  } else if (adxValue < 50) {
    trendStrength = 'STRONG';
    strengthDescription = 'Strong trend - good for trend trading';
  } else if (adxValue < 75) {
    trendStrength = 'VERY_STRONG';
    strengthDescription = 'Very strong trend - momentum trading opportunity';
  } else {
    trendStrength = 'EXTREME';
    strengthDescription = 'Extremely strong trend - caution: may be overextended';
  }

  // Determine trend direction
  let direction, directionDescription;

  if (plusDI > minusDI) {
    direction = 'BULLISH';
    directionDescription = '+DI > -DI indicates uptrend';
  } else if (minusDI > plusDI) {
    direction = 'BEARISH';
    directionDescription = '-DI > +DI indicates downtrend';
  } else {
    direction = 'NEUTRAL';
    directionDescription = '+DI = -DI indicates no clear direction';
  }

  // Overall signal
  let signal;

  if (trendStrength === 'WEAK') {
    signal = 'NO_TRADE';
  } else if (direction === 'BULLISH') {
    signal = 'TREND_LONG';
  } else if (direction === 'BEARISH') {
    signal = 'TREND_SHORT';
  } else {
    signal = 'WAIT';
  }

  return {
    signal,
    trendStrength,
    strengthDescription,
    direction,
    directionDescription,
    adx: parseFloat(adxValue.toFixed(2)),
    plusDI: parseFloat(plusDI.toFixed(2)),
    minusDI: parseFloat(minusDI.toFixed(2))
  };
}

/**
 * Check if trend is tradeable based on ADX
 * 
 * @param {number} adxValue - ADX value
 * @param {number} threshold - Minimum ADX threshold (default: 20)
 * @returns {boolean} - True if trend is strong enough to trade
 */
function isTrendTradeable(adxValue, threshold = 20) {
  return adxValue >= threshold;
}

/**
 * Detect DI crossover (potential trend change)
 * 
 * @param {Object} currentADX - Current ADX values {adx, plusDI, minusDI}
 * @param {Object} previousADX - Previous ADX values {adx, plusDI, minusDI}
 * @returns {string|null} - 'BULLISH_CROSSOVER', 'BEARISH_CROSSOVER', or null
 */
function detectDICrossover(currentADX, previousADX) {
  if (!previousADX) {
    return null;
  }

  const { plusDI: currentPlus, minusDI: currentMinus } = currentADX;
  const { plusDI: prevPlus, minusDI: prevMinus } = previousADX;

  // Bullish crossover: +DI crosses above -DI
  if (prevPlus <= prevMinus && currentPlus > currentMinus) {
    return 'BULLISH_CROSSOVER';
  }

  // Bearish crossover: -DI crosses above +DI
  if (prevMinus <= prevPlus && currentMinus > currentPlus) {
    return 'BEARISH_CROSSOVER';
  }

  return null;
}

module.exports = {
  calculateADX,
  interpretADX,
  isTrendTradeable,
  detectDICrossover
};