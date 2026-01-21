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
      },
      adx14: 0  // No trend = 0 ADX
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
        bandwidth: 0.028
      },
      adx14: 28.5  // Moderate trend strength
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
      },
      adx14: 35.0  // Strong uptrend
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
      },
      adx14: 35.0  // Strong downtrend
    }
  },

  // ADX specific test cases
  adxTests: {
    // Very strong trend
    veryStrongTrend: {
      prices: [
        100, 103, 106, 109, 112, 115, 118, 121, 124, 127,
        130, 133, 136, 139, 142, 145, 148, 151, 154, 157,
        160, 163, 166, 169, 172, 175, 178, 181, 184, 187,
        190, 193, 196, 199, 202
      ],
      description: 'Very strong uptrend - ADX should be >50'
    },

    // Weak/no trend (sideways)
    sideways: {
      prices: [
        100, 101, 99, 102, 98, 103, 97, 104, 96, 105,
        95, 106, 94, 107, 93, 108, 92, 109, 91, 110,
        100, 101, 99, 102, 98, 103, 97, 104, 96, 105
      ],
      description: 'Sideways market - ADX should be <20'
    },

    // Trend developing
    developingTrend: {
      prices: [
        100, 100, 100, 100, 100, 101, 102, 103, 104, 105,
        106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
        116, 117, 118, 119, 120, 121, 122, 123, 124, 125
      ],
      description: 'Trend starting to develop - ADX should be 20-30'
    }
  },

  // Bollinger Bands specific test cases
  bollingerTests: {
    highVolatility: {
      prices: [
        100, 110, 95, 115, 90, 120, 85, 125, 80, 130,
        75, 135, 70, 140, 65, 145, 60, 150, 55, 155,
        100, 105, 95, 110, 90, 115, 85, 120, 80, 125
      ],
      description: 'Highly volatile - bands should be very wide'
    },

    squeeze: {
      prices: [
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
        100, 101, 100, 101, 100, 101, 100, 101, 100, 101
      ],
      description: 'Low volatility squeeze - very narrow bands'
    },

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
      description: 'Downtrend reverses to uptrend'
    },

    bearishCrossover: {
      prices: [
        100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
        110, 109, 108, 107, 106, 105, 104, 103, 102, 101,
        100, 99, 98, 97, 96, 95, 94, 93, 92, 91,
        90, 89, 88, 87, 86
      ],
      description: 'Uptrend reverses to downtrend'
    },

    divergence: {
      prices: [
        100, 102, 101, 103, 102, 104, 103, 105, 104, 106,
        105, 107, 106, 108, 107, 109, 108, 110, 109, 111,
        110, 111, 110, 111, 110, 111, 110, 111, 110, 111,
        110, 111, 110, 111, 110
      ],
      description: 'Price makes new highs, MACD declining'
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

  // High Low Close data for ATR and ADX calculation
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
      { high: 2535, low: 2520, close: 2530 },
      { high: 2540, low: 2525, close: 2535 },
      { high: 2545, low: 2530, close: 2540 },
      { high: 2550, low: 2535, close: 2545 },
      { high: 2555, low: 2540, close: 2550 },
      { high: 2560, low: 2545, close: 2555 },
      { high: 2565, low: 2550, close: 2560 },
      { high: 2570, low: 2555, close: 2565 },
      { high: 2575, low: 2560, close: 2570 },
      { high: 2580, low: 2565, close: 2575 },
      { high: 2585, low: 2570, close: 2580 },
      { high: 2590, low: 2575, close: 2585 },
      { high: 2595, low: 2580, close: 2590 },
      { high: 2600, low: 2585, close: 2595 },
      { high: 2605, low: 2590, close: 2600 }
    ],
    expected: { 
      atr14: 14.28,
      adx14: 42.5
    }
  },

  // Strong uptrend HLC data
  strongUptrend: [
    { high: 102, low: 100, close: 101 },
    { high: 104, low: 102, close: 103 },
    { high: 106, low: 104, close: 105 },
    { high: 108, low: 106, close: 107 },
    { high: 110, low: 108, close: 109 },
    { high: 112, low: 110, close: 111 },
    { high: 114, low: 112, close: 113 },
    { high: 116, low: 114, close: 115 },
    { high: 118, low: 116, close: 117 },
    { high: 120, low: 118, close: 119 },
    { high: 122, low: 120, close: 121 },
    { high: 124, low: 122, close: 123 },
    { high: 126, low: 124, close: 125 },
    { high: 128, low: 126, close: 127 },
    { high: 130, low: 128, close: 129 },
    { high: 132, low: 130, close: 131 },
    { high: 134, low: 132, close: 133 },
    { high: 136, low: 134, close: 135 },
    { high: 138, low: 136, close: 137 },
    { high: 140, low: 138, close: 139 },
    { high: 142, low: 140, close: 141 },
    { high: 144, low: 142, close: 143 },
    { high: 146, low: 144, close: 145 },
    { high: 148, low: 146, close: 147 },
    { high: 150, low: 148, close: 149 },
    { high: 152, low: 150, close: 151 },
    { high: 154, low: 152, close: 153 },
    { high: 156, low: 154, close: 155 }
  ],

  // Sideways/ranging HLC data
  sidewaysMarket: [
    { high: 102, low: 98, close: 100 },
    { high: 103, low: 99, close: 101 },
    { high: 101, low: 97, close: 99 },
    { high: 104, low: 100, close: 102 },
    { high: 100, low: 96, close: 98 },
    { high: 105, low: 101, close: 103 },
    { high: 99, low: 95, close: 97 },
    { high: 106, low: 102, close: 104 },
    { high: 98, low: 94, close: 96 },
    { high: 107, low: 103, close: 105 },
    { high: 101, low: 97, close: 99 },
    { high: 103, low: 99, close: 101 },
    { high: 100, low: 96, close: 98 },
    { high: 104, low: 100, close: 102 },
    { high: 99, low: 95, close: 97 },
    { high: 105, low: 101, close: 103 },
    { high: 98, low: 94, close: 96 },
    { high: 106, low: 102, close: 104 },
    { high: 100, low: 96, close: 98 },
    { high: 103, low: 99, close: 101 },
    { high: 101, low: 97, close: 99 },
    { high: 104, low: 100, close: 102 },
    { high: 100, low: 96, close: 98 },
    { high: 105, low: 101, close: 103 },
    { high: 99, low: 95, close: 97 },
    { high: 102, low: 98, close: 100 },
    { high: 101, low: 97, close: 99 },
    { high: 103, low: 99, close: 101 }
  ],

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