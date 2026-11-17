/**
 * Central error‑handling middleware.
 *
 * All errors that reach this point are transformed into the
 * standard JSON shape defined in `src/utils/response.js`.
 * It also logs the error stack in non‑production environments
 * to aid debugging while keeping the response payload clean.
 */

import { error } from '../utils/response.js';

/**
 * Express error‑handling middleware.
 *
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  // Default to 500 Internal Server Error
  const status = err.status || 500;

  // In development, include stack trace for easier debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Send a consistent error response
  res.status(status).json(error(err.message || 'Internal Server Error', status));
}
