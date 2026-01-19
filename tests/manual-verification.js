const { 
  calculateEMA, 
  calculateRSI, 
  calculateATR, 
  interpretATR, 
  calculateATRStopLoss,
  calculateMACD,
  interpretMACD
} = require('../src/indicators');

// RELIANCE actual prices
const reliancePrices = [
  2440.50, 2455.30, 2468.75, 2450.20, 2442.10,
  2458.90, 2475.60, 2482.35, 2470.80, 2465.20,
  2478.50, 2492.70, 2505.30, 2498.60, 2510.40,
  2522.80, 2515.90, 2508.30, 2520.60, 2535.20,
  2528.40, 2542.10, 2550.75, 2545.30, 2538.90,
  2552.60, 2565.80, 2558.20, 2570.45, 2582.90,
  2575.30, 2588.60, 2595.40, 2602.10, 2598.50
];

// RELIANCE HLC data
const relianceHLC = [
  { high: 2455, low: 2440, close: 2450 },
  { high: 2468, low: 2445, close: 2465 },
  { high: 2475, low: 2460, close: 2470 },
  { high: 2482, low: 2468, close: 2478 },
  { high: 2485, low: 2470, close: 2475 },
  { high: 2490, low: 2472, close: 2485 },
  { high: 2495, low: 2480, close: 2490 },
  { high: 2500, low: 2485, close: 2495 },
  { high: 2505, low: 2490, close: 2500 },
  { high: 2510, low: 2495, close: 2505 },
  { high: 2515, low: 2500, close: 2510 },
  { high: 2520, low: 2505, close: 2515 },
  { high: 2525, low: 2510, close: 2520 },
  { high: 2530, low: 2515, close: 2525 },
  { high: 2535, low: 2520, close: 2530 }
];

console.log('═══════════════════════════════════════');
console.log('  Technical Indicators Analysis');
console.log('  RELIANCE Stock');
console.log('═══════════════════════════════════════\n');

// Current price
const currentPrice = reliancePrices[reliancePrices.length - 1];
console.log(`💰 Current Price: ₹${currentPrice.toFixed(2)}\n`);

// ============================================
// EMA Analysis
// ============================================
console.log('📊 EMA (Exponential Moving Average)');
console.log('───────────────────────────────────────');
const ema20 = calculateEMA(reliancePrices, 20);
const ema50 = calculateEMA(reliancePrices, 50);
const ema10 = calculateEMA(reliancePrices, 10);

console.log(`EMA(10): ₹${ema10.toFixed(2)}`);
console.log(`EMA(20): ₹${ema20.toFixed(2)}`);
console.log(`EMA(50): ₹${ema50.toFixed(2)}`);

let trendSignal = '';
if (currentPrice > ema10 && ema10 > ema20 && ema20 > ema50) {
  trendSignal = '🟢 STRONG BULLISH (All EMAs aligned)';
} else if (ema10 > ema20) {
  trendSignal = '🟢 BULLISH (EMA10 > EMA20)';
} else if (ema10 < ema20) {
  trendSignal = '🔴 BEARISH (EMA10 < EMA20)';
} else {
  trendSignal = '🟡 NEUTRAL';
}
console.log(`Trend: ${trendSignal}`);
console.log();

// ============================================
// RSI Analysis
// ============================================
console.log('📈 RSI (Relative Strength Index)');
console.log('───────────────────────────────────────');
const rsi14 = calculateRSI(reliancePrices, 14);
const rsi7 = calculateRSI(reliancePrices, 7);

console.log(`RSI(14): ${rsi14.toFixed(2)}`);
console.log(`RSI(7):  ${rsi7.toFixed(2)}`);

let rsiSignal;
if (rsi14 > 70) {
  rsiSignal = '🔴 OVERBOUGHT (>70) - Potential reversal down or consolidation';
} else if (rsi14 < 30) {
  rsiSignal = '🟢 OVERSOLD (<30) - Potential reversal up';
} else if (rsi14 > 50) {
  rsiSignal = '🟢 BULLISH MOMENTUM (>50)';
} else {
  rsiSignal = '🔴 BEARISH MOMENTUM (<50)';
}
console.log(`Status: ${rsiSignal}`);
console.log();

// ============================================
// MACD Analysis
// ============================================
console.log('📉 MACD (Moving Average Convergence Divergence)');
console.log('───────────────────────────────────────');
const macd = calculateMACD(reliancePrices);
const macdInterpretation = interpretMACD(macd);

console.log(`MACD Line:   ${macd.macdLine.toFixed(2)}`);
console.log(`Signal Line: ${macd.signalLine.toFixed(2)}`);
console.log(`Histogram:   ${macd.histogram.toFixed(2)}`);
console.log();
console.log(`Signal: ${macdInterpretation.signal}`);
console.log(`Description: ${macdInterpretation.description}`);
console.log(`Strength: ${macdInterpretation.strength}`);
console.log();

// ============================================
// ATR Analysis
// ============================================
console.log('💥 ATR (Average True Range)');
console.log('───────────────────────────────────────');
const atr14 = calculateATR(relianceHLC, 14);
const atr7 = calculateATR(relianceHLC, 7);

console.log(`ATR(14): ₹${atr14.toFixed(2)}`);
console.log(`ATR(7):  ₹${atr7.toFixed(2)}`);

const atrInterp = interpretATR(atr14, currentPrice);
console.log(`Volatility: ${atrInterp.category} (${atrInterp.percent}% of price)`);
console.log(`Description: ${atrInterp.description}`);
console.log();

// ============================================
// Trading Recommendations
// ============================================
console.log('💡 Trading Recommendations');
console.log('───────────────────────────────────────');

// Stop-loss calculation
const stopLoss2x = calculateATRStopLoss(currentPrice, atr14, 2, 'LONG');
const stopLoss15x = calculateATRStopLoss(currentPrice, atr14, 1.5, 'LONG');

console.log('For LONG Entry at ₹' + currentPrice.toFixed(2) + ':');
console.log(`  Tight Stop (1.5× ATR):   ₹${stopLoss15x.toFixed(2)} (-${((currentPrice - stopLoss15x) / currentPrice * 100).toFixed(2)}%)`);
console.log(`  Standard Stop (2× ATR):  ₹${stopLoss2x.toFixed(2)} (-${((currentPrice - stopLoss2x) / currentPrice * 100).toFixed(2)}%)`);

// Target calculation (simple 1:2 and 1:3 risk-reward)
const riskAmount = currentPrice - stopLoss2x;
const target1 = currentPrice + (riskAmount * 2); // 1:2 R:R
const target2 = currentPrice + (riskAmount * 3); // 1:3 R:R

console.log();
console.log('Targets (based on 2× ATR stop):');
console.log(`  Target 1 (1:2 R:R): ₹${target1.toFixed(2)} (+${((target1 - currentPrice) / currentPrice * 100).toFixed(2)}%)`);
console.log(`  Target 2 (1:3 R:R): ₹${target2.toFixed(2)} (+${((target2 - currentPrice) / currentPrice * 100).toFixed(2)}%)`);
console.log();

// ============================================
// Combined Technical Analysis
// ============================================
console.log('🎯 Combined Technical Analysis');
console.log('───────────────────────────────────────');

let overallSignal = '';
let confidence = '';
let reasoning = [];

// Count bullish and bearish signals
let bullishSignals = 0;
let bearishSignals = 0;

// EMA trend
if (ema10 > ema20) {
  bullishSignals++;
  reasoning.push('✓ Bullish EMA trend');
} else {
  bearishSignals++;
  reasoning.push('✗ Bearish EMA trend');
}

// RSI momentum
if (rsi14 > 50 && rsi14 < 70) {
  bullishSignals++;
  reasoning.push('✓ Positive RSI momentum (not overbought)');
} else if (rsi14 > 70) {
  bearishSignals++;
  reasoning.push('✗ RSI overbought');
} else if (rsi14 < 30) {
  bullishSignals++;
  reasoning.push('✓ RSI oversold (reversal potential)');
} else {
  bearishSignals++;
  reasoning.push('✗ Negative RSI momentum');
}

// MACD signal
if (macd.histogram > 0) {
  bullishSignals++;
  reasoning.push('✓ MACD bullish (above signal line)');
} else {
  bearishSignals++;
  reasoning.push('✗ MACD bearish (below signal line)');
}

// Overall assessment
if (bullishSignals >= 3) {
  overallSignal = '🟢 BULLISH SETUP';
  confidence = 'HIGH';
} else if (bullishSignals === 2) {
  overallSignal = '🟡 MODERATELY BULLISH';
  confidence = 'MEDIUM';
} else if (bearishSignals >= 3) {
  overallSignal = '🔴 BEARISH SETUP';
  confidence = 'HIGH';
} else if (bearishSignals === 2) {
  overallSignal = '🟡 MODERATELY BEARISH';
  confidence = 'MEDIUM';
} else {
  overallSignal = '🟡 NEUTRAL / MIXED SIGNALS';
  confidence = 'LOW';
}

console.log(`Overall Signal: ${overallSignal}`);
console.log(`Confidence: ${confidence}`);
console.log();
console.log('Analysis:');
reasoning.forEach(r => console.log(`  ${r}`));
console.log();

console.log('═══════════════════════════════════════');
console.log('✓ Compare all values with TradingView');
console.log('✓ Indicators: EMA, RSI, MACD, ATR complete');
console.log('═══════════════════════════════════════\n');