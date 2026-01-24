# Logging System Documentation

## Overview

A comprehensive, production-grade logging system with:
- ✅ **Multiple log levels** (DEBUG, INFO, WARN, ERROR)
- ✅ **File rotation** based on date (format: `category_YYYY-MM-DD.log`)
- ✅ **Categorized logs** by module (scanner, indicators, scoring, data-fetcher)
- ✅ **Timestamped entries** (ISO 8601 format with milliseconds)
- ✅ **Separate logs folder** (`logs/`) with organized directory structure
- ✅ **Color-coded console output** for quick visual scanning
- ✅ **JSON-structured logs** for easy parsing and analysis
- ✅ **Performance tracking** with duration metrics

---

## Directory Structure

```
project-root/
├── logs/                          # All logs stored here
│   ├── scanner/
│   │   ├── scanner_2026-01-24.log
│   │   ├── scanner_2026-01-25.log
│   │   └── scanner_2026-01-26.log
│   ├── indicators/
│   │   ├── indicators_2026-01-24.log
│   │   └── ...
│   ├── scoring/
│   │   └── ...
│   ├── data-fetcher/
│   │   └── ...
│   ├── utils/
│   │   └── ...
│   └── error/
│       └── ...
└── ...
```

**Key Features:**
- Date-based organization: `logs/[category]/[category]_YYYY-MM-DD.log`
- Automatically creates directories on first use
- Excluded from git via `.gitignore`
- Easy to archive/cleanup old logs

---

## Usage Examples

### Basic Setup

```javascript
const { getLogger, LOG_CATEGORIES } = require('./utils');

// Create a logger for your module
const logger = getLogger(LOG_CATEGORIES.SCANNER);
```

### Log Levels

#### 1. **DEBUG** - Detailed diagnostic information
```javascript
logger.debug('Processing stock', { symbol: 'RELIANCE.NS', days: 50 });
```
**Log output:**
```json
{
  "timestamp": "2026-01-24T14:30:45.123Z",
  "level": "DEBUG",
  "category": "scanner",
  "message": "Processing stock",
  "symbol": "RELIANCE.NS",
  "days": 50,
  "processId": 12345
}
```

#### 2. **INFO** - General information messages
```javascript
logger.info('Stock processed successfully', {
  symbol: 'RELIANCE.NS',
  score: 87.5,
  classification: 'BULLISH'
});
```

#### 3. **WARN** - Warning messages (potential issues)
```javascript
logger.warn('Failed to fetch market data', error);
```

#### 4. **ERROR** - Error messages (something failed)
```javascript
logger.error('Failed to process stock', error);
```

---

## Log Categories

Available categories for organized logging:

```javascript
const LOG_CATEGORIES = {
  // Core modules
  SCANNER: 'scanner',
  INDICATORS: 'indicators',
  SCORING: 'scoring',
  DATA_FETCHER: 'data-fetcher',
  
  // Utilities
  UTILS: 'utils',
  VALIDATORS: 'validators',
  LOGGER: 'logger',
  
  // API
  API: 'api',
  EXTERNAL_API: 'external-api',
  
  // Monitoring
  PERFORMANCE: 'performance',
  METRICS: 'metrics',
  
  // Errors
  ERROR: 'error',
  DEBUG: 'debug'
};
```

### Creating Module Loggers

```javascript
// In src/scanner/main-scanner.js
const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.SCANNER);

// In src/indicators/ema.js
const logger = getLogger(LOG_CATEGORIES.INDICATORS);

// In src/data/data-fetcher.js
const logger = getLogger(LOG_CATEGORIES.DATA_FETCHER);
```

---

## Advanced Features

### 1. Error Logging with Stack Traces

```javascript
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', error);
  // Automatically logs:
  // - error.message
  // - error.stack
  // - error.name
}
```

### 2. Performance Tracking

```javascript
// Method 1: Manual timing
const startTime = Date.now();
const result = await heavyOperation();
const duration = Date.now() - startTime;

logger.info('Heavy operation completed', {
  durationMs: duration,
  result: result.summary
});

// Method 2: Using enter/exit for detailed tracing
const traceId = logger.enter('calculateIndicators', { symbol: 'RELIANCE', period: 14 });
try {
  const result = await calculateIndicators(...);
  logger.exit('calculateIndicators', result, traceId, Date.now() - startTime);
} catch (error) {
  logger.error('Calculation failed', error);
}
```

### 3. Custom Metadata

```javascript
logger.info('Scan progress', {
  processed: 25,
  total: 50,
  percentage: 50,
  batchNumber: 5,
  estimatedTime: '10s',
  customField: 'any value'
});
```

### 4. Metrics Logging

```javascript
logger.metric('Stock Analysis', duration, {
  stocksProcessed: 50,
  successRate: 98,
  averageScore: 72.5
});
```

---

## Best Practices

### 1. **Use Appropriate Log Levels**
```javascript
// ✅ GOOD - Debug for detailed tracing
logger.debug('Fetching data for symbol', { symbol });

// ✅ GOOD - Info for important business events
logger.info('Scan completed', { count, duration });

// ✅ GOOD - Warn for potential issues
logger.warn('Slow response time', { duration: 5000 });

// ✅ GOOD - Error for failures
logger.error('API call failed', error);

// ❌ BAD - Using info for everything
logger.info('About to call API');
logger.info('Processing symbol X');
logger.info('Finished symbol X');
```

### 2. **Include Useful Context**
```javascript
// ❌ BAD - No context
logger.info('Stock processed');

// ✅ GOOD - Contextual information
logger.info('Stock processed successfully', {
  symbol: 'RELIANCE.NS',
  score: 87.5,
  durationMs: 250,
  classification: 'BULLISH'
});
```

### 3. **Use Consistent Naming**
```javascript
// ✅ GOOD - Clear, predictable message format
logger.info('Stock processed successfully', {...});
logger.warn('Stock processing slow', {...});
logger.error('Stock processing failed', {...});

// ❌ BAD - Inconsistent naming
logger.info('Done processing');
logger.warn('Slow!');
logger.error('Oops!');
```

### 4. **Performance: Don't Over-Log**
```javascript
// ❌ BAD - Logging in tight loop (excessive I/O)
for (const stock of stocks) {
  logger.debug(`Processing ${stock}`);
  // ... process
  logger.debug(`Finished ${stock}`);
}

// ✅ GOOD - Batch progress updates
const batchSize = 10;
for (let i = 0; i < stocks.length; i++) {
  if (i % batchSize === 0) {
    logger.debug(`Progress: ${i}/${stocks.length}`);
  }
  // ... process
}
```

### 5. **Error Handling**
```javascript
// ✅ GOOD - Full error context
try {
  await fetchData();
} catch (error) {
  logger.error('Failed to fetch data', error);
  // Logs: message, stack trace, error name
  throw error; // Re-throw if needed
}

// ❌ BAD - Losing error context
catch (error) {
  logger.error('Something went wrong');
  // Stack trace is lost
}
```

### 6. **Sensitive Data**
```javascript
// ❌ BAD - Logging passwords/tokens
logger.info('API call', { apiKey: 'secret123', password: 'pass' });

// ✅ GOOD - Mask sensitive data
logger.info('API call', {
  apiEndpoint: 'https://api.example.com',
  apiKey: '***' // masked
});
```

---

## Configuration

### Log Level Configuration

Control log level via environment variable:

```bash
# Show all logs
LOG_LEVEL=DEBUG npm start

# Show only important logs (default)
LOG_LEVEL=INFO npm start

# Show only warnings and errors
LOG_LEVEL=WARN npm start

# Show only errors
LOG_LEVEL=ERROR npm start
```

**Default:** `INFO`

---

## Log Analysis & Monitoring

### Reading Log Files

Logs are stored as JSON lines (one JSON object per line):

```bash
# View today's scanner logs
cat logs/scanner/scanner_2026-01-24.log | jq .

# Find all errors in last 24 hours
grep '"level":"ERROR"' logs/*/*.log | head -20

# Count logs by level
grep '"level":"INFO"' logs/*/*.log | wc -l

# Find logs for specific symbol
grep 'RELIANCE' logs/scanner/*.log

# Pretty print logs
cat logs/scanner/scanner_2026-01-24.log | jq '.'

# Filter logs by timestamp
grep '2026-01-24T14:' logs/scanner/*.log | jq '.message'
```

### Using with Log Analysis Tools

Logs are JSON-formatted for easy integration with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch**
- **Graylog**

---

## Integration Examples

### Example 1: Scanner Module

```javascript
const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.SCANNER);

async function scanStocks(stocks, options) {
  logger.info('Scan initiated', { stocks, options });
  
  try {
    const results = [];
    for (const stock of stocks) {
      logger.debug(`Processing: ${stock}`);
      const result = await processStock(stock);
      results.push(result);
      logger.debug(`Completed: ${stock}`, { score: result.score });
    }
    
    logger.info('Scan completed', {
      total: stocks.length,
      successful: results.length
    });
    
    return results;
  } catch (error) {
    logger.error('Scan failed', error);
    throw error;
  }
}
```

### Example 2: Data Fetcher Module

```javascript
const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.DATA_FETCHER);

async function fetchStockData(symbol, days) {
  const startTime = Date.now();
  logger.debug(`Fetching data`, { symbol, days });
  
  try {
    const data = await externalAPI.getHistoricalData(symbol, days);
    
    const duration = Date.now() - startTime;
    logger.info(`Data fetched`, {
      symbol,
      dataPoints: data.length,
      durationMs: duration
    });
    
    return data;
  } catch (error) {
    logger.error(`Failed to fetch data for ${symbol}`, error);
    throw error;
  }
}
```

### Example 3: Indicator Calculation

```javascript
const { getLogger, LOG_CATEGORIES } = require('../utils');
const logger = getLogger(LOG_CATEGORIES.INDICATORS);

function calculateEMA(prices, period) {
  const startTime = Date.now();
  logger.debug(`Calculating EMA`, { period, dataPoints: prices.length });
  
  try {
    const ema = [];
    // ... calculation logic ...
    
    const duration = Date.now() - startTime;
    logger.debug(`EMA calculated`, {
      period,
      durationMs: duration,
      resultSize: ema.length
    });
    
    return ema;
  } catch (error) {
    logger.error(`EMA calculation failed`, error);
    throw error;
  }
}
```

---

## Performance Impact

- **Minimal overhead**: ~1-2ms per log call
- **Asynchronous writes**: File I/O doesn't block execution
- **Batch operations**: Multiple logs batched for efficiency
- **Efficient filtering**: Log level checks before processing

**Recommendation:** Use `INFO` level in production for optimal balance between detail and performance.

---

## Troubleshooting

### Q: Logs directory not created?
**A:** Call `ensureLogDirectory()` or run the app once. It auto-creates on first use.

### Q: Logs too verbose?
**A:** Set `LOG_LEVEL=WARN` environment variable.

### Q: How to rotate old logs?
**A:** Script to archive logs older than 30 days:
```bash
find logs -name "*.log" -mtime +30 -exec gzip {} \;
```

### Q: How to monitor live logs?
**A:** Use `tail`:
```bash
tail -f logs/scanner/scanner_*.log | grep '"level":"ERROR"'
```

---

## File Structure Reference

```
src/
├── utils/
│   ├── logger.js              # Core logging system
│   ├── log-categories.js      # Category definitions
│   ├── index.js               # Utils exports
│   └── validators.js
├── scanner/
│   └── main-scanner.js        # Example: integrated logging
├── indicators/
│   ├── ema.js                 # Example: add logging here
│   ├── rsi.js
│   └── ...
├── scoring/
│   └── scoring-engine.js      # Example: add logging here
└── data/
    └── data-fetcher.js        # Example: add logging here

logs/                           # Auto-created
├── scanner/
│   └── scanner_2026-01-24.log
├── indicators/
│   └── indicators_2026-01-24.log
├── scoring/
│   └── scoring_2026-01-24.log
└── data-fetcher/
    └── data-fetcher_2026-01-24.log
```

---

## Summary

This logging system provides:
1. **Clarity**: Know exactly what's happening in your code
2. **Debugging**: Track down issues with detailed context
3. **Monitoring**: Understand performance and failures
4. **Compliance**: Audit trail for all operations
5. **Maintenance**: Easy to search and analyze logs

Happy logging! 📝
