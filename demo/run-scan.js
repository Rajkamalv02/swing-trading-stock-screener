const { scanStocks, quickScan } = require('../src/scanner');

/**
 * Interactive Demo - Run a live stock scan
 */
async function runDemo() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                                                       ║');
  console.log('║     🚀 SWING TRADING STOCK SCANNER - LIVE DEMO 🚀     ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  try {
    // Option 1: Quick scan of specific stocks
    console.log('Option 1: Quick scan of top stocks...\n');
    
    const topStocks = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];
    
    const result = await scanStocks(topStocks, {
      days: 50,
      minScore: 60,
      maxResults: 10
    });

    // Display results
    console.log('\n\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                    SCAN RESULTS                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log(`📅 Scan Time: ${new Date(result.scanTime).toLocaleString()}`);
    console.log(`⏱  Execution: ${result.executionTime}`);
    console.log(`📊 Market: Nifty ${result.marketContext.nifty?.price.toFixed(2) || 'N/A'} | VIX ${result.marketContext.vix?.value.toFixed(2) || 'N/A'}`);
    console.log(`\n📈 Qualified Stocks: ${result.qualifiedStocks}/${result.totalScanned}`);
    console.log('─'.repeat(120));

    if (result.stockList.length === 0) {
      console.log('\n⚠️  No stocks qualified with current criteria\n');
      return;
    }

    // Display top stocks
    console.log('\n🎯 TOP STOCKS:\n');
    
    result.stockList.forEach((stock, index) => {
      console.log(`\n${index + 1}. ${stock.name} (${stock.symbol})`);
      console.log('─'.repeat(80));
      console.log(`   💯 Score: ${stock.score.toFixed(1)}/100 | 🏷️  ${stock.classification}`);
      console.log(`   💰 Price: ₹${stock.currentPrice.toFixed(2)}`);
      console.log(`   📊 Setup: ${stock.setupType || 'None detected'}`);
      console.log(`\n   📉 Score Breakdown:`);
      console.log(`      Trend:  ${stock.scoreBreakdown.trend.toFixed(1)}/17.5`);
      console.log(`      Setup:  ${stock.scoreBreakdown.setup.toFixed(1)}/15.0`);
      console.log(`      RSI:    ${stock.scoreBreakdown.rsi.toFixed(1)}/10.0`);
      console.log(`      MACD:   ${stock.scoreBreakdown.macd.toFixed(1)}/10.0`);
      console.log(`      Volume: ${stock.scoreBreakdown.volume.toFixed(1)}/10.0`);
      console.log(`      Regime: ${stock.scoreBreakdown.marketRegime.toFixed(1)}/15.0`);
      
      if (stock.indicators) {
        console.log(`\n   📊 Technical Indicators:`);
        console.log(`      RSI(14):  ${stock.indicators.rsi14.toFixed(1)}`);
        console.log(`      MACD:     ${stock.indicators.macd.macdLine.toFixed(2)} (${stock.indicators.macd.histogram.toFixed(2)})`);
        console.log(`      ADX:      ${stock.indicators.adx.toFixed(1)}`);
        console.log(`      BB %B:    ${(stock.indicators.bollingerBands.percentB * 100).toFixed(1)}%`);
      }
      
      console.log(`\n   💡 Analysis:`);
      const reasoningLines = stock.reasoning.split('\n');
      reasoningLines.forEach(line => {
        if (line.trim()) console.log(`      ${line}`);
      });
    });

    console.log('\n' + '═'.repeat(120));
    console.log('\n✅ Scan completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error during scan:', error.message);
    console.error(error.stack);
  }
}

// Run the demo
runDemo();