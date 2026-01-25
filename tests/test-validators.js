/**
 * Quick validation test to verify validators module
 */

const validators = require("../src/utils/validators");

console.log("🧪 Testing Validators Module\n");
console.log("═".repeat(60));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test basic type validators
console.log("\n📦 Basic Type Validators:\n");

test("isNumber: valid number", () => {
  if (!validators.isNumber(42)) throw new Error("Failed");
});

test("isNumber: reject NaN", () => {
  if (validators.isNumber(NaN)) throw new Error("Failed");
});

test("isNumber: allow NaN with option", () => {
  if (!validators.isNumber(NaN, { allowNaN: true })) throw new Error("Failed");
});

test("isInteger: valid integer", () => {
  if (!validators.isInteger(42)) throw new Error("Failed");
});

test("isInteger: reject float", () => {
  if (validators.isInteger(42.5)) throw new Error("Failed");
});

test("isPositive: positive number", () => {
  if (!validators.isPositive(10)) throw new Error("Failed");
});

test("isPositive: zero allowed by default", () => {
  if (!validators.isPositive(0)) throw new Error("Failed");
});

test("isPositive: zero rejected in strict mode", () => {
  if (validators.isPositive(0, true)) throw new Error("Failed");
});

test("isInRange: value in range", () => {
  if (!validators.isInRange(50, 0, 100)) throw new Error("Failed");
});

test("isInRange: value out of range", () => {
  if (validators.isInRange(150, 0, 100)) throw new Error("Failed");
});

test("isString: valid string", () => {
  if (!validators.isString("hello")) throw new Error("Failed");
});

test("isArray: valid array", () => {
  if (!validators.isArray([1, 2, 3])) throw new Error("Failed");
});

test("isObject: valid object", () => {
  if (!validators.isObject({ a: 1 })) throw new Error("Failed");
});

test("isObject: reject array", () => {
  if (validators.isObject([1, 2, 3])) throw new Error("Failed");
});

// Test stock data validators
console.log("\n📈 Stock Data Validators:\n");

test("validateSymbol: valid symbol", () => {
  validators.validateSymbol("RELIANCE.NS");
});

test("validateSymbol: reject invalid format", () => {
  try {
    validators.validateSymbol("invalid");
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

test("validateOHLCV: valid candle", () => {
  validators.validateOHLCV({
    high: 110,
    low: 100,
    close: 105,
    volume: 1000000,
  });
});

test("validateOHLCV: reject invalid candle (high < low)", () => {
  try {
    validators.validateOHLCV({
      high: 100,
      low: 110,
      close: 105,
      volume: 1000000,
    });
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

test("validateOHLCVArray: valid array", () => {
  validators.validateOHLCVArray([
    { high: 110, low: 100, close: 105, volume: 1000000 },
    { high: 115, low: 105, close: 112, volume: 1200000 },
  ]);
});

test("validatePriceData: valid prices", () => {
  validators.validatePriceData([100, 102, 101, 103, 105]);
});

test("validatePriceData: reject non-numeric", () => {
  try {
    validators.validatePriceData([100, "invalid", 103]);
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

test("validateInterval: valid interval", () => {
  validators.validateInterval("1d");
});

test("validateInterval: reject invalid interval", () => {
  try {
    validators.validateInterval("5y");
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

// Test configuration validators
console.log("\n⚙️  Configuration Validators:\n");

test("validateUniverseName: valid name", () => {
  validators.validateUniverseName("NIFTY50");
});

test("validateScanOptions: valid options", () => {
  validators.validateScanOptions({
    interval: "1d",
    days: 50,
    minScore: 65,
    maxResults: 10,
  });
});

test("validateScanOptions: reject invalid minScore", () => {
  try {
    validators.validateScanOptions({ minScore: 150 });
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

// Test indicator validators
console.log("\n📊 Indicator Parameter Validators:\n");

test("validatePeriod: valid period", () => {
  validators.validatePeriod(14);
});

test("validatePeriod: reject negative", () => {
  try {
    validators.validatePeriod(-5);
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

test("validateEMAPeriod: valid EMA period", () => {
  validators.validateEMAPeriod(20);
});

test("validateRSIPeriod: valid RSI period", () => {
  validators.validateRSIPeriod(14);
});

test("validateMACDParams: valid MACD params", () => {
  validators.validateMACDParams(12, 26, 9);
});

test("validateMACDParams: reject fast >= slow", () => {
  try {
    validators.validateMACDParams(26, 12, 9);
    throw new Error("Should have thrown");
  } catch (error) {
    if (!(error instanceof validators.ValidationError)) throw error;
  }
});

// Summary
console.log("\n" + "═".repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(
  `   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`,
);

if (failed === 0) {
  console.log("✅ All tests passed!");
  process.exit(0);
} else {
  console.log("❌ Some tests failed");
  process.exit(1);
}
