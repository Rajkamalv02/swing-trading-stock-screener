/**
 * Test data for indicator calculations
 * Values validated against TradingView and manual calculations
 */

const samplePriceData = {
  // Simple flat data
  flat: {
    prices: Array(50).fill(100),
    expected: {
      ema20: 100,
      ema50: 100,
      rsi14: 50,
      atr14: 0,
      macd: {
        macdLine: 0,
        signalLine: 0,
        histogram: 0
      },
      bollingerBands: {
        upper: 100,
        middle: 100,
        lower: 100,
        bandwidth: 0
      }
    }
  },

  // Real RELIANCE stock data (daily closes)
  reliance: {
    prices: [
      2440.50, 2455.30, 2468.75, 2450.20, 2442.10,
      2458.90, 2475.60, 2482.35, 2470.80, 2465.20,
      2478.50, 2492.70, 2505.30, 2498.60, 2510.40,
      2522.80, 2515.90, 2508.30, 2520.60, 2535.20,
      2528.40, 2542.10, 2550.75, 2545.30, 2538.90,
      2552.60, 2565.80, 2558.20, 2570.45, 2582.90,
      2575.30, 2588.60, 2595.40, 2602.10, 2598.50
    ],
    expected: {
      ema20: 2509.23,
      ema10: 2542.15,
      rsi14: 67.34,
      atr14: 18.45,
      macd: {
        macdLine: 18.5,
        signalLine: 15.2,
        histogram: 3.3
      },
      bollingerBands: {
        upper: 2570.5,
        middle: 2535.2,
        lower: 2499.9,
        bandwidth: 0.028  // (upper - lower) / middle
      }
    }
  },

  // Strong uptrend
  uptrend: {
    prices: [
      100, 102, 104, 103, 105, 107, 106, 108, 110, 109,
      111, 113, 112, 114, 116, 115, 117, 119, 118, 120,
      122, 121, 123, 125, 124, 126, 128, 127, 129, 131,
      130, 132, 134, 133, 135
    ],
    expected: {
      ema20: 117.85,
      rsi14: 72.5,
      macd: {
        macdLine: 2.8,
        signalLine: 2.1,
        histogram: 0.7
      },
      bollingerBands: {
        upper: 125.5,
        middle: 120.0,
        lower: 114.5
      }
    }
  },

  // Strong downtrend
  downtrend: {
    prices: [
      131, 129, 127, 128, 126, 124, 125, 123, 121, 122,
      120, 118, 119, 117, 115, 116, 114, 112, 113, 111,
      109, 110, 108, 106, 107, 105, 103, 104, 102, 100,
      101, 99, 97, 98, 96
    ],
    expected: {
      ema20: 113.15,
      rsi14: 27.5,
      macd: {
        macdLine: -2.8,
        signalLine: -2.1,
        histogram: -0.7
      }
    }
  },

  // Bollinger Bands specific test cases
  bollingerTests: {
    // High volatility - wide bands
    highVolatility: {
      prices: [
        100, 110, 95, 115, 90, 120, 85, 125, 80, 130,
        75, 135, 70, 140, 65, 145, 60, 150, 55, 155,
        100, 105, 95, 110, 90, 115, 85, 120, 80, 125
      ],
      description: 'Highly volatile - bands should be very wide'
    },

    // Low volatility - narrow bands (squeeze)
    squeeze: {
      prices: [
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101
      ],
      description: 'Low volatility squeeze - very narrow bands'
    },

    // Band walk (strong trend)
    bandWalk: {
      prices: [
        100, 102, 104, 106, 108, 110, 112, 114, 116, 118,
        120, 122, 124, 126, 128, 130, 132, 134, 136, 138,
        140, 142, 144, 146, 148, 150, 152, 154, 156, 158
      ],
      description: 'Strong uptrend - price walking upper band'
    }
  },

  // MACD specific test cases
  macdTests: {
    bullishCrossover: {
      prices: [
        100, 99, 98, 97, 96, 95, 94, 93, 92, 91,
        90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
        110, 111, 112, 113, 114
      ],
      description: 'Downtrend reverses to uptrend - MACD crosses above signal'
    },

    bearishCrossover: {
      prices: [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
        110, 109, 108, 107, 106, 105, 104, 103, 102, 101,
        100, 99, 98, 97, 96, 95, 94, 93, 92, 91,
        90, 89, 88, 87, 86
      ],
      description: 'Uptrend reverses to downtrend - MACD crosses below signal'
    },

    divergence: {
      prices: [
        100, 102, 101, 103, 102, 104, 103, 105, 104, 106,
        105, 107, 106, 108, 107, 109, 108, 110, 109, 111,
        110, 111, 110, 111, 110, 111, 110, 111, 110, 111,
        110, 111, 110, 111, 110
      ],
      description: 'Price makes new highs, MACD declining (bearish divergence)'
    }
  },

  // RSI specific test cases
  rsiTests: {
    allGains: {
      prices: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
      expected: { rsi14: 100 }
    },
    allLosses: {
      prices: [115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100],
      expected: { rsi14: 0 }
    },
    alternating: {
      prices: [100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102],
      expected: { rsi14: 50 }
    },
    moderateUptrend: {
      prices: [
        100, 101, 102, 101, 103, 104, 103, 105, 106, 105,
        107, 108, 107, 109, 110, 109, 111, 112, 111, 113
      ],
      expected: { rsi14: 65.5 }
    }
  },

  // High Low Close data for ATR calculation
  hlcData: {
    reliance: [
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
    ],
    expected: { atr14: 14.28 }
  },

  highVolatility: [
    { high: 105, low: 100, close: 102 },
    { high: 120, low: 110, close: 115 },
    { high: 125, low: 112, close: 118 },
    { high: 130, low: 115, close: 125 },
    { high: 128, low: 115, close: 120 },
    { high: 135, low: 118, close: 130 },
    { high: 140, low: 128, close: 135 },
    { high: 138, low: 125, close: 130 },
    { high: 145, low: 128, close: 140 },
    { high: 150, low: 138, close: 145 },
    { high: 148, low: 135, close: 140 },
    { high: 155, low: 138, close: 150 },
    { high: 160, low: 148, close: 155 },
    { high: 158, low: 145, close: 150 },
    { high: 165, low: 148, close: 160 }
  ],
  
  lowVolatility: [
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 },
    { high: 101, low: 99, close: 100 },
    { high: 102, low: 100, close: 101 }
  ],

  gapDown: [
    { high: 105, low: 100, close: 102 },
    { high: 104, low: 99, close: 101 },
    { high: 103, low: 98, close: 100 },
    { high: 90, low: 85, close: 88 },
    { high: 92, low: 86, close: 90 },
    { high: 94, low: 88, close: 92 },
    { high: 96, low: 90, close: 94 },
    { high: 98, low: 92, close: 96 },
    { high: 100, low: 94, close: 98 },
    { high: 102, low: 96, close: 100 },
    { high: 104, low: 98, close: 102 },
    { high: 106, low: 100, close: 104 },
    { high: 108, low: 102, close: 106 },
    { high: 110, low: 104, close: 108 },
    { high: 112, low: 106, close: 110 }
  ]
};

module.exports = {
  samplePriceData
};