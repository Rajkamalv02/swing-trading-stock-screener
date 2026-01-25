/**
 * Configuration Loader Module
 *
 * Loads and manages JSON configuration files with validation and caching
 */

const fs = require("fs");
const path = require("path");
const { getLogger } = require("./logger");
const LOG_CATEGORIES = require("./log-categories");
const logger = getLogger(LOG_CATEGORIES.UTILS);

// Configuration cache
const configCache = new Map();

/**
 * Load JSON configuration file
 *
 * @param {string} configPath - Relative path to config file from project root
 * @param {boolean} useCache - Whether to use cached config (default: true)
 * @returns {Object} - Parsed configuration object
 * @throws {Error} - If file not found or invalid JSON
 */
function loadConfig(configPath, useCache = true) {
  // Check cache first
  if (useCache && configCache.has(configPath)) {
    logger.debug("Config retrieved from cache", { configPath });
    return configCache.get(configPath);
  }

  try {
    // Resolve path relative to project root
    const absolutePath = path.resolve(__dirname, "../../", configPath);

    logger.debug("Loading configuration file", { configPath, absolutePath });

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    // Read and parse JSON
    const fileContent = fs.readFileSync(absolutePath, "utf8");
    const config = JSON.parse(fileContent);

    // Cache the config
    configCache.set(configPath, config);

    logger.info("Configuration loaded successfully", {
      configPath,
      keys: Object.keys(config).length,
    });

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const parseError = new Error(
        `Invalid JSON in config file: ${configPath}`,
      );
      logger.error("Config file parse error", parseError);
      throw parseError;
    }

    logger.error("Error loading configuration", error);
    throw error;
  }
}

/**
 * Load stock universes configuration
 *
 * @returns {Object} - Stock universes configuration
 */
function loadStockUniverses() {
  return loadConfig("config/stock-universes.json");
}

/**
 * Load API configuration
 *
 * @returns {Object} - API configuration
 */
function loadApiConfig() {
  return loadConfig("config/api-config.json");
}

/**
 * Get specific universe by name
 *
 * @param {string} universeName - Name of universe (e.g., 'NIFTY50')
 * @returns {Array} - Array of stock objects
 * @throws {Error} - If universe not found
 */
function getUniverse(universeName) {
  const config = loadStockUniverses();

  if (!config.universes || !config.universes[universeName]) {
    throw new Error(`Universe not found: ${universeName}`);
  }

  const universe = config.universes[universeName];
  logger.debug("Universe retrieved", {
    universeName,
    stockCount: universe.stocks.length,
    description: universe.description,
  });

  return universe.stocks;
}

/**
 * Get list of available universe names
 *
 * @returns {Array} - Array of universe names
 */
function getAvailableUniverses() {
  const config = loadStockUniverses();
  return Object.keys(config.universes || {});
}

/**
 * Clear configuration cache
 */
function clearConfigCache() {
  const size = configCache.size;
  configCache.clear();
  logger.info("Configuration cache cleared", { cachedItems: size });
}

/**
 * Reload configuration (clears cache and loads fresh)
 *
 * @param {string} configPath - Path to config file
 * @returns {Object} - Reloaded configuration
 */
function reloadConfig(configPath) {
  configCache.delete(configPath);
  return loadConfig(configPath, false);
}

module.exports = {
  loadConfig,
  loadStockUniverses,
  loadApiConfig,
  getUniverse,
  getAvailableUniverses,
  clearConfigCache,
  reloadConfig,
};
