/**
 * Writer module for Newman test results
 * @module writer
 */

const csv = require('csv-stringify');
const fs = require('fs');
const logger = require('./logger');

const CONFIG = {
    MAX_JSON_LENGTH: 100,
};

/**
 * Writes test results to a markdown file
 * @param {Map<string, Object>} methodResults - Map of method names to their results
 * @param {string} outputPath - Path where the markdown file will be written
 * @returns {Promise<void>}
 */
async function resultsToMarkdown(methodResults, outputPath) {
    try {
        let markdownTable = '| Method | Request Body | Response Body | Response Time |\n';
        markdownTable += '|---------|--------------|---------------|---------------|\n';

        methodResults.forEach((result, method) => {
            const requestBody = formatJSON(result.requestBody).replace(/\|/g, '\\|');
            const responseBody = formatJSON(result.responseBody).replace(/\|/g, '\\|');
            markdownTable += `| ${method} | \`${requestBody}\` | \`${responseBody}\` | ${result.responseTime} |\n`;
        });

        fs.writeFileSync(outputPath, markdownTable);
        logger.info(`Markdown report written to ${outputPath}`);
    } catch (error) {
        logger.error(`Failed to write markdown report: ${error.message}`);
        throw error;
    }
}

/**
 * Writes test results to a CSV file
 * @param {Map<string, Object>} methodResults - Map of method names to their results
 * @param {string} outputPath - Path where the CSV file will be written
 * @returns {Promise<void>}
 */
async function resultsToCSV(methodResults, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const columns = [
                { key: 'method', header: 'Method' },
                { key: 'requestBody', header: 'Request Body' },
                { key: 'statusCode', header: 'Status Code' },
                { key: 'responseBody', header: 'Response Body' },
                { key: 'responseTime', header: 'Response Time' },
                { key: 'responseSize', header: 'Response Size' },
                { key: 'timingDetails', header: 'Timing Details' }
            ];

            const records = Array.from(methodResults.entries()).map(([method, result]) => ({
                method,
                ...result,
                // Format timing details as single string
                timingDetails: `DNS:${result.timingPhases?.dns || 0}ms; TCP:${result.timingPhases?.tcp || 0}ms; FirstByte:${result.timingPhases?.firstByte || 0}ms;`,
                // Clean up potential CSV-breaking characters in JSON
                requestBody: formatJSON(result.requestBody).replace(/"/g, '""'),
                responseBody: formatJSON(result.responseBody).replace(/"/g, '""')
            }));

            // Create CSV string
            csv.stringify(records, { 
                header: true,
                columns: columns,
                quoted: true  // Quote all fields to handle special characters
            }, (err, output) => {
                if (err) {
                    logger.error('Error creating CSV:', err);
                    reject(err);
                    return;
                }
                fs.writeFileSync(outputPath, output);
                logger.info(`CSV report written to ${outputPath}`);
                resolve();
            });
        } catch (error) {
            logger.error(`Failed to write CSV report: ${error.message}`);
            reject(error);
        }
    });
}

/**
 * Formats JSON data with length limitation and pretty printing
 * @param {Object|string} data - Data to format
 * @param {number} [maxLength=100] - Maximum length of the formatted string
 * @returns {string} Formatted JSON string
 */
function formatJSON(data, maxLength = CONFIG.MAX_JSON_LENGTH) {
    try {
        if (data === null || data === undefined) {
            return '';
        }
        // If data is already a string, try to parse it
        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        const formatted = JSON.stringify(obj, null, 2);
        if (formatted.length > maxLength) {
            return formatted.substring(0, maxLength) + '...';
        }
        return formatted;
    } catch (e) {
        // If parsing fails, return the original string truncated
        const str = String(data);
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
}

/**
 * Writes test results to a JSON file, grouped by method and success/failure
 * @param {Object} results - Object containing test results grouped by method
 * @param {string} outputPath - Path where the JSON file will be written
 * @returns {Promise<void>}
 * @throws {Error} If JSON creation fails
 */
async function resultsToJSON(results, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Check if results is defined
            if (!results) {
                throw new Error('results is required');
            }
            
            // Write to file with pretty printing
            fs.writeFileSync(
                outputPath,
                JSON.stringify(results, null, 4)
            );
            logger.info(`JSON report written to ${outputPath}`);
            resolve();
        } catch (error) {
            logger.error(`Failed to write JSON report: ${error.message}`);
            reject(error);
        }
    });
}

module.exports = {
    resultsToMarkdown,
    resultsToCSV,
    resultsToJSON
};