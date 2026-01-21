const {
  fetchStockUniverse,
  fetchStockData,
  fetchMarketData,
  getCacheStats
} = require('../src/data');

async function testDataFetcher() {
  console.log('═══════════════════════════════════════');
  console.log('  Data Fetcher Manual Test');
  console.log('═══════════════════════════════════════\n');

  try {
    // Test 1: Fetch stock universe
    console.log('📋 Test 1: Fetching Nifty 50 Universe...');
    const universe = await fetchStockUniverse('NIFTY50');
    console.log(`✓ Found ${universe.length} stocks`);
    console.log(`  Sample: ${universe.slice(0, 5).map(s => s.symbol).join(', ')}\n`);

    // Test 2: Fetch stock data
    console.log('📊 Test 2: Fetching RELIANCE data (50 days)...');
    const relianceData = await fetchStockData('RELIANCE.NS', 50);
    console.log(`✓ Fetched ${relianceData.length} days of data`);
    console.log(`  Latest close: ₹${relianceData[relianceData.length - 1].close}`);
    console.log(`  Latest volume: ${relianceData[relianceData.length - 1].volume.toLocaleString()}\n`);

    // Test 3: Fetch market data
    console.log('📈 Test 3: Fetching Nifty 50 index...');
    const niftyData = await fetchMarketData('NIFTY');
    console.log(`✓ Nifty 50: ${niftyData.price.toFixed(2)}`);
    console.log(`  Change: ${niftyData.changePercent.toFixed(2)}%\n`);

    console.log('💹 Test 4: Fetching India VIX...');
    const vixData = await fetchMarketData('VIX');
    console.log(`✓ India VIX: ${vixData.value.toFixed(2)}\n`);

    // Test 5: Cache stats
    console.log('💾 Test 5: Cache Statistics...');
    const cacheStats = getCacheStats();
    console.log(`  Historical cache: ${cacheStats.historical.keys} keys`);
    console.log(`  Current data cache: ${cacheStats.currentData.keys} keys\n`);

    console.log('═══════════════════════════════════════');
    console.log('✅ All tests completed successfully!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testDataFetcher();