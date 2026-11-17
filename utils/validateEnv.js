/**
 * utils/validateEnv.js
 *
 * Environment validation utility.
 *
 * Ensures that all required environment variables are present and contain
 * non‑empty, non‑whitespace values. Throws an Error listing any missing
 * variables.
 *
 * Usage:
 *   const validateEnv = require('./utils/validateEnv');
 *   validateEnv(['DB_HOST', 'DB_PORT']);
 */

'use strict';

/**
 * Validates required environment variables.
 *
 * @param {string[]} requiredVars - List of environment variable names that must be set.
 * @throws {Error} If any required variable is missing or contains only whitespace.
 */
function validateEnv(requiredVars) {
  if (!Array.isArray(requiredVars)) {
    throw new TypeError('requiredVars must be an array of strings');
  }

  const missing = [];

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    // Treat undefined, null, empty string, or whitespace‑only string as missing
    if (typeof value !== 'string' || value.trim() === '') {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

module.exports = validateEnv;
