const { scoreStock } = require('./src/scoring');

// Sample test data with at least 50 days of data
const testData = [];
for (let i = 0; i < 60; i++) {
  const basePrice = 2500 + (i * 2);
  testData.push({
    high: basePrice + 5,
    low: basePrice - 5,
    close: basePrice,
    volume: 1000000 + (Math.random() * 500000)
  });
}

console.log('Testing scoreStock with', testData.length, 'data points...');

try {
  const result = scoreStock(testData);
  console.log('\n✅ Scoring succeeded!');
  console.log('Total Score:', result.totalScore);
  console.log('Classification:', result.classification);
  console.log('Setup Type:', result.setupType);
} catch (error) {
  console.error('\n❌ Scoring failed:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  if (error.details) {
    console.error('Details:', error.details);
  }
}
