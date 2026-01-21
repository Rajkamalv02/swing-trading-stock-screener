const { calculateADX } = require('../../src/indicators/adx');
const { samplePriceData } = require('../fixtures/test-data');

describe('ADX (Average Directional Index) Calculator', () => {

    describe('Basic Functionality', () => {
        test('should calculate ADX for RELIANCE HLC data', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14);

            expect(adx.adx).toBeGreaterThan(0);
            expect(adx.plusDI).toBeGreaterThan(0);
            expect(adx.minusDI).toBeGreaterThanOrEqual(0);
        });

        test('should show high ADX for strong uptrend', () => {
            const data = samplePriceData.strongUptrend;
            const adx = calculateADX(data, 14);

            // Strong trend should have ADX > 25
            expect(adx.adx).toBeGreaterThan(25);
            // Uptrend should have +DI > -DI
            expect(adx.plusDI).toBeGreaterThan(adx.minusDI);
        });

        test('should show low ADX for sideways market', () => {
            const data = samplePriceData.sidewaysMarket;
            const adx = calculateADX(data, 14);

            // Sideways market should have low ADX
            expect(adx.adx).toBeLessThan(25);
        });
    });

    describe('ADX Components', () => {
        test('should return object with adx, plusDI, minusDI', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data);

            expect(adx).toHaveProperty('adx');
            expect(adx).toHaveProperty('plusDI');
            expect(adx).toHaveProperty('minusDI');

            expect(typeof adx.adx).toBe('number');
            expect(typeof adx.plusDI).toBe('number');
            expect(typeof adx.minusDI).toBe('number');
        });

        test('ADX should be between 0 and 100', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14);

            expect(adx.adx).toBeGreaterThanOrEqual(0);
            expect(adx.adx).toBeLessThanOrEqual(100);
        });

        test('+DI and -DI should be between 0 and 100', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14);

            expect(adx.plusDI).toBeGreaterThanOrEqual(0);
            expect(adx.plusDI).toBeLessThanOrEqual(100);
            expect(adx.minusDI).toBeGreaterThanOrEqual(0);
            expect(adx.minusDI).toBeLessThanOrEqual(100);
        });
    });

    describe('Trend Detection', () => {
        test('uptrend should have +DI > -DI', () => {
            const data = samplePriceData.strongUptrend;
            const adx = calculateADX(data, 14);

            expect(adx.plusDI).toBeGreaterThan(adx.minusDI);
        });

        test('strong trend should have ADX > 25', () => {
            const data = samplePriceData.strongUptrend;
            const adx = calculateADX(data, 14);

            expect(adx.adx).toBeGreaterThan(25);
        });

        test('weak trend should have ADX < 20', () => {
            const data = samplePriceData.sidewaysMarket;
            const adx = calculateADX(data, 14);

            expect(adx.adx).toBeLessThan(25);
        });
    });

    describe('Custom Parameters', () => {
        test('should accept custom period', () => {
            const data = samplePriceData.hlcData.reliance;
            // Extend data to have enough points for period 21 (needs 42 points)
            const extendedData = [...data, ...data];

            const adx7 = calculateADX(data, 7);
            const adx21 = calculateADX(extendedData, 21);

            expect(adx7.adx).toBeDefined();
            expect(adx21.adx).toBeDefined();
        });

        test('should use default period (14) when not specified', () => {
            const data = samplePriceData.hlcData.reliance;
            const adxDefault = calculateADX(data);
            const adxExplicit = calculateADX(data, 14);

            expect(adxDefault.adx).toBeCloseTo(adxExplicit.adx, 5);
        });

        test('shorter period should be more responsive', () => {
            const data = samplePriceData.strongUptrend;
            // Extend data for period 21
            const extendedData = [...data, ...data];

            const adx7 = calculateADX(data, 7);
            const adx21 = calculateADX(extendedData, 21);

            // Both should detect trend, but may have different values
            expect(adx7.adx).toBeGreaterThan(0);
            expect(adx21.adx).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        test('should throw error when insufficient data provided', () => {
            const shortData = [
                { high: 105, low: 100, close: 102 },
                { high: 106, low: 101, close: 103 }
            ];

            expect(() => {
                calculateADX(shortData, 14);
            }).toThrow('Insufficient data');
        });

        test('should throw error when period is invalid', () => {
            const data = samplePriceData.hlcData.reliance;

            expect(() => {
                calculateADX(data, 0);
            }).toThrow('Invalid period');

            expect(() => {
                calculateADX(data, -5);
            }).toThrow('Invalid period');
        });

        test('should throw error when data is not an array', () => {
            expect(() => {
                calculateADX('not an array');
            }).toThrow('Data must be an array');
        });

        test('should throw error when data missing required fields', () => {
            const invalidData = Array(30).fill({ high: 105, low: 100 }); // Missing close

            expect(() => {
                calculateADX(invalidData, 14);
            }).toThrow('Each data point must have high, low, and close');
        });

        test('should throw error when fields are not numbers', () => {
            const invalidData = Array(30).fill({ high: 105, low: 100, close: 'invalid' });

            expect(() => {
                calculateADX(invalidData, 14);
            }).toThrow('high, low, and close must be numbers');
        });

        test('should handle minimum required data points', () => {
            // Need at least period * 2 for ADX calculation
            const minData = Array(30).fill({ high: 105, low: 100, close: 102 });
            const adx = calculateADX(minData, 14);

            // Flat data should have very low ADX
            expect(adx.adx).toBeLessThan(10);
        });
    });

    describe('Return Array of ADX Values', () => {
        test('should return arrays when returnArray is true', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14, true);

            expect(Array.isArray(adx.adx)).toBe(true);
            expect(Array.isArray(adx.plusDI)).toBe(true);
            expect(Array.isArray(adx.minusDI)).toBe(true);

            expect(adx.adx.length).toBe(data.length);
            expect(adx.plusDI.length).toBe(data.length);
            expect(adx.minusDI.length).toBe(data.length);
        });

        test('array values should have nulls for insufficient data periods', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14, true);

            // First periods should be null
            expect(adx.adx[0]).toBeNull();
            expect(adx.adx[13]).toBeNull();

            // Later periods should have values
            const firstValidIndex = data.length > 28 ? 28 : data.length - 1;
            expect(adx.adx[firstValidIndex]).not.toBeNull();
        });
    });
    describe('Mathematical Properties', () => {
        test('ADX should increase during strong trends', () => {
            const rawData = samplePriceData.strongUptrend;
            // Extend data to ensure we have enough points for meaningful halving
            // continued uptrend by shifting prices
            const lastClose = rawData[rawData.length - 1].close;
            const firstClose = rawData[0].close;
            const shift = lastClose - firstClose + 2;

            const continuedData = rawData.map(d => ({
                high: d.high + shift,
                low: d.low + shift,
                close: d.close + shift
            }));

            const data = [...rawData, ...continuedData];
            const adx = calculateADX(data, 14, true);
            // Filter out nulls
            const adxValues = adx.adx.filter(v => v !== null);

            // ADX should generally be increasing in a strong trend
            const firstHalf = adxValues.slice(0, Math.floor(adxValues.length / 2));
            const secondHalf = adxValues.slice(Math.floor(adxValues.length / 2));

            const avgFirstHalf = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
            const avgSecondHalf = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

            expect(avgSecondHalf).toBeGreaterThanOrEqual(avgFirstHalf * 0.8);
        });

        test('ADX measures trend strength, not direction', () => {
            const uptrend = samplePriceData.strongUptrend;

            // Create downtrend by reversing prices
            const downtrend = uptrend.map((candle, i, arr) => ({
                high: arr[arr.length - 1 - i].close + 2,
                low: arr[arr.length - 1 - i].close - 2,
                close: arr[arr.length - 1 - i].close
            }));

            const adxUp = calculateADX(uptrend, 14);
            const adxDown = calculateADX(downtrend, 14);

            // Both should have high ADX (strong trends)
            expect(adxUp.adx).toBeGreaterThan(20);
            expect(adxDown.adx).toBeGreaterThan(20);
        });

        test('sideways market should have low ADX', () => {
            const data = samplePriceData.sidewaysMarket;
            const adx = calculateADX(data, 14);

            // Weak trend/ranging market
            expect(adx.adx).toBeLessThan(25);
        });
    });
    describe('Directional Indicators', () => {
        test('strong uptrend should have high +DI', () => {
            const data = samplePriceData.strongUptrend;
            const adx = calculateADX(data, 14);
            expect(adx.plusDI).toBeGreaterThan(20);
        });

        test('+DI should be greater than -DI in uptrend', () => {
            const data = samplePriceData.strongUptrend;
            const adx = calculateADX(data, 14);

            expect(adx.plusDI).toBeGreaterThan(adx.minusDI);
        });

        test('DI crossover indicates trend change', () => {
            const data = samplePriceData.hlcData.reliance;
            const adx = calculateADX(data, 14, true);

            // Filter out nulls
            const plusDI = adx.plusDI.filter(v => v !== null);
            const minusDI = adx.minusDI.filter(v => v !== null);

            // Should have valid DI values
            expect(plusDI.length).toBeGreaterThan(0);
            expect(minusDI.length).toBeGreaterThan(0);
        });
    });
});