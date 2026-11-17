/**
 * utils/healthCheck.js
 * --------------------
 * Provides a lightweight health‑check routine used by the /healthz endpoint.
 * It aggregates process information and optionally verifies DB connectivity.
 */

'use strict';

const db = require('../db');

/**
 * Returns a plain object describing the health of the service.
 * @param {object} options
 * @param {boolean} [options.checkDb=false] - Whether to perform a cheap DB ping.
 * @returns {Promise<object>}
 */
async function getHealth({ checkDb = false } = {}) {
  const health = {
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  if (checkDb) {
    try {
      // A simple SELECT 1 query – cheap and works on any PostgreSQL version.
      await db.query('SELECT 1');
      health.db = 'connected';
    } catch (err) {
      health.db = 'error';
      health.status = 'degraded';
      health.dbError = err.message;
    }
  }

  return health;
}

module.exports = { getHealth };
