/**
 * Main Scanner - The Orchestrator
 * 
 * Coordinates all modules to scan stocks and generate watchlist:
 * 1. Fetch stock data
 * 2. Score each stock
 * 3. Rank and filter
 * 4. Return results
 */

const { fetchStockUniverse, fetchStockData, fetchMarketData } = require('../data');
const { scoreStock } = require('../scoring');

/**
 * Scan stocks and return ranked watchlist
 * 
 * @param {Array<string>|string} stocks - Array of symbols or universe name ('NIFTY50')
 * @param {Object} options - Scanning options
 * @returns {Promise<Object>} - Scan results with ranked stocks
 * 
 * @example
 * const result = await scanStocks(['RELIANCE.NS', 'TCS.NS'], { 
 *   days: 50,
 *   minScore: 65,
 *   maxResults: 10
 * });
 */
async function scanStocks(stocks, options = {}) {
  const startTime = Date.now();

  // Parse options with defaults
  const {
    days = 50,              // Days of historical data
    minScore = 50,          // Minimum score to qualify
    maxResults = 20,        // Maximum results to return
    includeIndicators = true // Include indicator values in output
  } = options;

  // Input validation
  if (!stocks || (Array.isArray(stocks) && stocks.length === 0)) {
    throw new Error('Stock list cannot be empty');
  }

  if (days <= 0) {
    throw new Error('Days must be positive');
  }

  console.log('═══════════════════════════════════════');
  console.log('  Starting Stock Scan');
  console.log('═══════════════════════════════════════');

  // Step 1: Get stock list
  let stockList;
  if (typeof stocks === 'string') {
    // Universe name (e.g., 'NIFTY50')
    console.log(`\n📋 Fetching ${stocks} universe...`);
    const universe = await fetchStockUniverse(stocks);
    stockList = universe.map(s => s.symbol);
    console.log(`✓ Found ${stockList.length} stocks in ${stocks}`);
  } else {
    // Direct array of symbols
    stockList = stocks;
    console.log(`\n📋 Scanning ${stockList.length} stocks...`);
  }

  // Step 2: Fetch market data for context
  console.log('\n📊 Fetching market data...');
  let marketData = {};
  try {
    const [nifty, vix] = await Promise.all([
      fetchMarketData('NIFTY'),
      fetchMarketData('VIX')
    ]);
    marketData = { nifty, vix };
    console.log(`✓ Nifty: ${nifty.price.toFixed(2)} (${nifty.changePercent > 0 ? '+' : ''}${nifty.changePercent.toFixed(2)}%)`);
    console.log(`✓ India VIX: ${vix.value.toFixed(2)}`);
  } catch (error) {
    console.warn('⚠ Could not fetch market data:', error.message);
  }

  // Step 3: Scan each stock
  console.log(`\n🔍 Analyzing ${stockList.length} stocks...`);
  const results = [];
  const errors = [];
  
  let processed = 0;
  for (const symbol of stockList) {
    try {
      processed++;
      process.stdout.write(`\r  Progress: ${processed}/${stockList.length} (${((processed/stockList.length)*100).toFixed(0)}%)`);

      // Fetch data
      const data = await fetchStockData(symbol, days);

      // Score the stock
      const score = scoreStock(data);

      // Get stock name
      let name = symbol.replace('.NS', '');
      if (typeof stocks === 'string') {
        const universe = await fetchStockUniverse(stocks);
        const stockInfo = universe.find(s => s.symbol === symbol);
        if (stockInfo) {
          name = stockInfo.name;
        }
      }

      // Build result object
      const result = {
        symbol,
        name,
        score: score.totalScore,
        classification: score.classification,
        setupType: score.setupType,
        currentPrice: data[data.length - 1].close,
        
        // Score breakdown
        scoreBreakdown: {
          trend: score.trendScore,
          setup: score.setupScore,
          rsi: score.rsiScore,
          macd: score.macdScore,
          volume: score.volumeScore,
          bollinger: score.bollingerScore,
          marketRegime: score.marketRegimeScore
        },
        
        // Reasoning
        reasoning: score.reasoning
      };

      // Optionally include indicators
      if (includeIndicators) {
        result.indicators = score.indicators;
      }

      results.push(result);

    } catch (error) {
      errors.push({
        symbol,
        error: error.message
      });
    }
  }

  console.log('\n'); // New line after progress

  // Step 4: Rank and filter
  console.log('\n📊 Ranking and filtering results...');
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  // Filter by minimum score
  const qualifiedStocks = results.filter(stock => stock.score >= minScore);

  // Limit results
  const topStocks = qualifiedStocks.slice(0, maxResults);

  console.log(`✓ ${qualifiedStocks.length} stocks qualified (score >= ${minScore})`);
  console.log(`✓ Returning top ${topStocks.length} stocks`);

  // Step 5: Build final result
  const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

  const scanResult = {
    scanTime: new Date().toISOString(),
    executionTime: `${executionTime}s`,
    
    // Market context
    marketContext: marketData,
    
    // Scan statistics
    totalScanned: stockList.length,
    successful: results.length,
    failed: errors.length,
    qualifiedStocks: qualifiedStocks.length,
    
    // Results
    stockList: topStocks,
    
    // Errors (if any)
    errors: errors.length > 0 ? errors : undefined,
    
    // Scan parameters
    parameters: {
      days,
      minScore,
      maxResults
    }
  };

  console.log('\n═══════════════════════════════════════');
  console.log('  Scan Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`⏱  Execution Time: ${executionTime}s`);
  console.log(`✅ Success: ${results.length}/${stockList.length}`);
  console.log(`📈 Qualified: ${qualifiedStocks.length}`);
  console.log(`🎯 Top Stocks: ${topStocks.length}`);
  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`);
  }
  console.log('═══════════════════════════════════════\n');

  return scanResult;
}

/**
 * Quick scan with sensible defaults
 * 
 * @param {string} universe - Universe name ('NIFTY50', 'NIFTYNEXT50')
 * @returns {Promise<Object>} - Top 10 stocks
 */
async function quickScan(universe = 'NIFTY50') {
  return scanStocks(universe, {
    days: 50,
    minScore: 65,
    maxResults: 10
  });
}

/**
 * Deep scan with comprehensive analysis
 * 
 * @param {string} universe - Universe name
 * @returns {Promise<Object>} - All qualified stocks
 */
async function deepScan(universe = 'NIFTY50') {
  return scanStocks(universe, {
    days: 100,  // More historical data
    minScore: 50,
    maxResults: 50,
    includeIndicators: true
  });
}

module.exports = {
  scanStocks,
  quickScan,
  deepScan
};