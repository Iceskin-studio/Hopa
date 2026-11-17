'use strict';

/**
 * Compression middleware using the `compression` package.
 * Applies gzip/deflate to responses larger than 1KB.
 * Can be disabled per-request with the `X-No-Compression` header.
 */

const compression = require('compression');

module.exports = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Allow clients to opt‑out via a custom header
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Moderate compression level for a good speed/size trade‑off
  level: 6,
});
