const { calculateEMA, calculateRSI, calculateATR, interpretATR, calculateATRStopLoss } = require('../src/indicators');

// RELIANCE actual prices
const reliancePrices = [
  2440.50, 2455.30, 2468.75, 2450.20, 2442.10,
  2458.90, 2475.60, 2482.35, 2470.80, 2465.20,
  2478.50, 2492.70, 2505.30, 2498.60, 2510.40,
  2522.80, 2515.90, 2508.30, 2520.60, 2535.20,
  2528.40, 2542.10, 2550.75, 2545.30, 2538.90,
  2552.60, 2565.80, 2558.20, 2570.45, 2582.90
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
console.log('  Manual Indicator Verification');
console.log('  RELIANCE Stock Analysis');
console.log('═══════════════════════════════════════\n');

// Current price
const currentPrice = reliancePrices[reliancePrices.length - 1];
console.log(`💰 Current Price: ₹${currentPrice.toFixed(2)}\n`);

// EMA Calculations
console.log('📊 EMA (Exponential Moving Average)');
console.log('───────────────────────────────────────');
const ema20 = calculateEMA(reliancePrices, 20);
const ema10 = calculateEMA(reliancePrices, 10);
console.log(`EMA(20): ₹${ema20.toFixed(2)}`);
console.log(`EMA(10): ₹${ema10.toFixed(2)}`);

if (ema10 > ema20) {
  console.log('✓ Trend: 🟢 BULLISH (EMA10 > EMA20)');
} else {
  console.log('✓ Trend: 🔴 BEARISH (EMA10 < EMA20)');
}
console.log();

// RSI Calculations
console.log('📈 RSI (Relative Strength Index)');
console.log('───────────────────────────────────────');
const rsi14 = calculateRSI(reliancePrices, 14);
const rsi7 = calculateRSI(reliancePrices, 7);

console.log(`RSI(14): ${rsi14.toFixed(2)}`);
console.log(`RSI(7):  ${rsi7.toFixed(2)}`);

let rsiInterpretation;
if (rsi14 > 70) {
  rsiInterpretation = '🔴 OVERBOUGHT (>70) - Potential reversal down';
} else if (rsi14 < 30) {
  rsiInterpretation = '🟢 OVERSOLD (<30) - Potential reversal up';
} else {
  rsiInterpretation = '🟡 NEUTRAL (30-70) - No extreme';
}
console.log(`Status: ${rsiInterpretation}`);
console.log();

// ATR Calculations
console.log('📉 ATR (Average True Range)');
console.log('───────────────────────────────────────');
const atr14 = calculateATR(relianceHLC, 14);
const atr7 = calculateATR(relianceHLC, 7);

console.log(`ATR(14): ₹${atr14.toFixed(2)}`);
console.log(`ATR(7):  ₹${atr7.toFixed(2)}`);

const atrInterp = interpretATR(atr14, currentPrice);
console.log(`Volatility: ${atrInterp.category} (${atrInterp.percent}% of price)`);
console.log(`Description: ${atrInterp.description}`);
console.log();

// Trading Recommendations
console.log('💡 Trading Recommendations');
console.log('───────────────────────────────────────');

// Stop-loss calculation
const stopLoss1x = calculateATRStopLoss(currentPrice, atr14, 1, 'LONG');
const stopLoss2x = calculateATRStopLoss(currentPrice, atr14, 2, 'LONG');
const stopLoss3x = calculateATRStopLoss(currentPrice, atr14, 3, 'LONG');

console.log('For LONG Entry at ₹' + currentPrice.toFixed(2) + ':');
console.log(`  Conservative Stop (1× ATR): ₹${stopLoss1x.toFixed(2)} (-${((currentPrice - stopLoss1x) / currentPrice * 100).toFixed(2)}%)`);
console.log(`  Standard Stop (2× ATR):     ₹${stopLoss2x.toFixed(2)} (-${((currentPrice - stopLoss2x) / currentPrice * 100).toFixed(2)}%)`);
console.log(`  Wide Stop (3× ATR):         ₹${stopLoss3x.toFixed(2)} (-${((currentPrice - stopLoss3x) / currentPrice * 100).toFixed(2)}%)`);
console.log();

// Combined analysis
console.log('🎯 Combined Technical Analysis');
console.log('───────────────────────────────────────');

let signal = '';
let reasoning = '';

if (ema10 > ema20 && rsi14 > 50 && rsi14 < 70) {
  signal = '🟢 BULLISH SETUP';
  reasoning = 'Uptrend confirmed (EMA10 > EMA20), positive momentum (RSI > 50), not overbought';
} else if (ema10 < ema20 && rsi14 < 50 && rsi14 > 30) {
  signal = '🔴 BEARISH SETUP';
  reasoning = 'Downtrend confirmed (EMA10 < EMA20), negative momentum (RSI < 50), not oversold';
} else if (rsi14 > 70) {
  signal = '🟡 OVERBOUGHT - CAUTION';
  reasoning = 'RSI > 70 suggests potential reversal or consolidation';
} else if (rsi14 < 30) {
  signal = '🟢 OVERSOLD - POTENTIAL BUY';
  reasoning = 'RSI < 30 suggests potential reversal up';
} else {
  signal = '🟡 NEUTRAL';
  reasoning = 'Mixed signals, wait for clearer setup';
}

console.log(`Signal: ${signal}`);
console.log(`Reasoning: ${reasoning}`);
console.log();

console.log('✓ Compare all values with TradingView for validation');
console.log('═══════════════════════════════════════\n');