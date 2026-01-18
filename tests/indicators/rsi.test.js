const { calculateRSI } = require('../../src/indicators/rsi');
const { samplePriceData } = require('../fixtures/test-data');

describe('RSI (Relative Strength Index) Calculator', () => {
  
  describe('Basic Functionality', () => {
    test('should calculate RSI correctly for flat prices (neutral)', () => {
      const { prices, expected } = samplePriceData.flat;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
    });

    test('should calculate 14-period RSI for real data', () => {
      const { prices, expected } = samplePriceData.reliance;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
    });

    test('should show overbought RSI for strong uptrend', () => {
      const { prices, expected } = samplePriceData.uptrend;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
      expect(rsi14).toBeGreaterThan(70); // Overbought threshold
    });

    test('should show oversold RSI for strong downtrend', () => {
      const { prices, expected } = samplePriceData.downtrend;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
      expect(rsi14).toBeLessThan(30); // Oversold threshold
    });
  });

  describe('Extreme Cases', () => {
    test('should return 100 for all gains (pure uptrend)', () => {
      const { prices, expected } = samplePriceData.rsiTests.allGains;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
      expect(rsi14).toBe(100);
    });

    test('should return 0 for all losses (pure downtrend)', () => {
      const { prices, expected } = samplePriceData.rsiTests.allLosses;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeCloseTo(expected.rsi14, 1);
      expect(rsi14).toBe(0);
    });

    test('should return ~50 for alternating gains/losses', () => {
      const { prices } = samplePriceData.rsiTests.alternating;
      const rsi14 = calculateRSI(prices, 14);
      
      // Should be close to neutral (50)
      expect(rsi14).toBeGreaterThan(45);
      expect(rsi14).toBeLessThan(55);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when insufficient data provided', () => {
      const shortPrices = [100, 102, 104]; // Only 3 prices, need 15 for RSI(14)
      
      expect(() => {
        calculateRSI(shortPrices, 14);
      }).toThrow('Insufficient data');
    });

    test('should throw error when period is invalid', () => {
      const prices = Array(30).fill(100);
      
      expect(() => {
        calculateRSI(prices, 0);
      }).toThrow('Invalid period');
      
      expect(() => {
        calculateRSI(prices, -5);
      }).toThrow('Invalid period');
    });

    test('should throw error when prices is not an array', () => {
      expect(() => {
        calculateRSI('not an array', 14);
      }).toThrow('Prices must be an array');
    });

    test('should throw error when prices contain non-numeric values', () => {
      const invalidPrices = [100, 102, 'invalid', 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128];
      
      expect(() => {
        calculateRSI(invalidPrices, 14);
      }).toThrow('All prices must be numbers');
    });

    test('should handle minimum required data points (period + 1)', () => {
      const prices = Array(15).fill(100); // 14 + 1
      const rsi14 = calculateRSI(prices, 14);
      
      // Flat prices should give neutral RSI
      expect(rsi14).toBeCloseTo(50, 1);
    });
  });

  describe('Return Array of RSI Values', () => {
    test('should return array of all RSI values when returnArray is true', () => {
      const { prices } = samplePriceData.reliance;
      const rsiArray = calculateRSI(prices, 14, true);
      
      expect(Array.isArray(rsiArray)).toBe(true);
      expect(rsiArray.length).toBe(prices.length);
      
      // First 14 values should be null (not enough data yet)
      expect(rsiArray[0]).toBeNull();
      expect(rsiArray[13]).toBeNull();
      
      // From index 14 onwards should have values
      expect(rsiArray[14]).not.toBeNull();
      expect(rsiArray[14]).toBeGreaterThan(0);
      expect(rsiArray[14]).toBeLessThan(100);
    });

    test('should return single value when returnArray is false (default)', () => {
      const { prices } = samplePriceData.reliance;
      const rsi = calculateRSI(prices, 14);
      
      expect(typeof rsi).toBe('number');
      expect(rsi).toBeGreaterThan(0);
      expect(rsi).toBeLessThan(100);
    });
  });

  describe('Mathematical Properties', () => {
    test('RSI should always be between 0 and 100', () => {
      const { prices } = samplePriceData.reliance;
      const rsi14 = calculateRSI(prices, 14);
      
      expect(rsi14).toBeGreaterThanOrEqual(0);
      expect(rsi14).toBeLessThanOrEqual(100);
    });

    test('RSI should be higher for uptrend than downtrend', () => {
      const uptrend = samplePriceData.uptrend.prices;
      const downtrend = samplePriceData.downtrend.prices;
      
      const rsiUp = calculateRSI(uptrend, 14);
      const rsiDown = calculateRSI(downtrend, 14);
      
      expect(rsiUp).toBeGreaterThan(rsiDown);
      expect(rsiUp).toBeGreaterThan(50);
      expect(rsiDown).toBeLessThan(50);
    });

    test('shorter period RSI should be more volatile', () => {
      const { prices } = samplePriceData.reliance;
      
      const rsi7 = calculateRSI(prices, 7);
      const rsi21 = calculateRSI(prices, 21);
      
      // Both should be in same direction, but shorter period more extreme
      if (rsi7 > 50) {
        expect(rsi7).toBeGreaterThanOrEqual(rsi21);
      } else {
        expect(rsi7).toBeLessThanOrEqual(rsi21);
      }
    });

    test('RSI interpretation should be correct', () => {
      const { prices: uptrendPrices } = samplePriceData.uptrend;
      const { prices: downtrendPrices } = samplePriceData.downtrend;
      
      const rsiOverbought = calculateRSI(uptrendPrices, 14);
      const rsiOversold = calculateRSI(downtrendPrices, 14);
      
      // Overbought (>70)
      expect(rsiOverbought).toBeGreaterThan(70);
      
      // Oversold (<30)
      expect(rsiOversold).toBeLessThan(30);
    });
  });

  describe('Different Period Values', () => {
    test('should calculate RSI with period 7', () => {
      const { prices } = samplePriceData.reliance;
      const rsi7 = calculateRSI(prices, 7);
      
      expect(rsi7).toBeGreaterThan(0);
      expect(rsi7).toBeLessThan(100);
    });

    test('should calculate RSI with period 21', () => {
      const { prices } = samplePriceData.reliance;
      const rsi21 = calculateRSI(prices, 21);
      
      expect(rsi21).toBeGreaterThan(0);
      expect(rsi21).toBeLessThan(100);
    });
  });
});