/**
 * utils/requestId.js
 * ------------------
 * Generates and attaches a unique request identifier.
 * Useful for correlating logs across the request lifecycle.
 */

'use strict';
const { randomUUID } = require('crypto');

/**
 * Middleware that ensures each incoming request has a `req.id`.
 * If a client supplies an `X-Request-Id` header, it is respected;
 * otherwise a new UUID v4 is generated.
 *
 * @returns {function} Express middleware
 */
function requestIdMiddleware() {
  return (req, res, next) => {
    const incoming = req.headers['x-request-id'];
    req.id = typeof incoming === 'string' && incoming.trim() !== '' ? incoming.trim() : randomUUID();
    // Expose the same header in the response for downstream tracing
    res.setHeader('X-Request-Id', req.id);
    next();
  };
}

/**
 * Helper to retrieve the current request id from a logger child.
 *
 * @param {Object} logger - Winston logger instance (or child)
 * @param {string} requestId - The request identifier
 * @returns {Object} Child logger with requestId meta
 */
function childWithRequestId(logger, requestId) {
  return logger.child({ requestId });
}

module.exports = {
  requestIdMiddleware,
  childWithRequestId,
};
