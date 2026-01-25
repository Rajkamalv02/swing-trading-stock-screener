# Data Module Improvements - Implementation Plan

## Overview

Enhance the data module with better configuration management, rate limiting, and error recovery to make it more robust, maintainable, and production-ready.

## User Review Required

> [!IMPORTANT]
> **Configuration File Location**: Stock universes will be moved to `config/stock-universes.json`. This separates data from code and makes it easier to update stock lists without touching source code.

> [!IMPORTANT]
> **Rate Limiting Strategy**: Implementing exponential backoff with configurable limits. Default: 5 requests/second to Yahoo Finance API. This may slow down initial scans but prevents API throttling.

## Proposed Changes

### Configuration Management

#### [NEW] [stock-universes.json](file:///d:/Projects/swing-trading-stock-screener/config/stock-universes.json)

Create a JSON configuration file to store stock universes externally:

- Move NIFTY50 and NIFTYNEXT50 stock lists from code to JSON
- Support for multiple universes with metadata
- Easy to add new universes without code changes
- Validates JSON schema on load

#### [NEW] [config-loader.js](file:///d:/Projects/swing-trading-stock-screener/src/utils/config-loader.js)

Configuration loader utility:

- Loads and validates JSON configuration files
- Caches loaded configurations
- Provides error handling for missing/invalid configs
- Supports environment-specific configs (dev, prod)

---

### Rate Limiting

#### [NEW] [rate-limiter.js](file:///d:/Projects/swing-trading-stock-screener/src/utils/rate-limiter.js)

Rate limiting utility with exponential backoff:

- Token bucket algorithm for rate limiting
- Configurable requests per second
- Exponential backoff on rate limit errors
- Queue management for pending requests
- Integrates with existing logger

#### [MODIFY] [data-fetcher.js](file:///d:/Projects/swing-trading-stock-screener/src/data/data-fetcher.js)

Integrate rate limiter into data fetcher:

- Wrap Yahoo Finance API calls with rate limiter
- Add retry logic with exponential backoff
- Configurable retry attempts (default: 3)
- Better error messages for rate limit failures
- Load stock universes from JSON config instead of hardcoded constants

---

### Enhanced Error Recovery

#### [MODIFY] [data-fetcher.js](file:///d:/Projects/swing-trading-stock-screener/src/data/data-fetcher.js)

Improve error recovery strategies:

- **Circuit Breaker Pattern**: Stop trying after N consecutive failures, resume after cooldown
- **Fallback Data**: Return cached data (even if stale) on API failures
- **Partial Success Handling**: For batch operations, return successful results even if some fail
- **Error Classification**: Distinguish between retryable (network) vs non-retryable (invalid symbol) errors
- **Detailed Error Logging**: Include context (symbol, attempt number, error type)

---

### Configuration File Structure

#### [NEW] [api-config.json](file:///d:/Projects/swing-trading-stock-screener/config/api-config.json)

API configuration:

```json
{
  "rateLimit": {
    "requestsPerSecond": 5,
    "burstSize": 10
  },
  "retry": {
    "maxAttempts": 3,
    "initialDelayMs": 1000,
    "maxDelayMs": 10000,
    "backoffMultiplier": 2
  },
  "circuitBreaker": {
    "failureThreshold": 5,
    "cooldownMs": 60000
  },
  "cache": {
    "historicalTTL": 3600,
    "currentDataTTL": 300
  }
}
```

## Verification Plan

### Automated Tests

1. **Unit Tests for Config Loader**
   - Command: `npm test src/utils/config-loader.test.js`
   - Validates JSON loading and error handling

2. **Unit Tests for Rate Limiter**
   - Command: `npm test src/utils/rate-limiter.test.js`
   - Validates rate limiting logic and backoff

3. **Integration Tests for Data Fetcher**
   - Command: `npm test src/data/data-fetcher.test.js`
   - Tests with mocked API responses
   - Validates retry logic and error recovery

### Manual Verification

1. Run existing demo script to ensure backward compatibility:

   ```bash
   node demo/run-scan.js
   ```

2. Test with intentional API failures (network disconnection) to verify:
   - Circuit breaker activates after threshold
   - Fallback to cached data works
   - Error messages are informative

3. Monitor logs to verify:
   - Rate limiting is working (requests spaced appropriately)
   - Retry attempts are logged correctly
   - Cache hit/miss statistics
