'use strict';

/**
 * Logs the duration of each HTTP request.
 * Uses high‑resolution timers (process.hrtime.bigint) for accuracy.
 * Output format:
 *   [PERF] GET /api/greeting - 12.34 ms
 */

module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();

  // When the response finishes, compute and log the elapsed time
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6; // convert nanoseconds to ms
    console.log(`[PERF] ${req.method} ${req.originalUrl} - ${durationMs.toFixed(2)} ms`);
  });

  next();
};
