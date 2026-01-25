/**
 * Main Scanner - The Orchestrator
 *
 * Coordinates all modules to scan stocks and generate watchlist:
 * 1. Fetch stock data
 * 2. Score each stock
 * 3. Rank and filter
 * 4. Return results
 */

const {
  fetchStockUniverse,
  fetchStockData,
  fetchMarketData,
} = require("../data");
const { scoreStock } = require("../scoring");
const {
  getLogger,
  LOG_CATEGORIES,
  configLoader,
  retryWithBackoff,
  validators,
} = require("../utils");

// Initialize logger
const logger = getLogger(LOG_CATEGORIES.SCANNER);

// Load scanner configuration
const apiConfig = configLoader.loadApiConfig();
const DEFAULT_TIMEOUT_MS = apiConfig.scanner?.timeoutMs || 30000;
const BATCH_FETCH_LIMIT = apiConfig.scanner?.batchFetchLimit || 5;

logger.info("Scanner module initialized", {
  timeout: DEFAULT_TIMEOUT_MS,
  batchLimit: BATCH_FETCH_LIMIT,
});

/**
 * Wrapper to add timeout to async operations
 *
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} - Promise that rejects if timeout exceeded
 * @throws {Error} - Timeout error
 */
async function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ]);
}

/**
 * Process a single stock: fetch data, score it, and build result
 *
 * @param {string} symbol - Stock symbol
 * @param {number} days - Days of historical data
 * @param {string} interval - Candle interval ('1d', '4h', '1h', etc.)
 * @param {Map} universeMap - Map of symbol to stock info (for name lookup)
 * @param {boolean} includeIndicators - Include indicator values in output
 * @returns {Promise<Object>} - Stock result or error object
 * @private
 */
async function processStockWithScore(
  symbol,
  days,
  interval,
  universeMap,
  includeIndicators,
) {
  const startTime = Date.now();

  try {
    logger.debug(`Processing stock: ${symbol}`, { symbol, days, interval });

    // Fetch data with timeout
    const data = await withTimeout(
      fetchStockData(symbol, days, true, interval),
    );

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No data returned from data fetcher");
    }

    logger.debug(`Data fetched for ${symbol}`, {
      symbol,
      dataPoints: data.length,
      interval,
    });

    // Score the stock with timeout
    const score = await withTimeout(Promise.resolve(scoreStock(data)));

    // Get stock name from universe map or parse from symbol
    const stockInfo = universeMap.get(symbol);
    const name =
      stockInfo?.name || symbol.replace(".NS", "").replace(".BO", "");

    // Get current price from last candle
    const lastCandle = data[data.length - 1];
    if (!lastCandle?.close) {
      throw new Error("Invalid price data");
    }

    // Build result object
    const result = {
      symbol,
      name,
      score: score.totalScore,
      classification: score.classification,
      setupType: score.setupType,
      currentPrice: lastCandle.close,

      // Score breakdown
      scoreBreakdown: {
        trend: score.trendScore,
        setup: score.setupScore,
        rsi: score.rsiScore,
        macd: score.macdScore,
        volume: score.volumeScore,
        bollinger: score.bollingerScore,
        marketRegime: score.marketRegimeScore,
      },

      // Reasoning
      reasoning: score.reasoning,
    };

    // Optionally include indicators
    if (includeIndicators && score.indicators) {
      result.indicators = score.indicators;
    }

    const duration = Date.now() - startTime;
    logger.info(`Stock processed successfully: ${symbol}`, {
      symbol,
      name,
      score: score.totalScore,
      classification: score.classification,
      durationMs: duration,
    });

    return { success: true, data: result };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Failed to process stock: ${symbol}`, error);
    logger.debug(`Stock processing failed`, {
      symbol,
      durationMs: duration,
      errorType: error.name,
    });

    return {
      success: false,
      symbol,
      error: error.message,
    };
  }
}

/**
 * Process stocks in batches to avoid API overload
 *
 * @param {Array<string>} symbols - Stock symbols to process
 * @param {number} days - Days of historical data
 * @param {Map} universeMap - Map of symbol to stock info
 * @param {boolean} includeIndicators - Include indicator values
 * @param {Function} progressCallback - Called with (processed, total) for UI updates
 * @returns {Promise<Array>} - Array of results
 * @private
 */
async function processStocksInBatches(
  symbols,
  days,
  interval,
  universeMap,
  includeIndicators,
  progressCallback,
) {
  const results = [];

  for (let i = 0; i < symbols.length; i += BATCH_FETCH_LIMIT) {
    const batch = symbols.slice(i, i + BATCH_FETCH_LIMIT);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map((symbol) =>
        processStockWithScore(
          symbol,
          days,
          interval,
          universeMap,
          includeIndicators,
        ),
      ),
    );

    results.push(...batchResults);

    // Call progress callback
    if (progressCallback) {
      progressCallback(
        Math.min(i + BATCH_FETCH_LIMIT, symbols.length),
        symbols.length,
      );
    }
  }

  return results;
}

/**
 * Scan stocks and return ranked watchlist
 *
 * @param {Array<string>|string} stocks - Array of symbols or universe name ('NIFTY50')
 * @param {Object} options - Scanning options
 * @param {number} options.days - Days of historical data (default: 50)
 * @param {string} options.interval - Candle interval: '1d' (daily), '1wk' (weekly), '1mo' (monthly) - default: '1d'
 * @param {number} options.minScore - Minimum score to qualify (default: 50)
 * @param {number} options.maxResults - Maximum results to return (default: 20)
 * @param {boolean} options.includeIndicators - Include indicator values in output (default: true)
 * @returns {Promise<Object>} - Scan results with ranked stocks
 * @throws {Error} - If input validation fails
 *
 * @example
 * // Scan with weekly candles
 * const result = await scanStocks(['RELIANCE.NS', 'TCS.NS'], {
 *   interval: '1wk',
 *   days: 50,
 *   minScore: 65,
 *   maxResults: 10
 * });
 *
 * // Scan with monthly candles
 * const result = await scanStocks('NIFTY50', {
 *   interval: '1mo',
 *   days: 50,
 *   maxResults: 5
 * });
 */
async function scanStocks(stocks, options = {}) {
  const scanStartTime = Date.now();

  logger.info("Scan initiated", {
    stocks: Array.isArray(stocks) ? stocks.length + " stocks" : stocks,
    options,
  });

  // Parse options with defaults
  const {
    days = 50, // Days of historical data
    interval = "1d", // Candle interval
    minScore = 50, // Minimum score to qualify
    maxResults = 20, // Maximum results to return
    includeIndicators = true, // Include indicator values in output
  } = options;

  // Input validation using validators module
  try {
    if (!stocks || (Array.isArray(stocks) && stocks.length === 0)) {
      throw new validators.ValidationError("Stock list cannot be empty");
    }

    // Validate scan options
    validators.validateScanOptions({ days, interval, minScore, maxResults });
  } catch (error) {
    logger.error("Validation failed", error);
    throw error;
  }

  logger.info("Input validation passed", {
    days,
    interval,
    minScore,
    maxResults,
    includeIndicators,
  });

  console.log("═══════════════════════════════════════");
  console.log("  Starting Stock Scan");
  console.log("═══════════════════════════════════════");

  // Step 1: Get stock list
  let stockList;
  let universeMap = new Map(); // For faster name lookups

  if (typeof stocks === "string") {
    // Universe name (e.g., 'NIFTY50')
    console.log(`\n📋 Fetching ${stocks} universe...`);
    logger.info(`Fetching universe: ${stocks}`, { universe: stocks });

    try {
      const universe = await fetchStockUniverse(stocks);

      if (!Array.isArray(universe) || universe.length === 0) {
        const error = new Error(`Universe '${stocks}' not found or is empty`);
        logger.error(`Universe fetch failed: ${stocks}`, error);
        throw error;
      }

      stockList = universe.map((s) => s.symbol);

      // Build universe map for O(1) lookups instead of searching array each time
      universe.forEach((stock) => {
        universeMap.set(stock.symbol, stock);
      });

      console.log(`✓ Found ${stockList.length} stocks in ${stocks}`);
    } catch (error) {
      throw new Error(`Failed to fetch universe '${stocks}': ${error.message}`);
    }
  } else {
    // Direct array of symbols
    if (!Array.isArray(stocks)) {
      throw new Error(
        "stocks must be an array of symbols or a universe name string",
      );
    }
    stockList = stocks;
    console.log(`\n📋 Scanning ${stockList.length} stocks...`);
  }

  // Step 2: Fetch market data for context (with retry logic)
  console.log("\n📊 Fetching market data...");
  let marketData = {};
  try {
    const [nifty, vix] = await Promise.all([
      retryWithBackoff(() => fetchMarketData("NIFTY"), {
        ...apiConfig.retry,
        context: "fetchMarketData(NIFTY)",
      }),
      retryWithBackoff(() => fetchMarketData("VIX"), {
        ...apiConfig.retry,
        context: "fetchMarketData(VIX)",
      }),
    ]);
    marketData = { nifty, vix };
    console.log(
      `✓ Nifty: ${nifty.price.toFixed(2)} (${nifty.changePercent > 0 ? "+" : ""}${nifty.changePercent.toFixed(2)}%)`,
    );
    console.log(`✓ India VIX: ${vix.value.toFixed(2)}`);
    logger.info("Market data fetched successfully", {
      niftyPrice: nifty.price,
      niftyChange: nifty.changePercent,
      vix: vix.value,
    });
  } catch (error) {
    console.warn("⚠ Could not fetch market data:", error.message);
    logger.warn("Failed to fetch market data after retries", error);
  }

  // Step 3: Scan stocks in parallel batches
  console.log(
    `\n🔍 Analyzing ${stockList.length} stocks (in parallel batches)...`,
  );
  logger.info(`Starting analysis of ${stockList.length} stocks`, {
    count: stockList.length,
    batchSize: BATCH_FETCH_LIMIT,
  });

  const progressCallback = (processed, total) => {
    process.stdout.write(
      `\r  Progress: ${processed}/${total} (${((processed / total) * 100).toFixed(0)}%)`,
    );
  };

  const allResults = await processStocksInBatches(
    stockList,
    days,
    interval,
    universeMap,
    includeIndicators,
    progressCallback,
  );

  console.log("\n"); // New line after progress

  // Separate successful results from errors
  const results = allResults.filter((r) => r.success).map((r) => r.data);
  const errors = allResults.filter((r) => !r.success);

  // Step 4: Rank and filter
  console.log("\n📊 Ranking and filtering results...");
  logger.info("Ranking and filtering results", {
    totalResults: results.length,
    minScore,
  });

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  // Filter by minimum score
  const qualifiedStocks = results.filter((stock) => stock.score >= minScore);

  // Limit results
  const topStocks = qualifiedStocks.slice(0, maxResults);

  console.log(
    `✓ ${qualifiedStocks.length} stocks qualified (score >= ${minScore})`,
  );
  console.log(`✓ Returning top ${topStocks.length} stocks`);

  logger.info("Filtering complete", {
    qualifiedStocks: qualifiedStocks.length,
    topStocks: topStocks.length,
    minScore,
  });

  // Step 5: Build final result
  const executionTime = ((Date.now() - scanStartTime) / 1000).toFixed(2);

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
      maxResults,
    },
  };

  console.log("\n═══════════════════════════════════════");
  console.log("  Scan Complete!");
  console.log("═══════════════════════════════════════");
  console.log(`⏱  Execution Time: ${executionTime}s`);
  console.log(`✅ Success: ${results.length}/${stockList.length}`);
  console.log(`📈 Qualified: ${qualifiedStocks.length}`);
  console.log(`🎯 Top Stocks: ${topStocks.length}`);
  if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length}`);
  }
  console.log("═══════════════════════════════════════\n");

  // Log scan completion
  logger.info("Scan completed successfully", {
    executionTimeSeconds: parseFloat(executionTime),
    totalScanned: stockList.length,
    successCount: results.length,
    failureCount: errors.length,
    qualifiedCount: qualifiedStocks.length,
    resultCount: topStocks.length,
    topStocks: topStocks
      .slice(0, 5)
      .map((s) => ({ symbol: s.symbol, score: s.score })),
  });

  if (errors.length > 0) {
    logger.warn(`Scan completed with ${errors.length} errors`, {
      errorCount: errors.length,
      failedSymbols: errors.map((e) => e.symbol),
    });
  }

  return scanResult;
}

/**
 * Quick scan with sensible defaults
 *
 * @param {string} universe - Universe name ('NIFTY50', 'NIFTYNEXT50')
 * @returns {Promise<Object>} - Top 10 stocks
 */
async function quickScan(universe = "NIFTY50") {
  return scanStocks(universe, {
    days: 100, // Request 100 calendar days to ensure ~50+ trading days
    minScore: 65,
    maxResults: 10,
  });
}

/**
 * Deep scan with comprehensive analysis
 *
 * @param {string} universe - Universe name
 * @returns {Promise<Object>} - All qualified stocks
 */
async function deepScan(universe = "NIFTY50") {
  return scanStocks(universe, {
    days: 200, // Request 200 calendar days to ensure ~100+ trading days
    minScore: 50,
    maxResults: 50,
    includeIndicators: true,
  });
}

module.exports = {
  scanStocks,
  quickScan,
  deepScan,
};
