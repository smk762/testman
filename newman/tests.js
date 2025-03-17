const newman = require('newman');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const writer = require('./writer');
const collection = require('./collection.json');
const coins = require('./coins');
require('./types');

console.log("=== Newman Tests Starting ===");
console.log("Current directory:", __dirname);
console.log("Files in directory:", require('fs').readdirSync(__dirname));
console.log("Environment variables:", process.env);

/**
 * Configuration for the test runner
 * @type {Object}
 */
const CONFIG = {
    REPORTS_DIR: path.join(__dirname, 'reports'),
    SUCCESS_STATUS_MIN: 200,
    SUCCESS_STATUS_MAX: 300,
    REPORT_FORMATS: ['markdown', 'csv', 'json'],
    CLEANUP_AGE_HOURS: 1
};

/**
 * Test configurations
 * @type {TestConfig[]}
 */
const TEST_CONFIGS = [
    { name: 'TCP', folder: 'Legacy' },
    // Add more test configurations as needed
];

/**
 * Generates a timestamp for test reports
 * @returns {number} Timestamp in seconds
 */
function generateTimestamp() {
    return Math.floor(Date.now() / 1000);
}

/**
 * Generates report file paths for a test run
 * @param {string} name - Test name
 * @param {string} folder - Collection folder
 * @param {number} timestamp - Test timestamp
 * @returns {Object} Object containing paths for different report formats
 */
function generateReportPaths(name, folder, timestamp) {
    const baseFilename = `${name.toLowerCase()}_${folder.toLowerCase()}_${timestamp}`;
    return {
        markdown: path.join(CONFIG.REPORTS_DIR, `${baseFilename}.md`),
        csv: path.join(CONFIG.REPORTS_DIR, `${baseFilename}.csv`),
        json_success: path.join(CONFIG.REPORTS_DIR, `${baseFilename}_success.json`),
        json_fail: path.join(CONFIG.REPORTS_DIR, `${baseFilename}_fail.json`),
        html: path.join(CONFIG.REPORTS_DIR, `${baseFilename}.html`)
    };
}

/**
 * Runs Newman tests and generates reports
 * @param {Object} collection - Postman collection object
 * @param {string} folder - Collection folder to run
 * @param {string} testName - Test name (e.g., 'tcp', 'wasm')
 * @returns {Promise<void>}
 * @throws {Error} If test execution fails
 */
async function runTests(collection, folder, testName) {
    try {
        const name = testName.toLowerCase();
        const timestamp = generateTimestamp();
        const envFile = path.join(__dirname, `env_${name}.json`);
        if (!fs.existsSync(envFile)) {
            logger.error(`Environment file not found: ${envFile}`);
            throw new Error(`Environment file not found: ${envFile}`);
        }
        fs.mkdirSync(CONFIG.REPORTS_DIR, { recursive: true });
        const reportPaths = generateReportPaths(name, folder, timestamp);
        const options = {
            collection: collection,
            folder: folder,
            environment: require(envFile),
            reporters: ["cli", "html"],
            reporter: {
                html: {
                    export: reportPaths.html
                }
            }
        }
        const summary = await new Promise((resolve, reject) => {
            newman.run(options).on('start', function (err, args) {
                logger.info(`Starting ${name} ${folder} Tests...`);
                logger.info('Collection items:', collection.item?.length);
                if (err) reject(err);
            }).on('done', function (err, summary) {
                if (err || summary.error) {
                    reject(err);
                    logger.error('collection run encountered an error.');
                }
                else {
                    logger.info(`${testName} Tests complete!`);
                    logger.info(`[${name}] Total requests executed:`, summary?.run?.stats?.requests?.total);
                    logger.info(`[${name}] Run summary:`, summary?.run?.stats);
                    resolve(summary);
                }
            });
        });
        // summary.run.failures.forEach(failure => {
        //    logger.info(JSON.stringify(failure))
        //})
        
        // Process and save results
        await gatherResults(summary, name, folder, timestamp);
        return summary;
    } catch (err) {
        logger.error(`Error running ${testName} ${folder} tests:`, err);
        throw err;
    }
}

/**
 * Processes test results and generates reports for a specific test name
 * @param {Object} summary - Newman execution summary
 * @param {string} name - Test name (e.g., 'tcp', 'wasm')
 * @param {string} folder - Collection folder that was run
 * @param {number} timestamp - Test timestamp
 * @returns {Promise<void>}
 */
async function gatherResults(summary, name, folder, timestamp) {
    try {
        if (!summary?.run?.executions) {
            throw new Error('Invalid summary object');
        }
        
        const methodResults = new Map();
        const success = {};
        const failed = {};

        // Process each execution
        summary.run.executions.forEach(execution => {
            try {
                const request = execution.request;
                const response = execution.response;
                
                // Skip if request or response is missing
                if (!request || !response) {
                    logger.warn('Missing request or response in execution');
                    return;
                }
                
                // Extract method name and version
                let methodName = '';
                let version = 'v1';
                try {
                    if (!request.body || !request.body.raw) {
                        logger.warn('Request body is empty');
                        return;
                    }
                    
                    const body = JSON.parse(request.body.raw);
                    methodName = body.method || 'unknown_method';
                    if (body.mmrpc === '2.0') {
                        version = 'v2';
                    }
                } catch (e) {
                    methodName = 'INVALID_JSON';
                    logger.error(`Failed to parse request body: ${e}`);
                    logger.error(`request body: ${request.body.raw}`);
                    return;
                }

                // Create result key and initialize if needed
                const key = `${methodName} (${version})`;
                
                // Parse response body safely
                let responseBody;
                try {
                    responseBody = JSON.parse(response.stream.toString());
                } catch (e) {
                    logger.warn(`Failed to parse response body for ${key}:`, e);
                    responseBody = { error: 'Invalid JSON response' };
                }
                
                // Create result object
                const resultObject = {
                    requestBody: JSON.parse(request.body.raw),
                    statusCode: response.code,
                    responseBody: responseBody,
                    responseTime: `${response.responseTime}ms`,
                    responseSize: `${response.size().total} bytes`,
                    timingPhases: response.timingPhases,
                    timestamp: new Date().toISOString()
                };
                
                // Store in map and categorize by success/failure
                methodResults.set(key, resultObject);
                
                if (response.code >= CONFIG.SUCCESS_STATUS_MIN && 
                    response.code < CONFIG.SUCCESS_STATUS_MAX) {
                        if (!success[key]) {
                            success[key] = {
                                details: [],
                                count: 0
                            };
                        }
                        success[key].details.push(resultObject);
                        success[key].count += 1;
                } else {
                    if (!failed[key]) {
                        failed[key] = {
                            details: [],
                            count: 0
                        };
                    }
                    failed[key].details.push(resultObject);
                    failed[key].count += 1;
                }
            } catch (e) {
                logger.error(`Error processing execution for ${name}:`, e);
            }
        });
        
        // Generate report paths
        const reportPaths = generateReportPaths(name, folder, timestamp);
        
        // Write reports in different formats
        try {
            await writer.resultsToJSON(success, reportPaths.json_success);
            await writer.resultsToJSON(failed, reportPaths.json_fail);
            
            logger.info(`Reports generated for ${name}/${folder}:`, {
                json_success: reportPaths.json_success,
                json_fail: reportPaths.json_fail
            });
        } catch (e) {
            logger.error(`Error writing results for ${name}:`, e);
            throw e;
        }
    } catch (e) {
        logger.error(`Error in gatherResults for ${name}:`, e);
        throw e;
    }
}

/**
 * Cleans up old report files
 * @param {number} maxAgeHours - Maximum age of files to keep in hours
 * @returns {number} Number of files deleted
 */
function cleanupOldReports(maxAgeHours = CONFIG.CLEANUP_AGE_HOURS) {
    try {
        const now = Date.now();
        let deletedCount = 0;
        
        if (!fs.existsSync(CONFIG.REPORTS_DIR)) {
            logger.warn(`Reports directory does not exist: ${CONFIG.REPORTS_DIR}`);
            return 0;
        }
        
        const files = fs.readdirSync(CONFIG.REPORTS_DIR);
        const reportExtensions = ['.json', '.csv', '.md', '.html'];
        
        files.filter(file => 
            reportExtensions.some(ext => file.endsWith(ext))
        ).forEach(file => {
            const filePath = path.join(CONFIG.REPORTS_DIR, file);
            const stats = fs.statSync(filePath);
            const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
            
            if (ageHours > maxAgeHours) {
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    logger.debug(`Deleted old report: ${file}`);
                } catch (err) {
                    logger.warn(`Failed to delete old report ${file}:`, err);
                }
            }
        });
        
        logger.info(`Cleaned up ${deletedCount} old report files`);
        return deletedCount;
    } catch (error) {
        logger.error('Error cleaning up old reports:', error);
        return 0;
    }
}

/**
 * Main function to run all configured tests
 * @returns {Promise<void>}
 */
async function main() {
    try {
        logger.info('Starting test suite execution');
        logger.info(`Test configurations: ${TEST_CONFIGS.length}`);
        
        // Clean up old reports
        cleanupOldReports();
        
        // Run each test configuration
        for (const config of TEST_CONFIGS) {
            logger.info(`Running test: ${config.name} - ${config.folder}`);
            await runTests(collection, config.folder, config.name);
        }
        
        logger.info('All tests completed successfully');
    } catch (error) {
        logger.error('Error running tests:', error);
        process.exit(1);
    }
}

console.log("Running tests.js");
logger.info("Running tests.js");
// Run main function if this file is executed directly
if (require.main === module) {
    logger.info("Running Main");
    cleanupOldReports();
    main();
}

module.exports = {
    runTests,
    gatherResults,
    cleanupOldReports,
    CONFIG,
    TEST_CONFIGS
};