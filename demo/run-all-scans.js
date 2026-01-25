const { scanStocks, quickScan, deepScan } = require("../src/scanner");

/**
 * Enhanced Demo - Showcasing all scanner functions
 *
 * This demo shows three different ways to use the scanner:
 * 1. Custom scan with specific stocks
 * 2. Quick scan (sensible defaults, top 10)
 * 3. Deep scan (comprehensive analysis, top 50)
 */
async function runEnhancedDemo() {
  console.clear();
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║                                                       ║");
  console.log("║     🚀 SWING TRADING STOCK SCANNER - DEMO 🚀          ║");
  console.log("║                                                       ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  const demos = [
    {
      name: "Demo 1: Custom Scan (Specific Stocks)",
      description: "Scan 5 specific stocks with custom parameters",
      fn: runCustomScan,
    },
    {
      name: "Demo 2: Quick Scan",
      description: "Quick scan of NIFTY50 with sensible defaults",
      fn: runQuickScan,
    },
    {
      name: "Demo 3: Deep Scan",
      description: "Comprehensive analysis with more data",
      fn: runDeepScan,
    },
  ];

  // Ask user which demo to run
  console.log("Available demos:\n");
  demos.forEach((demo, index) => {
    console.log(`  ${index + 1}. ${demo.name}`);
    console.log(`     ${demo.description}\n`);
  });

  // For automatic demo, run all three with delays
  console.log("Running all demos automatically...\n");
  console.log("═".repeat(60));

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];
    console.log(`\n\n${"═".repeat(60)}`);
    console.log(`  ${demo.name}`);
    console.log(`${"═".repeat(60)}\n`);

    try {
      await demo.fn();

      if (i < demos.length - 1) {
        console.log("\n\n⏳ Waiting 3 seconds before next demo...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`\n❌ Error in ${demo.name}:`, error.message);
    }
  }

  console.log("\n\n" + "═".repeat(60));
  console.log("  All Demos Complete!");
  console.log("═".repeat(60) + "\n");
}

/**
 * Demo 1: Custom scan with specific stocks and custom parameters
 */
async function runCustomScan() {
  console.log("📋 Scanning 5 top stocks with custom parameters...\n");

  const topStocks = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
  ];

  const result = await scanStocks(topStocks, {
    interval: "1d", // Daily candles
    days: 250, // 250 days for good EMA200 calculation
    minScore: 60, // Stocks scoring 60+ only
    maxResults: 10, // Top 10 results
    includeIndicators: true,
  });

  displayResults(result, "Custom Scan Results");
}

/**
 * Demo 2: Quick scan using quickScan() function
 */
async function runQuickScan() {
  console.log("⚡ Running quick scan on NIFTY50...\n");
  console.log("   Using quickScan() with sensible defaults:");
  console.log("   - 50 days of data");
  console.log("   - minScore: 65");
  console.log("   - maxResults: 10\n");

  const result = await quickScan("NIFTY50");

  displayResults(result, "Quick Scan Results");
}

/**
 * Demo 3: Deep scan using deepScan() function
 */
async function runDeepScan() {
  console.log("🔍 Running deep scan on NIFTY50...\n");
  console.log("   Using deepScan() for comprehensive analysis:");
  console.log("   - 100 days of data (more historical context)");
  console.log("   - minScore: 50 (more permissive)");
  console.log("   - maxResults: 50 (all qualified stocks)\n");

  const result = await deepScan("NIFTY50");

  displayResults(result, "Deep Scan Results");
}

/**
 * Display scan results in a formatted way
 */
function displayResults(result, title) {
  console.log("\n\n╔═══════════════════════════════════════════════════════╗");
  console.log(`║  ${title.padEnd(52)} ║`);
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  console.log(`📅 Scan Time: ${new Date(result.scanTime).toLocaleString()}`);
  console.log(`⏱  Execution: ${result.executionTime}`);

  if (result.marketContext.nifty && result.marketContext.vix) {
    console.log(
      `📊 Market: Nifty ${result.marketContext.nifty.price.toFixed(2)} | VIX ${result.marketContext.vix.value.toFixed(2)}`,
    );
  }

  console.log(
    `\n📈 Stats: ${result.qualifiedStocks}/${result.totalScanned} qualified | Top ${result.stockList.length} shown`,
  );
  console.log("─".repeat(120));

  if (result.stockList.length === 0) {
    console.log("\n⚠️  No stocks qualified with current criteria\n");
    return;
  }

  // Display top 3 stocks in detail
  const topCount = Math.min(3, result.stockList.length);
  console.log(`\n🎯 TOP ${topCount} STOCKS:\n`);

  result.stockList.slice(0, topCount).forEach((stock, index) => {
    console.log(`\n${index + 1}. ${stock.name} (${stock.symbol})`);
    console.log("─".repeat(80));
    console.log(
      `   💯 Score: ${stock.score.toFixed(1)}/100 | 🏷️  ${stock.classification}`,
    );
    console.log(`   💰 Price: ₹${stock.currentPrice.toFixed(2)}`);
    console.log(`   📊 Setup: ${stock.setupType || "None detected"}`);
    console.log(`\n   📉 Score Breakdown:`);
    console.log(`      Trend:  ${stock.scoreBreakdown.trend.toFixed(1)}/17.5`);
    console.log(`      Setup:  ${stock.scoreBreakdown.setup.toFixed(1)}/15.0`);
    console.log(`      RSI:    ${stock.scoreBreakdown.rsi.toFixed(1)}/10.0`);
    console.log(`      MACD:   ${stock.scoreBreakdown.macd.toFixed(1)}/10.0`);
    console.log(`      Volume: ${stock.scoreBreakdown.volume.toFixed(1)}/10.0`);
    console.log(
      `      Regime: ${stock.scoreBreakdown.marketRegime.toFixed(1)}/15.0`,
    );
  });

  // Show summary of remaining stocks if any
  if (result.stockList.length > topCount) {
    console.log(
      `\n\n📊 Other Qualified Stocks (${result.stockList.length - topCount}):\n`,
    );
    result.stockList.slice(topCount).forEach((stock, index) => {
      console.log(
        `   ${topCount + index + 1}. ${stock.symbol.padEnd(20)} Score: ${stock.score.toFixed(1)}/100  (${stock.classification})`,
      );
    });
  }

  console.log("\n" + "═".repeat(120));
}

// Run the enhanced demo
runEnhancedDemo().catch((error) => {
  console.error("\n❌ Demo failed:", error.message);
  console.error(error.stack);
  process.exit(1);
});
