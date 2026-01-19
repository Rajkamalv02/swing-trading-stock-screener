const { calculateATR, calculateTrueRange } = require('../../src/indicators/atr');
const { samplePriceData } = require('../fixtures/test-data');

describe('ATR (Average True Range) Calculator', () => {
  
  describe('True Range Calculation', () => {
    test('should calculate true range correctly for simple case', () => {
      const current = { high: 110, low: 105, close: 108 };
      const previous = { close: 106 };
      
      const tr = calculateTrueRange(current, previous);
      
      // TR = max(110-105, |110-106|, |105-106|) = max(5, 4, 1) = 5
      expect(tr).toBe(5);
    });

    test('should account for gap up correctly', () => {
      const current = { high: 120, low: 110, close: 115 };
      const previous = { close: 100 };
      
      const tr = calculateTrueRange(current, previous);
      
      // TR = max(120-110, |120-100|, |110-100|) = max(10, 20, 10) = 20
      expect(tr).toBe(20);
    });

    test('should account for gap down correctly', () => {
      const current = { high: 95, low: 85, close: 90 };
      const previous = { close: 100 };
      
      const tr = calculateTrueRange(current, previous);
      
      // TR = max(95-85, |95-100|, |85-100|) = max(10, 5, 15) = 15
      expect(tr).toBe(15);
    });

    test('should handle first candle (no previous close)', () => {
      const current = { high: 110, low: 105, close: 108 };
      
      const tr = calculateTrueRange(current);
      
      // When no previous close, TR = high - low
      expect(tr).toBe(5);
    });
  });

  describe('Basic ATR Functionality', () => {
    test('should calculate 14-period ATR for RELIANCE data', () => {
      const { reliance, expected } = samplePriceData.hlcData;
      const atr14 = calculateATR(reliance, 14);
      
      expect(atr14).toBeCloseTo(expected.atr14, 1);
    });

    test('should calculate ATR for high volatility data', () => {
      const highVol = samplePriceData.highVolatility;
      const atr14 = calculateATR(highVol, 14);
      
      // High volatility should result in high ATR
      expect(atr14).toBeGreaterThan(10);
    });

    test('should calculate ATR for low volatility data', () => {
      const lowVol = samplePriceData.lowVolatility;
      const atr14 = calculateATR(lowVol, 14);
      
      // Low volatility should result in low ATR (around 2)
      expect(atr14).toBeLessThan(3);
      expect(atr14).toBeGreaterThan(1);
    });

    test('should handle gap down scenario', () => {
      const gapDown = samplePriceData.gapDown;
      const atr14 = calculateATR(gapDown, 14);
      
      // Gap down should increase ATR
      expect(atr14).toBeGreaterThan(5);
    });
  });

  describe('Edge Cases', () => {
    test('should throw error when insufficient data provided', () => {
      const shortData = [
        { high: 105, low: 100, close: 102 },
        { high: 106, low: 101, close: 103 }
      ];
      
      expect(() => {
        calculateATR(shortData, 14);
      }).toThrow('Insufficient data');
    });

    test('should throw error when period is invalid', () => {
      const data = samplePriceData.hlcData.reliance;
      
      expect(() => {
        calculateATR(data, 0);
      }).toThrow('Invalid period');
      
      expect(() => {
        calculateATR(data, -5);
      }).toThrow('Invalid period');
    });

    test('should throw error when data is not an array', () => {
      expect(() => {
        calculateATR('not an array', 14);
      }).toThrow('Data must be an array');
    });

    test('should throw error when data missing required fields', () => {
      const invalidData = [
        { high: 105, low: 100 }, // Missing close
        { high: 106, low: 101, close: 103 }
      ];
      
      expect(() => {
        calculateATR(invalidData, 14);
      }).toThrow('Each data point must have high, low, and close');
    });

    test('should throw error when fields are not numbers', () => {
      const invalidData = [
        { high: 105, low: 100, close: 'invalid' },
        { high: 106, low: 101, close: 103 }
      ];
      
      expect(() => {
        calculateATR(invalidData, 14);
      }).toThrow('high, low, and close must be numbers');
    });

    test('should handle minimum required data points', () => {
      const minData = Array(14).fill({ high: 105, low: 100, close: 102 });
      const atr14 = calculateATR(minData, 14);
      
      // Flat data should give ATR = 5 (high - low)
      expect(atr14).toBe(5);
    });
  });

  describe('Return Array of ATR Values', () => {
    test('should return array of all ATR values when returnArray is true', () => {
      const data = samplePriceData.hlcData.reliance;
      const atrArray = calculateATR(data, 14, true);
      
      expect(Array.isArray(atrArray)).toBe(true);
      expect(atrArray.length).toBe(data.length);
      
      // First 13 values should be null (not enough data yet)
      expect(atrArray[0]).toBeNull();
      expect(atrArray[12]).toBeNull();
      
      // From index 13 onwards should have values
      expect(atrArray[13]).not.toBeNull();
      expect(atrArray[13]).toBeGreaterThan(0);
    });

    test('should return single value when returnArray is false (default)', () => {
      const data = samplePriceData.hlcData.reliance;
      const atr = calculateATR(data, 14);
      
      expect(typeof atr).toBe('number');
      expect(atr).toBeGreaterThan(0);
    });
  });

  describe('Mathematical Properties', () => {
    test('ATR should always be positive', () => {
      const data = samplePriceData.hlcData.reliance;
      const atr14 = calculateATR(data, 14);
      
      expect(atr14).toBeGreaterThan(0);
    });

    test('higher volatility should produce higher ATR', () => {
      const highVol = samplePriceData.highVolatility;
      const lowVol = samplePriceData.lowVolatility;
      
      const atrHigh = calculateATR(highVol, 14);
      const atrLow = calculateATR(lowVol, 14);
      
      expect(atrHigh).toBeGreaterThan(atrLow);
    });

    test('shorter period ATR should be more responsive', () => {
      const data = samplePriceData.hlcData.reliance;
      
      const atr7 = calculateATR(data, 7);
      const atr14 = calculateATR(data, 14);
      
      // Both should be positive
      expect(atr7).toBeGreaterThan(0);
      expect(atr14).toBeGreaterThan(0);
      
      // Values should be reasonably close for stable data
      expect(Math.abs(atr7 - atr14)).toBeLessThan(atr14 * 0.5);
    });

    test('ATR should smooth out individual spikes', () => {
      // Data with one spike
      const dataWithSpike = [
        { high: 105, low: 100, close: 102 },
        { high: 106, low: 101, close: 103 },
        { high: 107, low: 102, close: 104 },
        { high: 150, low: 140, close: 145 }, // Spike
        { high: 108, low: 103, close: 105 },
        { high: 109, low: 104, close: 106 },
        { high: 110, low: 105, close: 107 },
        { high: 111, low: 106, close: 108 },
        { high: 112, low: 107, close: 109 },
        { high: 113, low: 108, close: 110 },
        { high: 114, low: 109, close: 111 },
        { high: 115, low: 110, close: 112 },
        { high: 116, low: 111, close: 113 },
        { high: 117, low: 112, close: 114 },
        { high: 118, low: 113, close: 115 }
      ];
      
      const atr14 = calculateATR(dataWithSpike, 14);
      
      // ATR should not be as high as the spike (smoothing effect)
      expect(atr14).toBeGreaterThan(5);
      expect(atr14).toBeLessThan(50); // Much less than spike range
    });
  });

  describe('Different Period Values', () => {
    test('should calculate ATR with period 7', () => {
      const data = samplePriceData.hlcData.reliance;
      const atr7 = calculateATR(data, 7);
      
      expect(atr7).toBeGreaterThan(0);
    });

    test('should calculate ATR with period 10', () => {
      const data = samplePriceData.hlcData.reliance;
      const atr10 = calculateATR(data, 10);
      
      expect(atr10).toBeGreaterThan(0);
    });
  });

  describe('Stop-Loss Calculation Helper', () => {
    test('should calculate stop-loss based on ATR multiple', () => {
      const data = samplePriceData.hlcData.reliance;
      const currentPrice = data[data.length - 1].close;
      const atr14 = calculateATR(data, 14);
      
      // Common practice: stop-loss at 2x ATR below entry
      const stopLoss = currentPrice - (atr14 * 2);
      
      expect(stopLoss).toBeLessThan(currentPrice);
      expect(stopLoss).toBeGreaterThan(0);
      
      // Stop should be reasonable distance
      const distancePercent = ((currentPrice - stopLoss) / currentPrice) * 100;
      expect(distancePercent).toBeGreaterThan(0.5);
      expect(distancePercent).toBeLessThan(10);
    });
  });
});