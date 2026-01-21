const { scoreStock } = require("../src/scoring");

// Test with real-looking data
const testData = [
  { high: 2455, low: 2440, close: 2450, volume: 1000000 },
  { high: 2468, low: 2445, close: 2465, volume: 1100000 },
  { high: 2475, low: 2460, close: 2470, volume: 1050000 },
  { high: 2482, low: 2468, close: 2478, volume: 1200000 },
  { high: 2485, low: 2470, close: 2475, volume: 950000 },
  { high: 2490, low: 2472, close: 2485, volume: 1300000 },
  { high: 2495, low: 2480, close: 2490, volume: 1150000 },
  { high: 2500, low: 2485, close: 2495, volume: 1400000 },
  { high: 2505, low: 2490, close: 2500, volume: 1250000 },
  { high: 2510, low: 2495, close: 2505, volume: 1500000 },
  { high: 2515, low: 2500, close: 2510, volume: 1350000 },
  { high: 2520, low: 2505, close: 2515, volume: 1600000 },
  { high: 2525, low: 2510, close: 2520, volume: 1450000 },
  { high: 2530, low: 2515, close: 2525, volume: 1700000 },
  { high: 2535, low: 2520, close: 2530, volume: 1550000 },
  { high: 2540, low: 2525, close: 2535, volume: 1800000 },
  { high: 2545, low: 2530, close: 2540, volume: 1650000 },
  { high: 2550, low: 2535, close: 2545, volume: 1900000 },
  { high: 2555, low: 2540, close: 2550, volume: 1750000 },
  { high: 2560, low: 2545, close: 2555, volume: 2000000 },
  { high: 2565, low: 2550, close: 2560, volume: 1850000 },
  { high: 2570, low: 2555, close: 2565, volume: 2100000 },
  { high: 2575, low: 2560, close: 2570, volume: 1950000 },
  { high: 2580, low: 2565, close: 2575, volume: 2200000 },
  { high: 2585, low: 2570, close: 2580, volume: 2050000 },
  { high: 2590, low: 2575, close: 2585, volume: 2300000 },
  { high: 2595, low: 2580, close: 2590, volume: 2150000 },
  { high: 2600, low: 2585, close: 2595, volume: 2400000 },
  { high: 2605, low: 2590, close: 2600, volume: 2250000 },
  { high: 2610, low: 2595, close: 2605, volume: 2500000 },
  { high: 2615, low: 2600, close: 2610, volume: 2350000 },
  { high: 2620, low: 2605, close: 2615, volume: 2600000 },
  { high: 2625, low: 2610, close: 2620, volume: 2450000 },
  { high: 2630, low: 2615, close: 2625, volume: 2700000 },
  { high: 2635, low: 2620, close: 2630, volume: 2550000 },
  { high: 2640, low: 2625, close: 2635, volume: 2800000 },
  { high: 2645, low: 2630, close: 2640, volume: 2650000 },
  { high: 2650, low: 2635, close: 2645, volume: 2900000 },
  { high: 2655, low: 2640, close: 2650, volume: 2750000 },
  { high: 2660, low: 2645, close: 2655, volume: 3000000 },
  { high: 2655, low: 2640, close: 2648, volume: 1800000 }, // Pullback
  { high: 2652, low: 2635, close: 2645, volume: 1600000 }, // Pullback
  { high: 2650, low: 2638, close: 2643, volume: 1400000 }, // Pullback
  { high: 2658, low: 2640, close: 2652, volume: 1900000 }, // Resuming
  { high: 2665, low: 2648, close: 2660, volume: 2200000 }, // Strong
  { high: 2672, low: 2655, close: 2668, volume: 2500000 },
  { high: 2680, low: 2663, close: 2675, volume: 2700000 },
  { high: 2688, low: 2670, close: 2682, volume: 2900000 },
  { high: 2695, low: 2678, close: 2690, volume: 3100000 },
  { high: 2703, low: 2685, close: 2698, volume: 3300000 },
];

console.log("═══════════════════════════════════════");
console.log("  Scoring Engine Manual Test");
console.log("  Stock: Test Data (Bullish Setup)");
console.log("═══════════════════════════════════════\n");

try {
  const result = scoreStock(testData);

  console.log(`📊 TOTAL SCORE: ${result.totalScore}/100`);
  console.log(`🏷️  CLASSIFICATION: ${result.classification}`);
  console.log(`📈 SETUP TYPE: ${result.setupType || "None detected"}`);
  console.log("");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Score Breakdown");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Trend Alignment:    ${result.trendScore.toFixed(1)}/17.5`);
  console.log(`Setup Pattern:      ${result.setupScore.toFixed(1)}/15.0`);
  console.log(`RSI Confirmation:   ${result.rsiScore.toFixed(1)}/10.0`);
  console.log(`MACD Confirmation:  ${result.macdScore.toFixed(1)}/10.0`);
  console.log(`Volume Strength:    ${result.volumeScore.toFixed(1)}/10.0`);
  console.log(`Bollinger Position: ${result.bollingerScore.toFixed(1)}/7.5`);
  console.log(
    `Market Regime:      ${result.marketRegimeScore.toFixed(1)}/15.0`,
  );
  console.log("");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Indicator Values");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`EMA(20):  ₹${result.indicators.ema20}`);
  console.log(`EMA(50):  ₹${result.indicators.ema50}`);
  console.log(`EMA(200): ₹${result.indicators.ema200}`);
  console.log(`RSI(14):  ${result.indicators.rsi14}`);
  console.log(
    `MACD:     ${result.indicators.macd.macdLine} (Signal: ${result.indicators.macd.signalLine})`,
  );
  console.log(`ADX:      ${result.indicators.adx}`);
  console.log(
    `BB %B:    ${(result.indicators.bollingerBands.percentB * 100).toFixed(1)}%`,
  );
  console.log("");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Reasoning");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(result.reasoning);
  console.log("");

  console.log("═══════════════════════════════════════\n");
} catch (error) {
  console.error("Error:", error.message);
}
