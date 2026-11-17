/**
 * utils/logger.js
 * ---------------
 * Centralized Winston logger configuration.
 * Provides structured JSON logs in production, pretty console in development.
 * Enhanced to automatically include a `requestId` field when present in log metadata.
 */

'use strict';

const winston = require('winston');
const config = require('../config');

/**
 * Custom format that injects `requestId` (if any) into the log message.
 * This makes correlation of logs with incoming HTTP requests easier.
 */
const requestIdFormat = winston.format((info) => {
  if (info.requestId) {
    // Ensure requestId appears as a top‑level field in the JSON output
    info.requestId = String(info.requestId);
  }
  return info;
});

/* Base JSON format for production */
const logFormat = winston.format.combine(
  requestIdFormat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/* Human‑readable console format for development */
const consoleFormat = winston.format.combine(
  requestIdFormat(),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    const reqPart = requestId ? ` [req:${requestId}]` : '';
    return `${timestamp} [${level}]${reqPart}: ${message} ${metaStr}`;
  })
);

const transports = [
  new winston.transports.Console({
    format: config.env === 'production' ? logFormat : consoleFormat,
  }),
];

/* In production, also write to files (optional, can be extended with daily-rotate-file) */
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

/* Create the base logger */
const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'arabic-greeting-app' },
  transports,
  exitOnError: false,
});

/**
 * Create a child logger with additional context.
 * If a `requestId` is supplied, it will be automatically attached to all log entries.
 *
 * @param {Object} context - Additional metadata (e.g., { requestId: 'abc-123' }).
 * @returns {winston.Logger}
 */
function child(context = {}) {
  // Ensure requestId is a string to avoid circular JSON issues
  if (context.requestId) {
    context.requestId = String(context.requestId);
  }
  return logger.child(context);
}

module.exports = {
  logger,
  child,
};
