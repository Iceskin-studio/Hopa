/**
 * utils/responseHelper.js
 * -----------------------
 * Centralized helpers for sending JSON responses.
 * Provides a consistent envelope for both success and error payloads.
 *
 * Usage:
 *   const { sendSuccess, sendError } = require('./utils/responseHelper');
 *   sendSuccess(res, { greeting: 'اهلا' });
 *   sendError(res, new Error('boom'), 500);
 */

'use strict';

const { logger } = require('./logger');

/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {any} data - Payload to send.
 * @param {object} [meta] - Optional metadata (e.g., pagination).
 * @param {number} [status=200] - HTTP status code.
 */
function sendSuccess(res, data, meta = {}, status = 200) {
  const payload = {
    status: 'success',
    data,
  };
  if (Object.keys(meta).length) {
    payload.meta = meta;
  }
  res.status(status).json(payload);
}

/**
 * Sends an error JSON response.
 *
 * @param {import('express').Response} res - Express response object.
 * @param {Error|object|string} err - Error object, plain object, or message string.
 * @param {number} [status=500] - HTTP status code.
 */
function sendError(res, err, status = 500) {
  // Normalise error shape
  let errorObj = {
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  };

  if (err instanceof Error) {
    errorObj.error = err.name || 'Error';
    errorObj.message = err.message;
    if (err.stack) {
      logger.error({ err }, err.message);
    }
  } else if (typeof err === 'object' && err !== null) {
    errorObj = { ...errorObj, ...err };
    logger.warn({ err }, err.message || err.error);
  } else {
    errorObj.message = String(err);
    logger.warn({ err }, errorObj.message);
  }

  res.status(status).json(errorObj);
}

module.exports = {
  sendSuccess,
  sendError,
};
