/**
 * utils/requestLogger.js
 * ----------------------
 * Request‑level logger that enriches each log entry with a unique requestId,
 * HTTP method, URL, status code and response time.
 *
 * Usage (in server.js):
 *   const { requestLogger } = require('./utils/requestLogger');
 *   app.use(requestLogger);
 */

'use strict';

const logger = require('./logger'); // Assumes a Winston logger is exported from utils/logger.js
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware that logs the start and end of each request.
 * The requestId is attached to `req.id` for downstream usage.
 */
function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId; // expose to later middleware/handlers

  const start = process.hrtime();

  // Log request start (debug level)
  logger.debug('request:start', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  // Hook into response finish event
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);

    logger.info('request:complete', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs),
    });
  });

  next();
}

module.exports = { requestLogger };
