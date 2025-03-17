
/**
 * @typedef {Object} MethodResult
 * @property {string} requestBody - Raw request body
 * @property {number} statusCode - HTTP status code
 * @property {string} responseBody - Raw response body
 * @property {string} responseTime - Response time with units
 * @property {Object} timingPhases - Detailed timing information
 */


/**
 * @typedef {Object} TestResults
 * @property {MethodResult[]} success - Successful test results
 * @property {MethodResult[]} fail - Failed test results
 */


/**
 * @typedef {Object} TestConfig
 * @property {string} name - Test configuration name
 * @property {string} envFile - Path to environment file
 * @property {string} reportFile - Path to report output file
 * @property {string} folder - Collection folder to run
 */

// Export the types for JSDoc reference
module.exports = {};