/**
 * Scoring Engine - The Brain of the Swing Trading System
 * 
 * Takes OHLCV data and calculates a 0-100 score based on:
 * - Trend Alignment (Layer 2): 0-17.5 points
 * - Setup Pattern (Layer 3): 0-15 points
 * - RSI Confirmation: 0-10 points
 * - MACD Confirmation: 0-10 points
 * - Volume Confirmation: 0-10 points
 * - Bollinger Position: 0-7.5 points
 * - Market Regime: 0-15 points
 * 
 * Total: 0-100 points
 */

const {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateADX,
  calculateBollingerBands,
  calculateATR
} = require('../indicators');

/**
 * Score a stock based on complete OHLCV data
 * 
 * @param {Array<Object>} data - Array of {high, low, close, volume} objects
 * @param {Object} options - Scoring options (optional)
 * @returns {Object} - Complete scoring breakdown
 * 
 * @example
 * const data = [
 *   { high: 110, low: 105, close: 108, volume: 1000000 },
 *   // ... more data
 * ];
 * const score = scoreStock(data);
 * console.log(score.totalScore); // 87.5
 */
function scoreStock(data, options = {}) {
  // Input validation
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  // Need at least 50 data points for reliable indicator calculation
  if (data.length < 50) {
    throw new Error(`Insufficient data: need at least 50 data points, got ${data.length}`);
  }

  // Validate data structure
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];

    if (!candle.high || !candle.low || !candle.close || !candle.volume) {
      throw new Error('Each data point must have high, low, close, and volume properties');
    }
  }

  // Extract price arrays
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  // Calculate all indicators
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);

  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const adx = calculateADX(data, 14);
  const bb = calculateBollingerBands(closes, 20, 2);

  const currentPrice = closes[closes.length - 1];

  // ============================================
  // LAYER 2: TREND ALIGNMENT SCORING (0-17.5 points)
  // ============================================

  const trendScore = calculateTrendAlignmentScore({
    currentPrice,
    ema20,
    ema50,
    ema200,
    macd
  });

  // ============================================
  // LAYER 3: SETUP PATTERN DETECTION (0-15 points)
  // ============================================

  const setupResult = detectSetupPattern({
    data,
    closes,
    ema20,
    ema50,
    rsi14,
    macd,
    bb,
    volumes
  });

  // ============================================
  // INDIVIDUAL INDICATOR SCORING
  // ============================================

  // RSI Score (0-10 points)
  const rsiScore = calculateRSIScore(rsi14);

  // MACD Score (0-10 points)
  const macdScore = calculateMACDScore(macd);

  // Volume Score (0-10 points)
  const volumeScore = calculateVolumeScore(volumes);

  // Bollinger Bands Score (0-7.5 points)
  const bollingerScore = calculateBollingerScore(bb, currentPrice);

  // ============================================
  // MARKET REGIME BONUS (0-15 points)
  // ============================================

  const marketRegimeScore = calculateMarketRegimeScore(adx, bb);

  // ============================================
  // TOTAL SCORE CALCULATION
  // ============================================

  const totalScore =
    trendScore +
    setupResult.score +
    rsiScore +
    macdScore +
    volumeScore +
    bollingerScore +
    marketRegimeScore;

  // ============================================
  // CLASSIFICATION
  // ============================================

  let classification;
  if (totalScore >= 80) {
    classification = 'STRONG';
  } else if (totalScore >= 65) {
    classification = 'GOOD';
  } else if (totalScore >= 50) {
    classification = 'MARGINAL';
  } else {
    classification = 'DO_NOT_TRADE';
  }

  // ============================================
  // REASONING GENERATION
  // ============================================

  const reasoning = generateReasoning({
    trendScore,
    setupResult,
    rsiScore,
    macdScore,
    volumeScore,
    bollingerScore,
    marketRegimeScore,
    totalScore,
    classification,
    currentPrice,
    ema20,
    ema50,
    rsi14,
    macd,
    adx
  });

  // Return complete scoring breakdown
  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    classification,

    // Score breakdown
    trendScore: parseFloat(trendScore.toFixed(2)),
    setupScore: parseFloat(setupResult.score.toFixed(2)),
    rsiScore: parseFloat(rsiScore.toFixed(2)),
    macdScore: parseFloat(macdScore.toFixed(2)),
    volumeScore: parseFloat(volumeScore.toFixed(2)),
    bollingerScore: parseFloat(bollingerScore.toFixed(2)),
    marketRegimeScore: parseFloat(marketRegimeScore.toFixed(2)),

    // Pattern info
    setupType: setupResult.type,

    // Reasoning
    reasoning,

    // Indicator values (for reference)
    indicators: {
      ema20: parseFloat(ema20.toFixed(2)),
      ema50: parseFloat(ema50.toFixed(2)),
      ema200: parseFloat(ema200.toFixed(2)),
      rsi14: parseFloat(rsi14.toFixed(2)),
      macd: {
        macdLine: parseFloat(macd.macdLine.toFixed(2)),
        signalLine: parseFloat(macd.signalLine.toFixed(2)),
        histogram: parseFloat(macd.histogram.toFixed(2))
      },
      adx: parseFloat(adx.adx.toFixed(2)),
      bollingerBands: {
        upper: parseFloat(bb.upper.toFixed(2)),
        middle: parseFloat(bb.middle.toFixed(2)),
        lower: parseFloat(bb.lower.toFixed(2)),
        percentB: parseFloat(bb.percentB.toFixed(2))
      }
    }
  };
}

/**
 * Calculate Trend Alignment Score (Layer 2)
 * Maximum: 17.5 points (7 × 2.5)
 */
function calculateTrendAlignmentScore({ currentPrice, ema20, ema50, ema200, macd }) {
  let points = 0;

  // Price > EMA20: +1
  if (currentPrice > ema20) points++;

  // EMA20 > EMA50: +1
  if (ema20 > ema50) points++;

  // EMA50 > EMA200: +1
  if (ema50 > ema200) points++;

  // MACD Line > Signal Line: +1
  if (macd.macdLine > macd.signalLine) points++;

  // MACD > 0 (centerline): +1
  if (macd.macdLine > 0) points++;

  // MACD Histogram positive: +1
  if (macd.histogram > 0) points++;

  // Strong MACD histogram (> 2): +1
  if (Math.abs(macd.histogram) > 2) points++;

  // Multiply by 2.5 for weighted score
  return points * 2.5;
}

/**
 * Detect Setup Pattern (Layer 3)
 * Returns: { type: string, score: number }
 */
function detectSetupPattern({ data, closes, ema20, ema50, rsi14, macd, bb, volumes }) {
  const currentPrice = closes[closes.length - 1];
  const recentPrices = closes.slice(-10);

  // Check for pullback in trend
  const pullbackSetup = detectPullbackInTrend({
    currentPrice,
    recentPrices,
    ema20,
    ema50,
    rsi14,
    macd,
    volumes
  });

  if (pullbackSetup.detected) {
    return { type: 'PULLBACK_IN_TREND', score: 15 };
  }

  // Check for breakout
  const breakoutSetup = detectBreakout({
    bb,
    currentPrice,
    volumes
  });

  if (breakoutSetup.detected) {
    return { type: 'BREAKOUT', score: 12 };
  }

  // Check for mean reversion
  const meanReversionSetup = detectMeanReversion({
    bb,
    currentPrice,
    rsi14
  });

  if (meanReversionSetup.detected) {
    return { type: 'MEAN_REVERSION', score: 10 };
  }

  // No clear setup
  return { type: null, score: 0 };
}

/**
 * Detect Pullback in Trend setup
 */
function detectPullbackInTrend({ currentPrice, recentPrices, ema20, ema50, rsi14, macd, volumes }) {
  // Conditions:
  // 1. Price above both EMAs (uptrend)
  // 2. Price pulled back from recent high
  // 3. RSI cooled off (30-60 range)
  // 4.MACD still bullish
  // 5. Volume declining on pullback

  const condition1 = currentPrice > ema20 && ema20 > ema50;
  // Check if price pulled back from recent high
  const recentHigh = Math.max(...recentPrices);
  const pullbackPercent = ((recentHigh - currentPrice) / recentHigh) * 100;
  const condition2 = pullbackPercent > 1 && pullbackPercent < 10; // 1-10% pullback
  // RSI cooled off but not oversold
  const condition3 = rsi14 > 30 && rsi14 < 60;

  // MACD still bullish (above signal or above zero)
  const condition4 = macd.macdLine > macd.signalLine || macd.macdLine > 0;

  // Volume declining (compare last 3 vs previous 3)
  const recentVol = volumes.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
  const previousVol = volumes.slice(-6, -3).reduce((sum, v) => sum + v, 0) / 3;
  const condition5 = recentVol < previousVol;
  const detected = condition1 && condition2 && condition3 && condition4;
  return { detected };
}
/**

Detect Breakout setup
*/
function detectBreakout({ bb, currentPrice, volumes }) {
  // Conditions:
  // 1. Bollinger Bands in squeeze (narrow bandwidth)
  // 2. Price breaking out of bands
  // 3. Volume increasing

  const condition1 = bb.bandwidth < 0.04; // Tight squeeze
  // Price breaking above upper band or approaching it
  const condition2 = bb.percentB > 0.9;
  // Volume increasing
  const recentVol = volumes.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
  const previousVol = volumes.slice(-10, -3).reduce((sum, v) => sum + v, 0) / 7;
  const condition3 = recentVol > previousVol * 1.2; // 20% increase
  const detected = condition1 && condition2 && condition3;
  return { detected };
}
/**

Detect Mean Reversion setup
*/
function detectMeanReversion({ bb, currentPrice, rsi14 }) {
  // Conditions:
  // 1. Price at or beyond lower Bollinger Band
  // 2. RSI oversold (<30)
  // 3. Not in strong downtrend

  const condition1 = bb.percentB < 0.2; // At lower band
  const condition2 = rsi14 < 35; // Oversold
  const condition3 = rsi14 > 20; // But not extremely oversold (avoid knife catching)
  const detected = condition1 && condition2 && condition3;
  return { detected };
}
/**

Calculate RSI Score (0-10 points)
*/
function calculateRSIScore(rsi14) {
  // Optimal RSI for swing trading: 40-70
  // Too high (>70) = overbought, risky
  // Too low (<30) = oversold, might catch falling knife
  // Sweet spot: 45-65

  if (rsi14 >= 45 && rsi14 <= 65) {
    return 10; // Perfect zone
  } else if (rsi14 >= 40 && rsi14 <= 70) {
    return 7; // Good zone
  } else if (rsi14 >= 35 && rsi14 <= 75) {
    return 4; // Acceptable
  } else if (rsi14 > 80 || rsi14 < 25) {
    return 0; // Extreme, avoid
  } else {
    return 2; // Marginal
  }
}
/**

Calculate MACD Score (0-10 points)
*/
function calculateMACDScore(macd) {
  let score = 0;

  // MACD Line > Signal Line: +5
  if (macd.macdLine > macd.signalLine) {
    score += 5;
  }
  // MACD > 0 (bullish territory): +3
  if (macd.macdLine > 0) {
    score += 3;
  }

  // Strong histogram (momentum building): +2
  if (Math.abs(macd.histogram) > 1) {
    score += 2;
  }
  return Math.min(score, 10); // Cap at 10
}
/**

Calculate Volume Score (0-10 points)
*/
function calculateVolumeScore(volumes) {
  // Compare recent volume to average
  const recentVol = volumes.slice(-5).reduce((sum, v) => sum + v, 0) / 5;
  const avgVol = volumes.slice(-20).reduce((sum, v) => sum + v, 0) / 20;

  const volumeRatio = recentVol / avgVol;
  if (volumeRatio > 1.5) {
    return 10; // Strong volume increase
  } else if (volumeRatio > 1.2) {
    return 7; // Good volume
  } else if (volumeRatio > 1.0) {
    return 5; // Average volume
  } else if (volumeRatio > 0.8) {
    return 3; // Below average
  } else {
    return 0; // Weak volume
  }
}
/**

Calculate Bollinger Bands Score (0-7.5 points)
*/
function calculateBollingerScore(bb, currentPrice) {
  // Optimal position: in upper half but not at extreme
  const percentB = bb.percentB;

  if (percentB >= 0.5 && percentB <= 0.8) {
    return 7.5; // Perfect position (upper half, not overbought)
  } else if (percentB >= 0.4 && percentB <= 0.9) {
    return 5; // Good position
  } else if (percentB >= 0.3 && percentB <= 0.95) {
    return 3; // Acceptable
  } else if (percentB > 1.0 || percentB < 0.1) {
    return 0; // At extremes, risky
  } else {
    return 2; // Marginal
  }
}
/**

Calculate Market Regime Score (0-15 points)
*/
function calculateMarketRegimeScore(adx, bb) {
  let score = 0;
  // ADX scoring (0-10 points)
  if (adx.adx >= 25 && adx.adx <= 50) {
    score += 10; // Strong trend, ideal
  } else if (adx.adx >= 20 && adx.adx <= 60) {
    score += 7; // Good trend
  } else if (adx.adx >= 15 && adx.adx <= 70) {
    score += 4; // Emerging or very strong trend
  } else if (adx.adx < 15) {
    score += 0; // Weak trend, ranging market
  } else {
    score += 2; // Extremely strong trend (might be overextended)
  }
  // +DI > -DI (directional alignment): +5
  if (adx.plusDI > adx.minusDI) {
    score += 5;
  }
  return Math.min(score, 15); // Cap at 15
}
/**

Generate human-readable reasoning
*/
function generateReasoning({
  trendScore,
  setupResult,
  rsiScore,
  macdScore,
  volumeScore,
  bollingerScore,
  marketRegimeScore,
  totalScore,
  classification,
  currentPrice,
  ema20,
  ema50,
  rsi14,
  macd,
  adx
}) {
  const reasons = [];

  // Overall classification
  reasons.push(`Overall Score: ${totalScore.toFixed(1)}/100 (${classification})`);
  reasons.push('');
  // Trend analysis
  if (trendScore >= 15) {
    reasons.push('✓ STRONG UPTREND: Price above key EMAs with bullish MACD alignment');
  } else if (trendScore >= 10) {
    reasons.push('✓ Moderate uptrend: Some bullish EMA alignment');
  } else if (trendScore >= 5) {
    reasons.push('⚠ Weak trend: Mixed EMA signals');
  } else {
    reasons.push('✗ NO CLEAR TREND: EMAs not aligned, avoid trend trading');
  }
  // Setup pattern
  if (setupResult.type === 'PULLBACK_IN_TREND') {
    reasons.push('✓ PULLBACK SETUP: Healthy pullback in uptrend, potential entry zone');
  } else if (setupResult.type === 'BREAKOUT') {
    reasons.push('✓ BREAKOUT SETUP: Volatility squeeze resolving, momentum building');
  } else if (setupResult.type === 'MEAN_REVERSION') {
    reasons.push('⚠ MEAN REVERSION: Oversold bounce opportunity, higher risk');
  } else {
    reasons.push('✗ No clear setup pattern detected');
  }
  // Momentum
  if (rsi14 >= 45 && rsi14 <= 65) {
    reasons.push(`✓ RSI optimal at ${rsi14.toFixed(1)} (not overbought/oversold)`);
  } else if (rsi14 > 70) {
    reasons.push(`⚠ RSI overbought at ${rsi14.toFixed(1)} (potential pullback risk)`);
  } else if (rsi14 < 30) {
    reasons.push(`⚠ RSI oversold at ${rsi14.toFixed(1)} (catching falling knife risk)`);
  } else {
    reasons.push(`• RSI at ${rsi14.toFixed(1)} (neutral zone)`);
  }
  // MACD
  if (macd.histogram > 0 && macd.macdLine > 0) {
    reasons.push('✓ MACD bullish: Above signal and centerline, momentum positive');
  } else if (macd.histogram > 0) {
    reasons.push('✓ MACD turning bullish: Crossed above signal line');
  } else if (macd.macdLine > 0) {
    reasons.push('⚠ MACD weakening: Above centerline but below signal');
  } else {
    reasons.push('✗ MACD bearish: Below signal line and centerline');
  }
  // Volume
  if (volumeScore >= 7) {
    reasons.push('✓ Volume confirming: Above average participation');
  } else if (volumeScore >= 5) {
    reasons.push('• Volume average: Moderate participation');
  } else {
    reasons.push('✗ Volume weak: Below average participation');
  }
  // Market regime
  if (adx.adx >= 25) {
    reasons.push(`✓ Strong trend (ADX: ${adx.adx.toFixed(1)}), good for swing trading`);
  } else if (adx.adx >= 20) {
    reasons.push(`⚠ Emerging trend (ADX: ${adx.adx.toFixed(1)}), watch for development`);
  } else {
    reasons.push(`✗ Weak trend (ADX: ${adx.adx.toFixed(1)}), ranging market - avoid`);
  }
  // Price position
  const priceVsEMA20 = ((currentPrice - ema20) / ema20) * 100;
  if (Math.abs(priceVsEMA20) < 2) {
    reasons.push(`✓ Price near EMA20 support/resistance (${priceVsEMA20.toFixed(1)}%)`);
  } else if (priceVsEMA20 > 5) {
    reasons.push(`⚠ Price extended above EMA20 (+${priceVsEMA20.toFixed(1)}%)`);
  }
  return reasons.join('\n');
}
module.exports = {
  scoreStock,
  calculateTrendAlignmentScore,
  detectSetupPattern,
  calculateRSIScore,
  calculateMACDScore,
  calculateVolumeScore,
  calculateBollingerScore,
  calculateMarketRegimeScore,
  generateReasoning
};