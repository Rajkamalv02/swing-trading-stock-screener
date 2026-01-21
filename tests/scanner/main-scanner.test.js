const { scanStocks } = require('../../src/scanner/main-scanner');

describe('Main Scanner', () => {
  
  describe('Basic Scanning', () => {
    test('should scan a list of stocks and return results', async () => {
      // Test with a small subset to avoid long API calls
      const stocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];
      
      const result = await scanStocks(stocks, { days: 50 });
      
      expect(result).toHaveProperty('scanTime');
      expect(result).toHaveProperty('totalScanned');
      expect(result).toHaveProperty('qualifiedStocks');
      expect(result).toHaveProperty('stockList');
      expect(Array.isArray(result.stockList)).toBe(true);
    }, 60000); // 60s timeout

    test('should return stocks sorted by score (highest first)', async () => {
      const stocks = ['RELIANCE.NS', 'TCS.NS'];
      
      const result = await scanStocks(stocks, { days: 50 });
      
      if (result.stockList.length > 1) {
        for (let i = 0; i < result.stockList.length - 1; i++) {
          expect(result.stockList[i].score).toBeGreaterThanOrEqual(
            result.stockList[i + 1].score
          );
        }
      }
    }, 60000);
  });

  describe('Filtering', () => {
    test('should filter stocks by minimum score', async () => {
      const stocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'];
      
      const result = await scanStocks(stocks, { 
        days: 50, 
        minScore: 70 
      });
      
      result.stockList.forEach(stock => {
        expect(stock.score).toBeGreaterThanOrEqual(70);
      });
    }, 60000);

    test('should limit number of results', async () => {
      const stocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'];
      
      const result = await scanStocks(stocks, { 
        days: 50, 
        maxResults: 2 
      });
      
      expect(result.stockList.length).toBeLessThanOrEqual(2);
    }, 60000);
  });

  describe('Result Structure', () => {
    test('should include all required fields for each stock', async () => {
      const stocks = ['RELIANCE.NS'];
      
      const result = await scanStocks(stocks, { days: 50 });
      
      if (result.stockList.length > 0) {
        const stock = result.stockList[0];
        
        expect(stock).toHaveProperty('symbol');
        expect(stock).toHaveProperty('name');
        expect(stock).toHaveProperty('score');
        expect(stock).toHaveProperty('classification');
        expect(stock).toHaveProperty('setupType');
        expect(stock).toHaveProperty('currentPrice');
        expect(stock).toHaveProperty('indicators');
        expect(stock).toHaveProperty('reasoning');
      }
    }, 60000);
  });

  describe('Error Handling', () => {
    test('should handle invalid symbols gracefully', async () => {
      const stocks = ['RELIANCE.NS', 'INVALID.NS', 'TCS.NS'];
      
      const result = await scanStocks(stocks, { days: 50 });
      
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    }, 60000);

    test('should throw error for empty stock list', async () => {
      await expect(scanStocks([], { days: 50 }))
        .rejects
        .toThrow('Stock list cannot be empty');
    });

    test('should throw error for invalid options', async () => {
      await expect(scanStocks(['RELIANCE.NS'], { days: 0 }))
        .rejects
        .toThrow();
    });
  });

  describe('Performance', () => {
    test('should complete scan within reasonable time', async () => {
      const stocks = ['RELIANCE.NS', 'TCS.NS'];
      const startTime = Date.now();
      
      await scanStocks(stocks, { days: 50 });
      
      const duration = Date.now() - startTime;
      
      // Should complete in less than 30 seconds for 2 stocks
      expect(duration).toBeLessThan(30000);
    }, 60000);
  });

  describe('Universe Scanning', () => {
    test('should scan Nifty 50 universe', async () => {
      const result = await scanStocks('NIFTY50', { 
        days: 50,
        maxResults: 5  // Limit to 5 to keep test fast
      });
      
      expect(result.totalScanned).toBeGreaterThan(0);
      expect(result.stockList.length).toBeLessThanOrEqual(5);
    }, 180000); // 3 min timeout for full universe
  });
});