/**
 * middleware/rateLimiter.js
 * -------------------------
 * Express rate limiting middleware using express-rate-limit.
 * Provides configurable limiters for different route groups.
 *
 * Enhancements (Module 14):
 *  • Centralised configuration via `config.rateLimits` (environment aware).
 *  • Allows custom `keyGenerator` and `skip` logic per limiter.
 *  • Exposes a factory `createLimiter(name, overrides)` that merges defaults,
 *    config‑based settings and caller overrides.
 */

'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Resolve limiter options by merging defaults, config and overrides.
 *
 * @param {string} name - Identifier used in config.rateLimits (e.g., 'global', 'api').
 * @param {Object} [overrides] - Runtime overrides.
 * @returns {Object} Normalised options for `express-rate-limit`.
 */
function resolveOptions(name, overrides = {}) {
  const cfg = (config.rateLimits && config.rateLimits[name]) || {};

  // Base defaults – can be overridden by config or caller.
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: {
      error: 'TooManyRequests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((cfg.windowMs || defaults.windowMs) / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    skip: (req) => {
      // Health checks are never rate‑limited in non‑production.
      if (config.env !== 'production' && req.path === '/health') return true;
      return false;
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    },
  };

  // Merge order: defaults <- config <- overrides
  const merged = {
    ...defaults,
    ...cfg,
    ...overrides,
  };

  // Ensure `message.retryAfter` reflects the final windowMs.
  if (merged.message && typeof merged.message === 'object') {
    merged.message.retryAfter = Math.ceil(merged.windowMs / 1000);
  }

  return merged;
}

/**
 * Create a rate limiter with common options.
 *
 * @param {string} name - Identifier for the limiter (matches config.rateLimits key).
 * @param {Object} [overrides] - Optional overrides for this specific instance.
 * @returns {import('express').RequestHandler}
 */
function createLimiter(name = 'default', overrides) {
  const options = resolveOptions(name, overrides);
  return rateLimit(options);
}

// Pre‑configured limiters – keep backwards compatibility.
const globalLimiter = createLimiter('global', {
  max: 200,
});

const apiLimiter = createLimiter('api', {
  max: 100,
});

const authLimiter = createLimiter('auth', {
  max: 20,
  message: {
    error: 'TooManyRequests',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900,
  },
});

const createGreetingLimiter = createLimiter('createGreeting', {
  windowMs: 60 * 1000, // 1 min
  max: 30,
});

module.exports = {
  createLimiter,
  globalLimiter,
  apiLimiter,
  authLimiter,
  createGreetingLimiter,
};
