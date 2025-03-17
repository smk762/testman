/**
 * Logger module for Newman tests
 * @module logger
 */

/**
 * Log levels enum
 * @enum {number}
 */
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

/**
 * Current log level
 * @type {number}
 */
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Log output destination
 * @type {string|null}
 */
let logFile = null;

/**
 * Sets the current log level
 * @param {number} level - Log level from LOG_LEVELS enum
 */
function setLogLevel(level) {
    if (Object.values(LOG_LEVELS).includes(level)) {
        currentLogLevel = level;
    } else {
        console.error(`Invalid log level: ${level}`);
    }
}

/**
 * Sets a log file for output
 * @param {string} filePath - Path to log file
 */
function setLogFile(filePath) {
    logFile = filePath;
    // Create or clear the log file
    const fs = require('fs');
    fs.writeFileSync(filePath, '');
}

/**
 * Formats a timestamp
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('iso' or 'simple')
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date, format = 'iso') {
    if (format === 'simple') {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    return date.toISOString();
}

/**
 * Writes a log message to file if configured
 * @param {string} message - Message to log
 */
function writeToFile(message) {
    if (logFile) {
        const fs = require('fs');
        fs.appendFileSync(logFile, message + '\n');
    }
}

/**
 * Logs a message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
function logWithLevel(level, message, ...args) {
    const timestamp = formatTimestamp(new Date());
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    
    // Convert args to strings for file logging
    const argsStr = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    writeToFile(`${logMessage} ${argsStr}`);
    
    return `${logMessage}`;
}

/**
 * Logs an error message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
function error(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
        const logMessage = logWithLevel('ERROR', message, ...args);
        console.error(logMessage, ...args);
    }
}

/**
 * Logs a warning message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
function warn(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
        const logMessage = logWithLevel('WARN', message, ...args);
        console.warn(logMessage, ...args);
    }
}

/**
 * Logs an info message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
function info(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
        const logMessage = logWithLevel('INFO', message, ...args);
        console.info(logMessage, ...args);
    }
}

/**
 * Logs a debug message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
function debug(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        const logMessage = logWithLevel('DEBUG', message, ...args);
        console.debug(logMessage, ...args);
    }
}

module.exports = {
    LOG_LEVELS,
    setLogLevel,
    setLogFile,
    error,
    warn,
    info,
    debug
};