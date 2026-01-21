/**
 * Test data for scoring engine
 * Complete OHLCV data with expected scores
 */

const scoringTestData = {
  // Perfect bullish setup - should score ~90+
  perfectBullishSetup: {
    ohlcv: [
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
      { high: 2550, low: 2540, close: 2545, volume: 1200000 }, // Pullback
      { high: 2548, low: 2535, close: 2542, volume: 1100000 }, // Pullback
      { high: 2546, low: 2537, close: 2540, volume: 1000000 }, // Pullback
      { high: 2555, low: 2540, close: 2552, volume: 1500000 }, // Resuming
      { high: 2565, low: 2550, close: 2560, volume: 1800000 }, // Strong
      { high: 2575, low: 2560, close: 2570, volume: 2100000 },
      { high: 2585, low: 2570, close: 2580, volume: 2200000 },
      { high: 2595, low: 2580, close: 2590, volume: 2300000 },
      { high: 2605, low: 2590, close: 2600, volume: 2400000 },
      { high: 2615, low: 2600, close: 2610, volume: 2500000 }
    ],
    expectedScore: {
      min: 85,
      max: 100,
      trendScore: 7,
      setupType: 'PULLBACK_IN_TREND'
    },
    description: 'Perfect setup: strong uptrend, healthy pullback, resuming with volume'
  },

  // Poor setup - should score <40
  poorSetup: {
    ohlcv: [
      { high: 2455, low: 2440, close: 2450, volume: 1000000 },
      { high: 2448, low: 2435, close: 2445, volume: 1100000 },
      { high: 2452, low: 2438, close: 2448, volume: 950000 },
      { high: 2445, low: 2432, close: 2440, volume: 900000 },
      { high: 2442, low: 2428, close: 2435, volume: 850000 },
      { high: 2438, low: 2425, close: 2432, volume: 800000 },
      { high: 2440, low: 2427, close: 2435, volume: 750000 },
      { high: 2437, low: 2423, close: 2430, volume: 700000 },
      { high: 2433, low: 2420, close: 2428, volume: 650000 },
      { high: 2430, low: 2417, close: 2425, volume: 600000 },
      { high: 2428, low: 2415, close: 2422, volume: 550000 },
      { high: 2425, low: 2412, close: 2420, volume: 500000 },
      { high: 2422, low: 2410, close: 2418, volume: 450000 },
      { high: 2420, low: 2407, close: 2415, volume: 400000 },
      { high: 2417, low: 2405, close: 2412, volume: 350000 },
      { high: 2415, low: 2402, close: 2410, volume: 300000 },
      { high: 2412, low: 2400, close: 2408, volume: 250000 },
      { high: 2410, low: 2398, close: 2405, volume: 200000 },
      { high: 2408, low: 2395, close: 2402, volume: 150000 },
      { high: 2405, low: 2393, close: 2400, volume: 100000 },
      { high: 2403, low: 2390, close: 2398, volume: 90000 },
      { high: 2400, low: 2388, close: 2395, volume: 80000 },
      { high: 2398, low: 2385, close: 2392, volume: 70000 },
      { high: 2395, low: 2383, close: 2390, volume: 60000 },
      { high: 2393, low: 2380, close: 2388, volume: 50000 },
      { high: 2390, low: 2378, close: 2385, volume: 40000 },
      { high: 2388, low: 2375, close: 2382, volume: 30000 },
      { high: 2385, low: 2373, close: 2380, volume: 20000 },
      { high: 2383, low: 2370, close: 2378, volume: 10000 },
      { high: 2380, low: 2368, close: 2375, volume: 5000 }
    ],
    expectedScore: {
      min: 0,
      max: 40,
      trendScore: 0,
      setupType: null
    },
    description: 'Poor setup: weak downtrend, declining volume, no clear pattern'
  },

  // Moderate setup - should score 50-70
  moderateSetup: {
    ohlcv: [
      { high: 2455, low: 2440, close: 2450, volume: 1000000 },
      { high: 2460, low: 2445, close: 2455, volume: 1050000 },
      { high: 2465, low: 2450, close: 2460, volume: 1100000 },
      { high: 2458, low: 2445, close: 2452, volume: 950000 },
      { high: 2463, low: 2448, close: 2458, volume: 1000000 },
      { high: 2468, low: 2453, close: 2463, volume: 1050000 },
      { high: 2462, low: 2448, close: 2455, volume: 900000 },
      { high: 2467, low: 2453, close: 2462, volume: 950000 },
      { high: 2472, low: 2458, close: 2467, volume: 1100000 },
      { high: 2465, low: 2452, close: 2460, volume: 850000 },
      { high: 2470, low: 2457, close: 2465, volume: 1000000 },
      { high: 2475, low: 2462, close: 2470, volume: 1050000 },
      { high: 2468, low: 2455, close: 2463, volume: 900000 },
      { high: 2473, low: 2460, close: 2468, volume: 1000000 },
      { high: 2478, low: 2465, close: 2473, volume: 1100000 },
      { high: 2472, low: 2460, close: 2467, volume: 950000 },
      { high: 2477, low: 2465, close: 2472, volume: 1000000 },
      { high: 2482, low: 2470, close: 2477, volume: 1050000 },
      { high: 2475, low: 2463, close: 2470, volume: 900000 },
      { high: 2480, low: 2468, close: 2475, volume: 1000000 },
      { high: 2485, low: 2473, close: 2480, volume: 1100000 },
      { high: 2478, low: 2466, close: 2473, volume: 950000 },
      { high: 2483, low: 2471, close: 2478, volume: 1000000 },
      { high: 2488, low: 2476, close: 2483, volume: 1050000 },
      { high: 2482, low: 2470, close: 2477, volume: 900000 },
      { high: 2487, low: 2475, close: 2482, volume: 1000000 },
      { high: 2492, low: 2480, close: 2487, volume: 1100000 },
      { high: 2485, low: 2473, close: 2480, volume: 950000 },
      { high: 2490, low: 2478, close: 2485, volume: 1000000 },
      { high: 2495, low: 2483, close: 2490, volume: 1050000 }
    ],
    expectedScore: {
      min: 50,
      max: 70,
      trendScore: 4,
      setupType: null
    },
    description: 'Moderate setup: choppy uptrend, inconsistent volume'
  }
};

module.exports = {
  scoringTestData
};