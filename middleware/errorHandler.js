/**
 * middleware/errorHandler.js
 * ---------------------------
 * Central Express error‑handling middleware.
 *
 * Formats any thrown error as a JSON response with an appropriate
 * HTTP status code. In production we hide stack traces.
 */

'use strict';

module.exports = (err, req, res, next) => {
  // If headers are already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal Server Error',
  };

  // Include stack trace only in non‑production environments
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
