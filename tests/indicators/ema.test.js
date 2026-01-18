const { calculateEMA } = require('../../src/indicators/ema');
const { samplePriceData } = require('../fixtures/test-data');

describe('EMA (Exponential Moving Average) Calculator', () => {
  
  describe('Basic Functionality', () => {
    test('should calculate EMA correctly for flat prices', () => {
      const { prices, expected } = samplePriceData.flat;
      const ema20 = calculateEMA(prices, 20);
      
      expect(ema20).toBe(expected.ema20);
    });

    test('should calculate 20-period EMA for real data', () => {
      const { prices, expected } = samplePriceData.reliance;
      const ema20 = calculateEMA(prices, 20);
      
      // Allow small floating point difference (within 0.5)
      expect(ema20).toBeCloseTo(expected.ema20, 1);
    });

    test('should calculate 10-period EMA for real data', () => {
      const { prices, expected } = samplePriceData.reliance;
      const ema10 = calculateEMA(prices, 10);
      
      expect(ema10).toBeCloseTo(expected.ema10, 1);
    });

    test('should calculate EMA for uptrend data', () => {
      const { prices, expected } = samplePriceData.uptrend;
      const ema20 = calculateEMA(prices, 20);
      
      expect(ema20).toBeCloseTo(expected.ema20, 1);
    });

    test('should calculate EMA for downtrend data', () => {
      const { prices, expected } = samplePriceData.downtrend;
      const ema20 = calculateEMA(prices, 20);
      
      expect(ema20).toBeCloseTo(expected.ema20, 1);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when insufficient data provided', () => {
      const shortPrices = [100, 102, 104]; // Only 3 prices
      
      expect(() => {
        calculateEMA(shortPrices, 20);
      }).toThrow('Insufficient data');
    });

    test('should throw error when period is invalid', () => {
      const prices = Array(30).fill(100);
      
      expect(() => {
        calculateEMA(prices, 0);
      }).toThrow('Invalid period');
      
      expect(() => {
        calculateEMA(prices, -5);
      }).toThrow('Invalid period');
    });

    test('should throw error when prices is not an array', () => {
      expect(() => {
        calculateEMA('not an array', 20);
      }).toThrow('Prices must be an array');
    });

    test('should throw error when prices contain non-numeric values', () => {
      const invalidPrices = [100, 102, 'invalid', 106];
      
      expect(() => {
        calculateEMA(invalidPrices, 20);
      }).toThrow('All prices must be numbers');
    });

    test('should handle minimum required data points', () => {
      const prices = Array(20).fill(100);
      const ema20 = calculateEMA(prices, 20);
      
      expect(ema20).toBe(100);
    });
  });

  describe('Return Array of EMA Values', () => {
    test('should return array of all EMA values when returnArray is true', () => {
      const prices = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118];
      const emaArray = calculateEMA(prices, 5, true);
      
      expect(Array.isArray(emaArray)).toBe(true);
      expect(emaArray.length).toBe(prices.length);
      expect(emaArray[emaArray.length - 1]).toBeCloseTo(112.67, 1);
    });

    test('should return single value when returnArray is false (default)', () => {
      const prices = [100, 102, 104, 106, 108, 110];
      const ema = calculateEMA(prices, 5);
      
      expect(typeof ema).toBe('number');
      expect(ema).toBeGreaterThan(0);
    });
  });

  describe('Mathematical Properties', () => {
    test('EMA should be between min and max prices for stable data', () => {
      const prices = [98, 100, 102, 100, 98, 100, 102, 100, 98, 100];
      const ema5 = calculateEMA(prices, 5);
      
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      
      expect(ema5).toBeGreaterThanOrEqual(min);
      expect(ema5).toBeLessThanOrEqual(max);
    });

    test('EMA should react faster to recent prices (shorter period)', () => {
      const prices = [100, 100, 100, 100, 100, 120, 120, 120]; // Sudden jump
      
      const ema3 = calculateEMA(prices, 3);
      const ema10 = calculateEMA(prices, 5);
      
      // Shorter period should be closer to recent prices (120)
      expect(ema3).toBeGreaterThan(ema10);
    });
  });
});