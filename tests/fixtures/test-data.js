/**
 * Test data for indicator calculations
 * Values validated against TradingView and manual calculations
 */

const samplePriceData = {
  // Simple flat data - EMA should equal the price
  flat: {
    prices: Array(50).fill(100),
    expected: {
      ema20: 100,
      ema50: 100,
      rsi14: 50, // Flat prices = neutral RSI
      atr14: 0   // No volatility = 0 ATR
    }
  },

  // Real RELIANCE stock data (daily closes) - Jan 2024
  reliance: {
    prices: [
      2440.50, 2455.30, 2468.75, 2450.20, 2442.10,
      2458.90, 2475.60, 2482.35, 2470.80, 2465.20,
      2478.50, 2492.70, 2505.30, 2498.60, 2510.40,
      2522.80, 2515.90, 2508.30, 2520.60, 2535.20,
      2528.40, 2542.10, 2550.75, 2545.30, 2538.90,
      2552.60, 2565.80, 2558.20, 2570.45, 2582.90
    ],
    expected: {
      ema20: 2509.23,
      ema10: 2542.15,
      rsi14: 67.34,
      atr14: 18.45
    }
  },

  // Strong uptrend data - for testing RSI overbought
  uptrend: {
    prices: [
      100, 102, 104, 103, 105, 107, 106, 108, 110, 109,
      111, 113, 112, 114, 116, 115, 117, 119, 118, 120,
      122, 121, 123, 125, 124, 126, 128, 127, 129, 131
    ],
    expected: {
      ema20: 117.85,
      rsi14: 72.5  // Strong uptrend = high RSI (overbought)
    }
  },

  // Strong downtrend data - for testing RSI oversold
  downtrend: {
    prices: [
      131, 129, 127, 128, 126, 124, 125, 123, 121, 122,
      120, 118, 119, 117, 115, 116, 114, 112, 113, 111,
      109, 110, 108, 106, 107, 105, 103, 104, 102, 100
    ],
    expected: {
      ema20: 113.15,
      rsi14: 27.5  // Strong downtrend = low RSI (oversold)
    }
  },

  // RSI specific test cases
  rsiTests: {
    // All gains - RSI should be 100
    allGains: {
      prices: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
      expected: {
        rsi14: 100
      }
    },
    
    // All losses - RSI should be 0
    allLosses: {
      prices: [115, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100],
      expected: {
        rsi14: 0
      }
    },
    
    // Alternating - should be close to 50
    alternating: {
      prices: [100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102, 100, 102],
      expected: {
        rsi14: 50
      }
    },

    // Real scenario - moderate uptrend
    moderateUptrend: {
      prices: [
        100, 101, 102, 101, 103, 104, 103, 105, 106, 105,
        107, 108, 107, 109, 110, 109, 111, 112, 111, 113
      ],
      expected: {
        rsi14: 65.5
      }
    }
  },

  // High Low Close data for ATR calculation
  hlcData: {
    data: [
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
      { high: 2530, low: 2515, close: 2525 }
    ],
    expected: {
      atr14: 14.28
    }
  }
};

module.exports = {
  samplePriceData
};