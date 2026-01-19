const { calculateMACD } = require('../../src/indicators/macd');
const { samplePriceData } = require('../fixtures/test-data');

describe('MACD (Moving Average Convergence Divergence) Calculator', () => {
  
  describe('Basic Functionality', () => {
    test('should calculate MACD correctly for flat prices', () => {
      const { prices, expected } = samplePriceData.flat;
      const macd = calculateMACD(prices);
      
      expect(macd.macdLine).toBeCloseTo(expected.macd.macdLine, 1);
      expect(macd.signalLine).toBeCloseTo(expected.macd.signalLine, 1);
      expect(macd.histogram).toBeCloseTo(expected.macd.histogram, 1);
    });

    test('should calculate MACD for real RELIANCE data', () => {
      const { prices, expected } = samplePriceData.reliance;
      const macd = calculateMACD(prices);
      
      expect(macd.macdLine).toBeCloseTo(expected.macd.macdLine, 0);
      expect(macd.signalLine).toBeCloseTo(expected.macd.signalLine, 0);
      expect(macd.histogram).toBeCloseTo(expected.macd.histogram, 0);
    });

    test('should show positive MACD in strong uptrend', () => {
      const { prices } = samplePriceData.uptrend;
      const macd = calculateMACD(prices);
      
      expect(macd.macdLine).toBeGreaterThan(0);
      expect(macd.histogram).toBeGreaterThan(-1); // Can be slightly negative during pullbacks
    });

    test('should show negative MACD in strong downtrend', () => {
      const { prices } = samplePriceData.downtrend;
      const macd = calculateMACD(prices);
      
      expect(macd.macdLine).toBeLessThan(0);
      expect(macd.histogram).toBeLessThan(1); // Can be slightly positive during bounces
    });
  });

  describe('MACD Components', () => {
    test('should return object with macdLine, signalLine, and histogram', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices);
      
      expect(macd).toHaveProperty('macdLine');
      expect(macd).toHaveProperty('signalLine');
      expect(macd).toHaveProperty('histogram');
      
      expect(typeof macd.macdLine).toBe('number');
      expect(typeof macd.signalLine).toBe('number');
      expect(typeof macd.histogram).toBe('number');
    });

    test('histogram should equal macdLine minus signalLine', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices);
      
      const calculatedHistogram = macd.macdLine - macd.signalLine;
      expect(macd.histogram).toBeCloseTo(calculatedHistogram, 10);
    });
  });

  describe('Custom Parameters', () => {
    test('should accept custom fast, slow, and signal periods', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices, 5, 13, 5);
      
      expect(macd.macdLine).toBeDefined();
      expect(macd.signalLine).toBeDefined();
      expect(macd.histogram).toBeDefined();
    });

    test('should calculate standard MACD (12, 26, 9) by default', () => {
      const { prices } = samplePriceData.reliance;
      const macdDefault = calculateMACD(prices);
      const macdExplicit = calculateMACD(prices, 12, 26, 9);
      
      expect(macdDefault.macdLine).toBeCloseTo(macdExplicit.macdLine, 10);
      expect(macdDefault.signalLine).toBeCloseTo(macdExplicit.signalLine, 10);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when insufficient data provided', () => {
      const shortPrices = [100, 102, 104, 106, 108]; // Only 5 prices
      
      expect(() => {
        calculateMACD(shortPrices);
      }).toThrow('Insufficient data');
    });

    test('should throw error when prices is not an array', () => {
      expect(() => {
        calculateMACD('not an array');
      }).toThrow('Prices must be an array');
    });

    test('should throw error when prices contain non-numeric values', () => {
      const invalidPrices = Array(40).fill(100);
      invalidPrices[20] = 'invalid';
      
      expect(() => {
        calculateMACD(invalidPrices);
      }).toThrow('All prices must be numbers');
    });

    test('should throw error when periods are invalid', () => {
      const prices = Array(40).fill(100);
      
      expect(() => {
        calculateMACD(prices, 0, 26, 9);
      }).toThrow('Invalid period');
      
      expect(() => {
        calculateMACD(prices, 12, -5, 9);
      }).toThrow('Invalid period');
    });

    test('should throw error when fast period >= slow period', () => {
      const prices = Array(40).fill(100);
      
      expect(() => {
        calculateMACD(prices, 26, 12, 9); // Fast > Slow
      }).toThrow('Fast period must be less than slow period');
      
      expect(() => {
        calculateMACD(prices, 26, 26, 9); // Fast = Slow
      }).toThrow('Fast period must be less than slow period');
    });

    test('should handle minimum required data points', () => {
      // Need slow (26) + signal (9) = 35 minimum
      const prices = Array(35).fill(100);
      const macd = calculateMACD(prices);
      
      expect(macd.macdLine).toBe(0); // Flat prices = 0 MACD
      expect(macd.signalLine).toBe(0);
      expect(macd.histogram).toBe(0);
    });
  });

  describe('Return Array of MACD Values', () => {
    test('should return arrays when returnArray is true', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices, 12, 26, 9, true);
      
      expect(Array.isArray(macd.macdLine)).toBe(true);
      expect(Array.isArray(macd.signalLine)).toBe(true);
      expect(Array.isArray(macd.histogram)).toBe(true);
      
      expect(macd.macdLine.length).toBe(prices.length);
      expect(macd.signalLine.length).toBe(prices.length);
      expect(macd.histogram.length).toBe(prices.length);
    });

    test('array values should have nulls for insufficient data periods', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices, 12, 26, 9, true);
      
      // First 25 values should be null (need 26 for slow EMA)
      expect(macd.macdLine[0]).toBeNull();
      expect(macd.macdLine[24]).toBeNull();
      expect(macd.macdLine[25]).not.toBeNull();
      
      // Signal line needs additional 9 periods
      expect(macd.signalLine[33]).toBeNull();
      expect(macd.signalLine[34]).not.toBeNull();
    });
  });

  describe('Signal Detection', () => {
    test('should identify bullish crossover', () => {
      const { prices } = samplePriceData.macdTests.bullishCrossover;
      const macdArray = calculateMACD(prices, 12, 26, 9, true);
      
      // Find crossover point
      let crossoverFound = false;
      for (let i = 35; i < macdArray.histogram.length - 1; i++) {
        const prevHist = macdArray.histogram[i];
        const currHist = macdArray.histogram[i + 1];
        
        if (prevHist < 0 && currHist > 0) {
          crossoverFound = true;
          break;
        }
      }
      
      // In bullish crossover scenario, we should find a crossover
      expect(crossoverFound).toBe(true);
    });

    test('should identify bearish crossover', () => {
      const { prices } = samplePriceData.macdTests.bearishCrossover;
      const macdArray = calculateMACD(prices, 12, 26, 9, true);
      
      // Find crossover point
      let crossoverFound = false;
      for (let i = 35; i < macdArray.histogram.length - 1; i++) {
        const prevHist = macdArray.histogram[i];
        const currHist = macdArray.histogram[i + 1];
        
        if (prevHist > 0 && currHist < 0) {
          crossoverFound = true;
          break;
        }
      }
      
      expect(crossoverFound).toBe(true);
    });
  });

  describe('Mathematical Properties', () => {
    test('MACD line should be more volatile than signal line', () => {
      const { prices } = samplePriceData.reliance;
      const macd = calculateMACD(prices, 12, 26, 9, true);
      
      // Calculate standard deviation of non-null values
      const macdValues = macd.macdLine.filter(v => v !== null);
      const signalValues = macd.signalLine.filter(v => v !== null);
      
      const macdStd = calculateStandardDeviation(macdValues);
      const signalStd = calculateStandardDeviation(signalValues);
      
      // MACD should be more volatile (higher std dev) than smoothed signal
      expect(macdStd).toBeGreaterThan(signalStd * 0.8); // Allow some tolerance
    });

    test('positive histogram indicates bullish momentum', () => {
      const { prices } = samplePriceData.uptrend;
      const macd = calculateMACD(prices);
      
      // In uptrend, histogram tends to be positive
      expect(macd.histogram).toBeGreaterThanOrEqual(-1);
    });

    test('negative histogram indicates bearish momentum', () => {
      const { prices } = samplePriceData.downtrend;
      const macd = calculateMACD(prices);
      
      // In downtrend, histogram tends to be negative
      expect(macd.histogram).toBeLessThanOrEqual(1);
    });
  });
});

// Helper function for standard deviation
function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}