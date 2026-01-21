const { scoreStock } = require("../../src/scoring/scoring-engine");
const { scoringTestData } = require("../fixtures/scoring-test-data");

describe("Scoring Engine", () => {
  describe("Basic Functionality", () => {
    test("should score perfect bullish setup highly", () => {
      const { ohlcv, expectedScore } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      expect(result.totalScore).toBeGreaterThanOrEqual(expectedScore.min);
      expect(result.totalScore).toBeLessThanOrEqual(expectedScore.max);
      expect(result.trendScore).toBe(expectedScore.trendScore);
    });

    test("should score poor setup lowly", () => {
      const { ohlcv, expectedScore } = scoringTestData.poorSetup;
      const result = scoreStock(ohlcv);

      expect(result.totalScore).toBeGreaterThanOrEqual(expectedScore.min);
      expect(result.totalScore).toBeLessThanOrEqual(expectedScore.max);
    });

    test("should score moderate setup in middle range", () => {
      const { ohlcv, expectedScore } = scoringTestData.moderateSetup;
      const result = scoreStock(ohlcv);

      expect(result.totalScore).toBeGreaterThanOrEqual(expectedScore.min);
      expect(result.totalScore).toBeLessThanOrEqual(expectedScore.max);
    });
  });

  describe("Score Components", () => {
    test("should return all score components", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      expect(result).toHaveProperty("totalScore");
      expect(result).toHaveProperty("trendScore");
      expect(result).toHaveProperty("setupScore");
      expect(result).toHaveProperty("rsiScore");
      expect(result).toHaveProperty("macdScore");
      expect(result).toHaveProperty("volumeScore");
      expect(result).toHaveProperty("bollingerScore");
      expect(result).toHaveProperty("marketRegimeScore");
      expect(result).toHaveProperty("reasoning");
    });

    test("total score should be sum of all components", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      const calculatedTotal =
        result.trendScore +
        result.setupScore +
        result.rsiScore +
        result.macdScore +
        result.volumeScore +
        result.bollingerScore +
        result.marketRegimeScore;

      expect(result.totalScore).toBeCloseTo(calculatedTotal, 1);
    });

    test("total score should be between 0 and 100", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Trend Alignment Scoring", () => {
    test("strong uptrend should have high trend score", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      // Trend score is 0-7, then multiplied by 2.5 = max 17.5
      expect(result.trendScore).toBeGreaterThan(12); // 5+ points × 2.5
    });

    test("weak trend should have low trend score", () => {
      const { ohlcv } = scoringTestData.poorSetup;
      const result = scoreStock(ohlcv);

      expect(result.trendScore).toBeLessThan(10); // < 4 points × 2.5
    });
  });

  describe("Setup Pattern Detection", () => {
    test("should detect pullback in trend", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      expect(result.setupType).toBe("PULLBACK_IN_TREND");
      expect(result.setupScore).toBeGreaterThan(10);
    });

    test("should return null setup type when no pattern", () => {
      const { ohlcv } = scoringTestData.poorSetup;
      const result = scoreStock(ohlcv);

      expect(result.setupType).toBeNull();
      expect(result.setupScore).toBeLessThan(5);
    });
  });

  describe("Market Regime Scoring", () => {
    test("strong trend should get market regime bonus", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      // Should get full or near-full regime bonus (15 points)
      expect(result.marketRegimeScore).toBeGreaterThan(10);
    });

    test("weak/no trend should get low regime score", () => {
      const { ohlcv } = scoringTestData.poorSetup;
      const result = scoreStock(ohlcv);

      expect(result.marketRegimeScore).toBeLessThan(8);
    });
  });

  describe("Reasoning Generation", () => {
    test("should generate reasoning for high score", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      expect(result.reasoning).toBeDefined();
      expect(typeof result.reasoning).toBe("string");
      expect(result.reasoning.length).toBeGreaterThan(50);
    });

    test("reasoning should mention key factors", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      const reasoning = result.reasoning.toLowerCase();

      // Should mention at least some of these
      const keywords = ["trend", "ema", "rsi", "macd", "setup"];
      const mentionsKeywords = keywords.some((keyword) =>
        reasoning.includes(keyword),
      );

      expect(mentionsKeywords).toBe(true);
    });
  });

  describe("Score Classification", () => {
    test("score >= 80 should be STRONG", () => {
      const { ohlcv } = scoringTestData.perfectBullishSetup;
      const result = scoreStock(ohlcv);

      if (result.totalScore >= 80) {
        expect(result.classification).toBe("STRONG");
      }
    });

    test("score 65-79 should be GOOD", () => {
      const { ohlcv } = scoringTestData.moderateSetup;
      const result = scoreStock(ohlcv);

      if (result.totalScore >= 65 && result.totalScore < 80) {
        expect(result.classification).toBe("GOOD");
      }
    });

    test("score < 50 should be DO_NOT_TRADE", () => {
      const { ohlcv } = scoringTestData.poorSetup;
      const result = scoreStock(ohlcv);

      if (result.totalScore < 50) {
        expect(result.classification).toBe("DO_NOT_TRADE");
      }
    });
  });

  describe("Edge Cases", () => {
    test("should throw error when insufficient data", () => {
      const shortData = [
        { high: 105, low: 100, close: 102, volume: 1000 },
        { high: 106, low: 101, close: 103, volume: 1100 },
      ];

      expect(() => {
        scoreStock(shortData);
      }).toThrow("Insufficient data");
    });

    test("should throw error when data is not an array", () => {
      expect(() => {
        scoreStock("not an array");
      }).toThrow("Data must be an array");
    });

    test("should throw error when missing required fields", () => {
      const invalidData = [
        { high: 105, low: 100, close: 102 }, // Missing volume
        { high: 106, low: 101, close: 103, volume: 1000 },
      ];

      expect(() => {
        scoreStock(invalidData);
      }).toThrow();
    });
  });
});
