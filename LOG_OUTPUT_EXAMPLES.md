# Example Log Output

This file demonstrates what your logs will look like in action.

---

## File Structure

```
logs/
├── scanner/
│   └── scanner_2026-01-25.log
├── indicators/
│   └── indicators_2026-01-25.log
├── scoring/
│   └── scoring_2026-01-25.log
└── data-fetcher/
    └── data-fetcher_2026-01-25.log
```

---

## Sample Log File: scanner_2026-01-25.log

```json
{"timestamp":"2026-01-25T14:30:00.123Z","level":"INFO","category":"scanner","message":"Scan initiated","stocks":"50 stocks","options":{"days":50,"minScore":65,"maxResults":10},"processId":12345}

{"timestamp":"2026-01-25T14:30:00.234Z","level":"INFO","category":"scanner","message":"Input validation passed","days":50,"minScore":65,"maxResults":10,"includeIndicators":true,"processId":12345}

{"timestamp":"2026-01-25T14:30:00.345Z","level":"INFO","category":"scanner","message":"Fetching universe: NIFTY50","universe":"NIFTY50","processId":12345}

{"timestamp":"2026-01-25T14:30:01.456Z","level":"INFO","category":"scanner","message":"Universe fetched successfully: NIFTY50","universe":"NIFTY50","count":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:01.567Z","level":"INFO","category":"scanner","message":"Market data fetched successfully","niftyPrice":21456.78,"niftyChange":0.45,"vix":16.23,"processId":12345}

{"timestamp":"2026-01-25T14:30:01.678Z","level":"INFO","category":"scanner","message":"Starting analysis of 50 stocks","count":50,"batchSize":5,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.789Z","level":"DEBUG","category":"scanner","message":"Processing stock: RELIANCE.NS","symbol":"RELIANCE.NS","days":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.890Z","level":"DEBUG","category":"scanner","message":"Data fetched for RELIANCE.NS","symbol":"RELIANCE.NS","dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:03.145Z","level":"INFO","category":"scanner","message":"Stock processed successfully: RELIANCE.NS","symbol":"RELIANCE.NS","name":"Reliance Industries Ltd","score":87.5,"classification":"BULLISH","durationMs":356,"processId":12345}

{"timestamp":"2026-01-25T14:30:03.456Z","level":"DEBUG","category":"scanner","message":"Processing stock: TCS.NS","symbol":"TCS.NS","days":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:04.012Z","level":"INFO","category":"scanner","message":"Stock processed successfully: TCS.NS","symbol":"TCS.NS","name":"Tata Consultancy Services Ltd","score":82.3,"classification":"BULLISH","durationMs":556,"processId":12345}

{"timestamp":"2026-01-25T14:30:35.234Z","level":"INFO","category":"scanner","message":"Ranking and filtering results","totalResults":45,"minScore":65,"processId":12345}

{"timestamp":"2026-01-25T14:30:35.345Z","level":"INFO","category":"scanner","message":"Filtering complete","qualifiedStocks":28,"topStocks":10,"minScore":65,"processId":12345}

{"timestamp":"2026-01-25T14:30:35.456Z","level":"INFO","category":"scanner","message":"Scan completed successfully","executionTimeSeconds":35.3,"totalScanned":50,"successCount":45,"failureCount":5,"qualifiedCount":28,"resultCount":10,"topStocks":[{"symbol":"RELIANCE.NS","score":87.5},{"symbol":"INFY.NS","score":85.2},{"symbol":"HDFCBANK.NS","score":83.7},{"symbol":"TCS.NS","score":82.3},{"symbol":"KOTAKBANK.NS","score":81.9}],"processId":12345}

{"timestamp":"2026-01-25T14:30:35.567Z","level":"WARN","category":"scanner","message":"Scan completed with 5 errors","errorCount":5,"failedSymbols":["BHARTIARTL.NS","UPL.NS","GAIL.NS","COALINDIA.NS","ONGC.NS"],"processId":12345}
```

---

## Sample Log File: indicators_2026-01-25.log

```json
{"timestamp":"2026-01-25T14:30:01.123Z","level":"DEBUG","category":"indicators","message":"Indicators module initialized","indicators":["EMA","SMA","RSI","MACD","ATR","ADX","Bollinger Bands"],"processId":12345}

{"timestamp":"2026-01-25T14:30:02.234Z","level":"DEBUG","category":"indicators","message":"Calculating EMA","period":20,"dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.245Z","level":"DEBUG","category":"indicators","message":"EMA calculation completed","period":20,"dataPoints":50,"durationMs":11,"resultSize":31,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.256Z","level":"DEBUG","category":"indicators","message":"Calculating EMA","period":50,"dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.267Z","level":"DEBUG","category":"indicators","message":"EMA calculation completed","period":50,"dataPoints":50,"durationMs":11,"resultSize":1,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.278Z","level":"DEBUG","category":"indicators","message":"Calculating RSI","period":14,"dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.289Z","level":"DEBUG","category":"indicators","message":"RSI calculation completed","period":14,"dataPoints":50,"durationMs":11,"resultSize":36,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.345Z","level":"DEBUG","category":"indicators","message":"Calculating MACD","fastPeriod":12,"slowPeriod":26,"signalPeriod":9,"dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.356Z","level":"DEBUG","category":"indicators","message":"MACD calculation completed","durationMs":11,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.456Z","level":"DEBUG","category":"indicators","message":"Calculating ADX","period":14,"dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.467Z","level":"DEBUG","category":"indicators","message":"ADX calculation completed","durationMs":11,"processId":12345}
```

---

## Sample Log File: scoring_2026-01-25.log

```json
{"timestamp":"2026-01-25T14:30:01.123Z","level":"INFO","category":"scoring","message":"Scoring Engine module initialized","version":"1.0.0","processId":12345}

{"timestamp":"2026-01-25T14:30:02.234Z","level":"DEBUG","category":"scoring","message":"Stock scoring initiated","dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.345Z","level":"DEBUG","category":"scoring","message":"Calculating indicators for scoring","dataPoints":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.678Z","level":"INFO","category":"scoring","message":"Stock scoring completed","symbol":"RELIANCE.NS","score":87.5,"classification":"BULLISH","setupType":"UPTREND","durationMs":444,"processId":12345}

{"timestamp":"2026-01-25T14:30:03.789Z","level":"INFO","category":"scoring","message":"Stock scoring completed","symbol":"TCS.NS","score":82.3,"classification":"BULLISH","setupType":"CONSOLIDATION","durationMs":556,"processId":12345}

{"timestamp":"2026-01-25T14:30:04.890Z","level":"ERROR","category":"scoring","message":"Stock scoring failed: BHARTIARTL.NS","errorMessage":"Insufficient data","errorStack":"Error: Insufficient data...\n  at scoreStock...","errorName":"Error","processId":12345}
```

---

## Sample Log File: data-fetcher_2026-01-25.log

```json
{"timestamp":"2026-01-25T14:30:01.123Z","level":"INFO","category":"data-fetcher","message":"Data Fetcher module initialized","cache":"NodeCache","processId":12345}

{"timestamp":"2026-01-25T14:30:01.234Z","level":"DEBUG","category":"data-fetcher","message":"Fetching stock universe: NIFTY50","processId":12345}

{"timestamp":"2026-01-25T14:30:01.456Z","level":"INFO","category":"data-fetcher","message":"Universe fetched successfully: NIFTY50","universe":"NIFTY50","count":50,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.567Z","level":"DEBUG","category":"data-fetcher","message":"Fetching stock data","symbol":"RELIANCE.NS","days":50,"useCache":true,"processId":12345}

{"timestamp":"2026-01-25T14:30:02.678Z","level":"DEBUG","category":"data-fetcher","message":"Stock data retrieved from cache","symbol":"RELIANCE.NS","days":50,"cacheKey":"RELIANCE.NS_50","processId":12345}

{"timestamp":"2026-01-25T14:30:03.789Z","level":"DEBUG","category":"data-fetcher","message":"Fetching stock data","symbol":"TCS.NS","days":50,"useCache":true,"processId":12345}

{"timestamp":"2026-01-25T14:30:04.890Z","level":"INFO","category":"data-fetcher","message":"Stock data fetched from API","symbol":"TCS.NS","dataPoints":50,"durationMs":1101,"processId":12345}

{"timestamp":"2026-01-25T14:30:05.901Z","level":"ERROR","category":"data-fetcher","message":"Failed to fetch stock data: BHARTIARTL.NS","errorMessage":"API rate limit exceeded","errorStack":"Error: API rate limit...\n  at fetchStockData...","errorName":"Error","processId":12345}
```

---

## Console Output (Color-Coded)

When running the application, you'll see color-coded console output:

```
[14:30:00.123] INFO scanner: Scan initiated
[14:30:00.234] INFO scanner: Input validation passed
[14:30:00.345] INFO scanner: Fetching universe: NIFTY50
[14:30:01.456] INFO scanner: Universe fetched successfully: NIFTY50
[14:30:01.567] INFO scanner: Market data fetched successfully
[14:30:01.678] INFO scanner: Starting analysis of 50 stocks
[14:30:02.789] DEBUG scanner: Processing stock: RELIANCE.NS
[14:30:03.145] INFO scanner: Stock processed successfully: RELIANCE.NS
[14:30:03.456] DEBUG scanner: Processing stock: TCS.NS
[14:30:04.012] INFO scanner: Stock processed successfully: TCS.NS
[14:30:35.234] INFO scanner: Ranking and filtering results
[14:30:35.345] INFO scanner: Filtering complete
[14:30:35.456] INFO scanner: Scan completed successfully
[14:30:35.567] WARN scanner: Scan completed with 5 errors
```

---

## How to Query These Logs

### Using jq (JSON Query)

```bash
# Pretty print all logs
cat logs/scanner/scanner_2026-01-25.log | jq '.'

# Show only ERROR logs
cat logs/scanner/scanner_2026-01-25.log | jq 'select(.level=="ERROR")'

# Show only RELIANCE logs
cat logs/scanner/scanner_2026-01-25.log | jq 'select(.symbol=="RELIANCE.NS")'

# Show messages and times only
cat logs/scanner/scanner_2026-01-25.log | jq '.timestamp, .message'

# Count logs by level
cat logs/scanner/scanner_2026-01-25.log | jq -r '.level' | sort | uniq -c

# Get scan execution time
cat logs/scanner/scanner_2026-01-25.log | jq 'select(.executionTimeSeconds) | .executionTimeSeconds'

# Show top 5 slowest operations
cat logs/scanner/scanner_2026-01-25.log | jq 'select(.durationMs) | .durationMs' | sort -rn | head -5
```

### Using grep

```bash
# Find all errors
grep '"level":"ERROR"' logs/*/*.log

# Find specific symbol
grep 'RELIANCE' logs/scanner/*.log

# Count errors per day
ls logs/*/*.log | xargs grep '"level":"ERROR"' | wc -l

# Find slow operations (>1 second)
grep '"durationMs":' logs/*/*.log | awk -F: '{print $NF}' | awk '$1 > 1000'
```

---

## Log Analysis Commands

### Performance Analysis
```bash
# Find slowest stock processing
cat logs/scanner/scanner_*.log | jq 'select(.durationMs) | .symbol, .durationMs' | sort -rn | head -10

# Average processing time
cat logs/scanner/scanner_*.log | jq 'select(.durationMs) | .durationMs' | jq -s 'add/length'
```

### Error Analysis
```bash
# List all failed stocks
cat logs/scanner/scanner_*.log | jq 'select(.level=="ERROR") | .failedSymbols'

# Error rate calculation
cat logs/scanner/scanner_*.log | jq '.failureCount / .totalScanned * 100'
```

### Data Fetching Analysis
```bash
# Cache hit ratio
cat logs/data-fetcher/data-fetcher_*.log | jq 'select(.message | contains("cache")) | .message' | wc -l

# API calls made
cat logs/data-fetcher/data-fetcher_*.log | jq 'select(.message | contains("API")) | .symbol' | sort | uniq | wc -l
```

---

## Storage Estimate

### Typical Daily Log Size
- **50 stocks per scan**: ~15-20 KB logs/day
- **1 scan per hour**: ~360-480 KB logs/day
- **With debug enabled**: ~5-10 MB logs/day
- **Monthly retention**: ~5-15 GB

### Cleanup Script
```bash
# Remove logs older than 90 days
find logs -name "*.log" -mtime +90 -delete

# Archive old logs
find logs -name "*.log" -mtime +30 -exec gzip {} \;
```

---

## Real-World Debugging Example

### Scenario: Stock RELIANCE not scoring

```bash
# Step 1: Find the stock in logs
grep 'RELIANCE' logs/*/*.log | grep -i error

# Output:
logs/data-fetcher/data-fetcher_2026-01-25.log: {"...error...":"No data returned..."}

# Step 2: Check indicator calculations
grep 'RELIANCE' logs/indicators/*.log | jq '.symbol, .message'

# Step 3: Check scoring
grep 'RELIANCE' logs/scoring/*.log | jq '.symbol, .message, .error'

# Step 4: Check scanner orchestration
grep 'RELIANCE' logs/scanner/*.log | jq '.symbol, .message, .error'

# Result: Found that data fetcher returned empty array
# → Check Yahoo Finance API availability
# → Verify symbol format (RELIANCE.NS vs RELIANCE)
```

---

This comprehensive logging will help you:
✅ Debug issues quickly
✅ Monitor application health
✅ Track performance metrics
✅ Audit all operations
✅ Understand user behavior
