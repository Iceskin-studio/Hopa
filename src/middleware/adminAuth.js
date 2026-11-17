/**
 * Admin authentication middleware.
 *
 * Checks the request for a valid admin token supplied via the
 * `X-Admin-Token` header. The token is compared using a constant‑time
 * algorithm to mitigate timing attacks.
 *
 * If the token is missing or invalid, the middleware responds with
 * a 401 Unauthorized JSON error using the standard response helpers.
 */

import { ADMIN_TOKEN } from '../config.js';
import { error } from '../utils/response.js';

/**
 * Constant‑time string comparison.
 * Returns true if both strings are identical, false otherwise.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function constantTimeEquals(a, b) {
  if (a.length !== b.length) return false;
  // Use bitwise operations to avoid early exit.
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Express middleware that validates the admin token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function adminAuth(req, res, next) {
  const token = req.header('X-Admin-Token') || '';
  if (!constantTimeEquals(token, ADMIN_TOKEN)) {
    return res.status(401).json(error('Invalid admin token', 401));
  }
  next();
}
