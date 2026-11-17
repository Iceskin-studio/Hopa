'use strict';

/**
 * Simple in‑memory response cache for GET requests.
 * Caches the full response body keyed by the request URL.
 * Cache TTL is configurable via the `CACHE_TTL_SECONDS` env variable.
 * Adds an `X-Cache` header indicating HIT or MISS.
 */

const NodeCache = require('node-cache');

// Default TTL = 30 seconds if not set
const ttl = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 30;
const cache = new NodeCache({ stdTTL: ttl, checkperiod: Math.max(ttl, 60) });

module.exports = (req, res, next) => {
  // Only cache safe GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl || req.url;

  const cached = cache.get(key);
  if (cached !== undefined) {
    res.setHeader('X-Cache', 'HIT');
    return res.send(cached);
  }

  // Hook into `res.send` to store the payload once generated
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    // Store only successful (2xx) responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    res.setHeader('X-Cache', 'MISS');
    return originalSend(body);
  };

  next();
};
