const { calculateEMA, calculateRSI } = require('../src/indicators');

// RELIANCE actual prices
const reliancePrices = [
  2440.50, 2455.30, 2468.75, 2450.20, 2442.10,
  2458.90, 2475.60, 2482.35, 2470.80, 2465.20,
  2478.50, 2492.70, 2505.30, 2498.60, 2510.40,
  2522.80, 2515.90, 2508.30, 2520.60, 2535.20,
  2528.40, 2542.10, 2550.75, 2545.30, 2538.90,
  2552.60, 2565.80, 2558.20, 2570.45, 2582.90
];

console.log('═══════════════════════════════════════');
console.log('  Manual Indicator Verification');
console.log('═══════════════════════════════════════\n');

// EMA Calculations
console.log('📊 EMA (Exponential Moving Average)');
console.log('───────────────────────────────────────');
const ema20 = calculateEMA(reliancePrices, 20);
const ema10 = calculateEMA(reliancePrices, 10);
console.log(`EMA(20): ₹${ema20.toFixed(2)}`);
console.log(`EMA(10): ₹${ema10.toFixed(2)}`);
console.log('✓ Compare with TradingView RELIANCE\n');

// RSI Calculations
console.log('📈 RSI (Relative Strength Index)');
console.log('───────────────────────────────────────');
const rsi14 = calculateRSI(reliancePrices, 14);
const rsi7 = calculateRSI(reliancePrices, 7);
const rsi21 = calculateRSI(reliancePrices, 21);

console.log(`RSI(14): ${rsi14.toFixed(2)}`);
console.log(`RSI(7):  ${rsi7.toFixed(2)}`);
console.log(`RSI(21): ${rsi21.toFixed(2)}`);

// Interpretation
let interpretation;
if (rsi14 > 70) {
  interpretation = '🔴 OVERBOUGHT (>70)';
} else if (rsi14 < 30) {
  interpretation = '🟢 OVERSOLD (<30)';
} else {
  interpretation = '🟡 NEUTRAL (30-70)';
}
console.log(`\nInterpretation: ${interpretation}`);
console.log('✓ Compare with TradingView RELIANCE\n');

// Trend Analysis
console.log('📉 Trend Analysis');
console.log('───────────────────────────────────────');
if (ema10 > ema20) {
  console.log('Trend: 🟢 BULLISH (EMA10 > EMA20)');
} else {
  console.log('Trend: 🔴 BEARISH (EMA10 < EMA20)');
}

if (rsi14 > 50) {
  console.log('Momentum: 🟢 POSITIVE (RSI > 50)');
} else {
  console.log('Momentum: 🔴 NEGATIVE (RSI < 50)');
}

console.log('\n═══════════════════════════════════════\n');