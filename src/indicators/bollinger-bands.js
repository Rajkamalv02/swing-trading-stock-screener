/**
 * Bollinger Bands Calculator
 * 
 * Bollinger Bands are a volatility indicator consisting of three lines:
 * - Middle Band: Simple Moving Average (typically 20-period)
 * - Upper Band: Middle Band + (Standard Deviation × multiplier)
 * - Lower Band: Middle Band - (Standard Deviation × multiplier)
 * 
 * The bands expand during high volatility and contract during low volatility.
 * 
 * Uses:
 * - Identify overbought/oversold conditions
 * - Detect volatility squeezes (potential breakouts)
 * - Confirm trend strength (band walk)
 * - Mean reversion trading setups
 * 
 * Signals:
 * - Price touching upper band: Potentially overbought
 * - Price touching lower band: Potentially oversold
 * - Band squeeze (narrowing): Breakout imminent
 * - Band expansion: High volatility, strong move
 * - Band walk: Price hugging upper/lower band = strong trend
 */

const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.INDICATORS);

const { calculateSMA } = require('./ema');

/**
 * Calculate Standard Deviation
 * 
 * @param {number[]} values - Array of values
 * @param {number} mean - Mean of the values
 * @returns {number} - Standard deviation
 */
function calculateStandardDeviation(values, mean) {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
}

/**
 * Calculate Bollinger Bands
 * 
 * @param {number[]} prices - Array of price values (typically closing prices)
 * @param {number} period - Number of periods for SMA and StdDev (default: 20)
 * @param {number} stdDevMultiplier - Standard deviation multiplier (default: 2)
 * @param {boolean} returnArray - If true, returns arrays; if false, returns only last values
 * @returns {Object} - Bollinger Bands values {upper, middle, lower, bandwidth, percentB}
 * 
 * @example
 * const prices = [100, 102, 104, 103, 105, ...];
 * const bb = calculateBollingerBands(prices, 20, 2);
 * console.log(bb); // { upper: 108.5, middle: 103.2, lower: 97.9, bandwidth: 0.102, percentB: 0.65 }
 */
function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2, returnArray = false) {
    // Input validation
    if (!Array.isArray(prices)) {
        throw new Error('Prices must be an array');
    } if (period <= 0 || !Number.isInteger(period)) {
        throw new Error('Invalid period: must be a positive integer');
    } if (stdDevMultiplier <= 0) {
        throw new Error('Invalid standard deviation multiplier: must be positive');
    }
    if (prices.length < period) {
        throw new Error(`Insufficient data: need at least ${ period } prices, got ${ prices.length }`);
    }// Validate all prices are numbers
    if (!prices.every(price => typeof price === 'number' && !isNaN(price))) {
        throw new Error('All prices must be numbers');
    } const upperBand = [];
    const middleBand = [];
    const lowerBand = [];
    const bandwidth = [];
    const percentB = [];// Calculate for each period
    for (let i = 0; i < prices.length; i++) {
        if (i < period - 1) {
            // Not enough data yet
            upperBand.push(null);
            middleBand.push(null);
            lowerBand.push(null);
            bandwidth.push(null);
            percentB.push(null);
        } else {
            // Get the relevant price window
            const priceWindow = prices.slice(i - period + 1, i + 1);
            // Calculate middle band (SMA)
            const sma = priceWindow.reduce((sum, price) => sum + price, 0) / period;

            // Calculate standard deviation
            const stdDev = calculateStandardDeviation(priceWindow, sma);

            // Calculate upper and lower bands
            const upper = sma + (stdDev * stdDevMultiplier);
            const lower = sma - (stdDev * stdDevMultiplier);

            // Calculate bandwidth: (upper - lower) / middle
            const bw = (upper - lower) / sma;

            // Calculate %B: (price - lower) / (upper - lower)
            const currentPrice = prices[i];
            const pb = (upper - lower) === 0 ? 0.5 : (currentPrice - lower) / (upper - lower);

            upperBand.push(upper);
            middleBand.push(sma);
            lowerBand.push(lower);
            bandwidth.push(bw);
            percentB.push(pb);
        }
    }
    // Return based on returnArray parameter
    if (returnArray) {
        return {
            upper: upperBand,
            middle: middleBand,
            lower: lowerBand,
            bandwidth: bandwidth,
            percentB: percentB
        };
    } else {
        // Return only the last values
        return {
            upper: upperBand[upperBand.length - 1],
            middle: middleBand[middleBand.length - 1],
            lower: lowerBand[lowerBand.length - 1],
            bandwidth: bandwidth[bandwidth.length - 1],
            percentB: percentB[percentB.length - 1]
        };
    }
}
/**

Interpret Bollinger Bands position

@param {Object} bb - Bollinger Bands values {upper, middle, lower, bandwidth, percentB}
@param {number} currentPrice - Current price
@returns {Object} - Interpretation with signal and description

@example
const interpretation = interpretBollingerBands(bb, 105.5);
// Returns: { signal: 'OVERBOUGHT', position: 'UPPER_BAND', ... }
*/
function interpretBollingerBands(bb, currentPrice) {
    const { upper, middle, lower, bandwidth, percentB } = bb;
    let signal, position, description, volatility;
    // Determine volatility
    if (bandwidth < 0.04) {
        volatility = 'SQUEEZE';
    } else if (bandwidth < 0.10) {
        volatility = 'NORMAL';
    } else {
        volatility = 'EXPANSION';
    }
// Determine volatility
    if (bandwidth < 0.04) {
        volatility = 'SQUEEZE';
    } else if (bandwidth < 0.10) {
        volatility = 'NORMAL';
    } else {
        volatility = 'EXPANSION';
    }
    // Determine position
    if (percentB > 1) {
        position = 'ABOVE_UPPER';
        signal = 'OVERBOUGHT_EXTREME';
        description = 'Price above upper band - extremely overbought or strong trend';
    } else if (percentB > 0.8) {
        position = 'UPPER_BAND';
        signal = 'OVERBOUGHT';
        description = 'Price near upper band - overbought or strong uptrend';
    } else if (percentB > 0.5) {
        position = 'UPPER_HALF';
        signal = 'BULLISH';
        description = 'Price in upper half - bullish';
    } else if (percentB > 0.2) {
        position = 'LOWER_HALF';
        signal = 'BEARISH';
        description = 'Price in lower half - bearish';
    } else if (percentB > 0) {
        position = 'LOWER_BAND';
        signal = 'OVERSOLD';
        description = 'Price near lower band - oversold or strong downtrend';
    } else {
        position = 'BELOW_LOWER';
        signal = 'OVERSOLD_EXTREME';
        description = 'Price below lower band - extremely oversold or strong downtrend';
    }
    return {
        signal,
        position,
        description,
        volatility,
        percentB: parseFloat(percentB.toFixed(2)),
        bandwidth: parseFloat(bandwidth.toFixed(4))
    };
}
/**

Detect Bollinger Band squeeze

@param {number[]} bandwidthArray - Array of bandwidth values
@param {number} lookback - Number of periods to look back (default: 125)
@returns {boolean} - True if current bandwidth is lowest in lookback period

@example
const isSqueezing = detectBollingerSqueeze(bandwidthArray, 125);
// Returns: true if narrowest bands in 125 periods
*/
function detectBollingerSqueeze(bandwidthArray, lookback = 125) {
    if (bandwidthArray.length < lookback) {
        return false;
    }
    // Get recent bandwidth values (filter nulls)
    const recentBandwidths = bandwidthArray.slice(-lookback).filter(bw => bw !== null);
    if (recentBandwidths.length < lookback) {
        return false;
    }
    const currentBandwidth = recentBandwidths[recentBandwidths.length - 1];
    const minBandwidth = Math.min(...recentBandwidths);
    // Squeeze if current bandwidth is the minimum
    return currentBandwidth === minBandwidth;
}
/**

Detect band walk (price hugging upper or lower band)

@param {number[]} percentBArray - Array of %B values
@param {number} periods - Number of consecutive periods to check (default: 5)
@returns {string|null} - 'UPPER_WALK', 'LOWER_WALK', or null

@example
const walk = detectBandWalk(percentBArray, 5);
// Returns: 'UPPER_WALK' if price hugged upper band for 5+ periods
*/
function detectBandWalk(percentBArray, periods = 5) {
    if (percentBArray.length < periods) {
        return null;
    }
    // Get recent %B values (filter nulls)
    const recentPercentB = percentBArray.slice(-periods).filter(pb => pb !== null);
    if (recentPercentB.length < periods) {
        return null;
    }
    // Check if all recent %B values are above 0.8 (upper walk)
    const upperWalk = recentPercentB.every(pb => pb > 0.8);
    if (upperWalk) {
        return 'UPPER_WALK';
    }
    // Check if all recent %B values are below 0.2 (lower walk)
    const lowerWalk = recentPercentB.every(pb => pb < 0.2);
    if (lowerWalk) {
        return 'LOWER_WALK';
    }
    return null;
}
module.exports = {
    calculateBollingerBands,
    interpretBollingerBands,
    detectBollingerSqueeze,
    detectBandWalk,
    calculateStandardDeviation  // Export for testing
};