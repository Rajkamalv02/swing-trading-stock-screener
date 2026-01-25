const { quickScan } = require("../src/scanner");

async function testQuickScan() {
  console.log("Testing quickScan function...\n");

  try {
    const result = await quickScan("NIFTY50");
    console.log("\n✅ QuickScan succeeded!");
    console.log(`Found ${result.qualifiedStocks} qualified stocks`);
  } catch (error) {
    console.error("\n❌ QuickScan failed!");
    console.error("Error:", error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
  }
}

testQuickScan();
