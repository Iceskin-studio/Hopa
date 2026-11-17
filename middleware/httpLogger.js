/**
 * middleware/httpLogger.js
 * ------------------------
 * Logs each HTTP request/response pair using the central logger.
 * Includes method, URL, status code, response time, and request ID.
 */

'use strict';
const { logger } = require('../utils/logger');
const { childWithRequestId } = require('../utils/requestId');

/**
 * Express middleware that logs request start and completion.
 *
 * @returns {function} Middleware function
 */
function httpLogger() {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const requestLogger = childWithRequestId(logger, req.id);
    requestLogger.info('Incoming request', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });

    // When response finishes, log outcome
    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - start;
      const durationMs = Number(durationNs) / 1e6;
      requestLogger.info('Request completed', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: durationMs.toFixed(3),
      });
    });

    next();
  };
}

module.exports = httpLogger;
