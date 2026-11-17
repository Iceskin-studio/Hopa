/**
 * db/index.js
 * ------------
 * PostgreSQL connection wrapper using the `pg` library.
 * Enhancements:
 *   - Integrated Winston logger for query debugging and error reporting.
 *   - Added `transaction` helper for atomic operations.
 *   - Graceful shutdown support via `close`.
 *
 * Usage examples:
 *   const db = require('../db');
 *   const { rows } = await db.query('SELECT * FROM greetings');
 *
 *   // Transaction:
 *   await db.transaction(async (client) => {
 *     await client.query('INSERT INTO greetings (text) VALUES ($1)', ['سلام']);
 *   });
 */

'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger'); // Assumes a Winston logger is exported

// Pool configuration – values can be overridden via environment variables.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'arabic_greeting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Execute a parameterized query with optional logging.
 *
 * @param {string} text - SQL query text.
 * @param {Array<any>} [params] - Query parameters.
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  const client = await pool.connect();
  try {
    logger.debug('DB Query', { text, params });
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    logger.info('DB Query Executed', {
      text: text.replace(/\s+/g, ' ').trim(),
      duration: `${duration}ms`,
      rowCount: res.rowCount,
    });
    return res;
  } catch (err) {
    logger.error('DB Query Error', { text, params, error: err });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Run a series of queries within a transaction.
 *
 * @param {function(import('pg').PoolClient): Promise<any>} callback
 *   Async function that receives a dedicated client.
 * @returns {Promise<any>} Result of the callback.
 *
 * @example
 *   await db.transaction(async (client) => {
 *     await client.query('INSERT INTO greetings (text) VALUES ($1)', ['مرحبا']);
 *   });
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logger.info('DB Transaction COMMITTED');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('DB Transaction ROLLED BACK', { error: err });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Gracefully close the pool (e.g., on shutdown).
 */
async function close() {
  try {
    await pool.end();
    logger.info('PostgreSQL pool has been closed');
  } catch (err) {
    logger.error('Error while closing PostgreSQL pool', { error: err });
  }
}

module.exports = {
  query,
  transaction,
  close,
};
