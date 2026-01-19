const { calculateBollingerBands } = require('../../src/indicators/bollinger-bands');
const { samplePriceData } = require('../fixtures/test-data');

describe('Bollinger Bands Calculator', () => {
  
  describe('Basic Functionality', () => {
    test('should calculate Bollinger Bands correctly for flat prices', () => {
      const { prices, expected } = samplePriceData.flat;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.upper).toBeCloseTo(expected.bollingerBands.upper, 1);
      expect(bb.middle).toBeCloseTo(expected.bollingerBands.middle, 1);
      expect(bb.lower).toBeCloseTo(expected.bollingerBands.lower, 1);
      expect(bb.bandwidth).toBeCloseTo(expected.bollingerBands.bandwidth, 3);
    });

    test('should calculate Bollinger Bands for real RELIANCE data', () => {
      const { prices, expected } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.upper).toBeCloseTo(expected.bollingerBands.upper, 0);
      expect(bb.middle).toBeCloseTo(expected.bollingerBands.middle, 0);
      expect(bb.lower).toBeCloseTo(expected.bollingerBands.lower, 0);
      expect(bb.bandwidth).toBeCloseTo(expected.bollingerBands.bandwidth, 2);
    });

    test('should have wider bands for uptrend data', () => {
      const { prices } = samplePriceData.uptrend;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.upper).toBeGreaterThan(bb.middle);
      expect(bb.middle).toBeGreaterThan(bb.lower);
      expect(bb.bandwidth).toBeGreaterThan(0);
    });
  });

  describe('Bollinger Band Components', () => {
    test('should return object with upper, middle, lower, bandwidth', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices);
      
      expect(bb).toHaveProperty('upper');
      expect(bb).toHaveProperty('middle');
      expect(bb).toHaveProperty('lower');
      expect(bb).toHaveProperty('bandwidth');
      expect(bb).toHaveProperty('percentB');
      
      expect(typeof bb.upper).toBe('number');
      expect(typeof bb.middle).toBe('number');
      expect(typeof bb.lower).toBe('number');
      expect(typeof bb.bandwidth).toBe('number');
    });

    test('middle band should be SMA of prices', () => {
      const prices = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138];
      const bb = calculateBollingerBands(prices, 20, 2);
      
      // Calculate SMA manually
      const sma = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      
      expect(bb.middle).toBeCloseTo(sma, 10);
    });

    test('bandwidth should be (upper - lower) / middle', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      const calculatedBandwidth = (bb.upper - bb.lower) / bb.middle;
      expect(bb.bandwidth).toBeCloseTo(calculatedBandwidth, 10);
    });

    test('%B should be (price - lower) / (upper - lower)', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      const currentPrice = prices[prices.length - 1];
      const calculatedPercentB = (currentPrice - bb.lower) / (bb.upper - bb.lower);
      
      expect(bb.percentB).toBeCloseTo(calculatedPercentB, 10);
    });
  });

  describe('Volatility Scenarios', () => {
    test('high volatility should produce wide bands', () => {
      const { prices } = samplePriceData.bollingerTests.highVolatility;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.bandwidth).toBeGreaterThan(0.1); // Wide bands
    });

    test('low volatility (squeeze) should produce narrow bands', () => {
      const { prices } = samplePriceData.bollingerTests.squeeze;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.bandwidth).toBeLessThan(0.05); // Very narrow bands
    });

    test('band walk (strong trend) should have price near upper band', () => {
      const { prices } = samplePriceData.bollingerTests.bandWalk;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      // %B should be close to 1 (price near upper band)
      expect(bb.percentB).toBeGreaterThan(0.8);
    });
  });

  describe('Custom Parameters', () => {
    test('should accept custom period and std dev multiplier', () => {
      const { prices } = samplePriceData.reliance;
      const bb1 = calculateBollingerBands(prices, 10, 1.5);
      const bb2 = calculateBollingerBands(prices, 30, 2.5);
      
      expect(bb1.middle).toBeDefined();
      expect(bb2.middle).toBeDefined();
      expect(bb1.middle).not.toEqual(bb2.middle);
    });

    test('should use default parameters (20, 2) when not specified', () => {
      const { prices } = samplePriceData.reliance;
      const bbDefault = calculateBollingerBands(prices);
      const bbExplicit = calculateBollingerBands(prices, 20, 2);
      
      expect(bbDefault.upper).toBeCloseTo(bbExplicit.upper, 10);
      expect(bbDefault.middle).toBeCloseTo(bbExplicit.middle, 10);
      expect(bbDefault.lower).toBeCloseTo(bbExplicit.lower, 10);
    });

    test('higher std dev multiplier should produce wider bands', () => {
      const { prices } = samplePriceData.reliance;
      const bb2 = calculateBollingerBands(prices, 20, 2);
      const bb3 = calculateBollingerBands(prices, 20, 3);
      
      expect(bb3.bandwidth).toBeGreaterThan(bb2.bandwidth);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when insufficient data provided', () => {
      const shortPrices = [100, 102, 104]; // Only 3 prices
      
      expect(() => {
        calculateBollingerBands(shortPrices, 20);
      }).toThrow('Insufficient data');
    });

    test('should throw error when period is invalid', () => {
      const prices = Array(30).fill(100);
      
      expect(() => {
        calculateBollingerBands(prices, 0);
      }).toThrow('Invalid period');
      
      expect(() => {
        calculateBollingerBands(prices, -5);
      }).toThrow('Invalid period');
    });

    test('should throw error when prices is not an array', () => {
      expect(() => {
        calculateBollingerBands('not an array');
      }).toThrow('Prices must be an array');
    });

    test('should throw error when prices contain non-numeric values', () => {
      const invalidPrices = [100, 102, 'invalid', 106, 108];
      
      expect(() => {
        calculateBollingerBands(invalidPrices, 5);
      }).toThrow('All prices must be numbers');
    });

    test('should handle minimum required data points', () => {
      const prices = Array(20).fill(100); // Exactly 20 prices for period 20
      const bb = calculateBollingerBands(prices, 20, 2);
      
      // Flat prices should have zero bandwidth
      expect(bb.bandwidth).toBe(0);
      expect(bb.upper).toBe(100);
      expect(bb.middle).toBe(100);
      expect(bb.lower).toBe(100);
    });
  });

  describe('Return Array of Bollinger Band Values', () => {
    test('should return arrays when returnArray is true', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2, true);
      
      expect(Array.isArray(bb.upper)).toBe(true);
      expect(Array.isArray(bb.middle)).toBe(true);
      expect(Array.isArray(bb.lower)).toBe(true);
      expect(Array.isArray(bb.bandwidth)).toBe(true);
      
      expect(bb.upper.length).toBe(prices.length);
      expect(bb.middle.length).toBe(prices.length);
      expect(bb.lower.length).toBe(prices.length);
    });

    test('array values should have nulls for insufficient data periods', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2, true);
      
      // First 19 values should be null (need 20 for SMA)
      expect(bb.upper[0]).toBeNull();
      expect(bb.upper[18]).toBeNull();
      expect(bb.upper[19]).not.toBeNull();
    });
  });

  describe('Mathematical Properties', () => {
    test('upper band should always be greater than middle band', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.upper).toBeGreaterThanOrEqual(bb.middle);
    });

    test('middle band should always be greater than lower band', () => {
      const { prices } = samplePriceData.reliance;
      const bb = calculateBollingerBands(prices, 20, 2);
      
      expect(bb.middle).toBeGreaterThanOrEqual(bb.lower);
    });

    test('%B of 0 means price at lower band', () => {
      // Create scenario where price is at lower band
      const prices = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 
                     100, 100, 100, 100, 100, 100, 100, 100, 100, 90];
      const bb = calculateBollingerBands(prices, 20, 2);
      
      // Last price (90) should be at or below lower band
      expect(bb.percentB).toBeLessThan(0.1);
    });

    test('%B of 1 means price at upper band', () => {
      // Create scenario where price is at upper band
      const prices = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 
                     100, 100, 100, 100, 100, 100, 100, 100, 100, 110];
      const bb = calculateBollingerBands(prices, 20, 2);
      
      // Last price (110) should be at or above upper band
      expect(bb.percentB).toBeGreaterThan(0.9);
    });

    test('bandwidth should increase with volatility', () => {
      const stablePrices = [100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
                           100, 101, 100, 101, 100, 101, 100, 101, 100, 101];
      const volatilePrices = [100, 110, 90, 115, 85, 120, 80, 125, 75, 130,
                             70, 135, 65, 140, 60, 145, 55, 150, 50, 155];
      
      const bbStable = calculateBollingerBands(stablePrices, 20, 2);
      const bbVolatile = calculateBollingerBands(volatilePrices, 20, 2);
      
      expect(bbVolatile.bandwidth).toBeGreaterThan(bbStable.bandwidth);
    });
  });

  describe('Squeeze Detection', () => {
    test('should detect squeeze (narrowest bandwidth in period)', () => {
      const { prices } = samplePriceData.bollingerTests.squeeze;
      const bb = calculateBollingerBands(prices, 20, 2, true);
      
      // Calculate bandwidth for all periods
      const bandwidths = bb.bandwidth.filter(bw => bw !== null);
      const latestBandwidth = bandwidths[bandwidths.length - 1];
      const minBandwidth = Math.min(...bandwidths);
      
      // Latest bandwidth should be very close to minimum (squeeze)
      expect(latestBandwidth).toBeCloseTo(minBandwidth, 1);
    });
  });
});