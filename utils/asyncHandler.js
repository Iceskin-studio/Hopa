/**
 * utils/asyncHandler.js
 * ---------------------
 * Wraps asynchronous Express route handlers so that rejected promises are
 * forwarded to the error-handling middleware instead of crashing the process.
 */

'use strict';

/**
 * Wraps an async route handler so rejected promises are passed to `next`.
 * @param {Function} fn - Async route handler (req, res, next) => Promise.
 * @returns {import('express').RequestHandler}
 */
function asyncHandler(fn) {
  return function handle(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
