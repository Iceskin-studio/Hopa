/**
 * utils/gracefulShutdown.js
 * -------------------------
 * Helper to gracefully terminate the HTTP server and database pool.
 *
 * Example usage (in server.js):
 *   const { setupGracefulShutdown } = require('./utils/gracefulShutdown');
 *   setupGracefulShutdown(server);
 */

'use strict';

const logger = require('./logger');
const db = require('../db');

/**
 * Registers signal handlers that close the server and DB pool.
 *
 * @param {import('http').Server} server - The Node HTTP/HTTPS server instance.
 * @param {Object} [options]
 * @param {number} [options.timeout=30000] - Max time (ms) to wait before force exit.
 */
function setupGracefulShutdown(server, options = {}) {
  const timeout = options.timeout ?? 30_000;

  const shutdown = (signal) => async () => {
    logger.info(`Received ${signal}. Commencing graceful shutdown...`);

    // Stop accepting new connections.
    server.close(async (err) => {
      if (err) {
        logger.error('Error while closing server', { err });
        process.exit(1);
      }

      try {
        // Close DB pool if present.
        if (db && typeof db.end === 'function') {
          await db.end();
          logger.info('Database pool closed');
        }
      } catch (dbErr) {
        logger.error('Error while closing DB pool', { dbErr });
      }

      logger.info('Shutdown complete. Exiting.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long.
    setTimeout(() => {
      logger.warn('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, timeout).unref();
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));
}

module.exports = { setupGracefulShutdown };
