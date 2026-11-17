/**
 * server.js
 * ---------
 * Express application entry point.
 * Configures middleware, routes, database connection, and graceful shutdown.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger').logger;
const requestId = require('./utils/requestId');
const httpLogger = require('./middleware/httpLogger');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { validateGreeting } = require('./middleware/validation');
const greetingModel = require('./models/greeting');
const db = require('./db');
const healthCheck = require('./utils/healthCheck');
const responseHelper = require('./utils/responseHelper');
const { parsePagination, buildPaginationMeta, paginateResponse } = require('./utils/pagination');

const app = express();

// Trust proxy for correct IP behind reverse proxies
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for demo simplicity
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID & HTTP logging
app.use(requestId);
app.use(httpLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint (no rate limit, no auth)
app.get('/health', async (req, res) => {
  const health = await healthCheck.check();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
const apiRouter = express.Router();

// GET /api/greetings - List greetings with pagination
apiRouter.get('/greetings', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await greetingModel.findAll({ limit, offset });
    const meta = buildPaginationMeta(page, limit, total);
    res.json(paginateResponse(rows, meta));
  } catch (err) {
    next(err);
  }
});

// GET /api/greetings/:id - Get single greeting
apiRouter.get('/greetings/:id', async (req, res, next) => {
  try {
    const greeting = await greetingModel.findById(req.params.id);
    if (!greeting) {
      return responseHelper.notFound(res, 'Greeting not found');
    }
    responseHelper.success(res, greeting);
  } catch (err) {
    next(err);
  }
});

// POST /api/greetings - Create new greeting
apiRouter.post('/greetings', validateGreeting, async (req, res, next) => {
  try {
    const greeting = await greetingModel.create(req.body);
    responseHelper.created(res, greeting, 'Greeting created');
  } catch (err) {
    next(err);
  }
});

// PUT /api/greetings/:id - Update greeting
apiRouter.put('/greetings/:id', validateGreeting, async (req, res, next) => {
  try {
    const greeting = await greetingModel.update(req.params.id, req.body);
    if (!greeting) {
      return responseHelper.notFound(res, 'Greeting not found');
    }
    responseHelper.success(res, greeting, 'Greeting updated');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/greetings/:id - Delete greeting
apiRouter.delete('/greetings/:id', async (req, res, next) => {
  try {
    const deleted = await greetingModel.delete(req.params.id);
    if (!deleted) {
      return responseHelper.notFound(res, 'Greeting not found');
    }
    responseHelper.success(res, null, 'Greeting deleted');
  } catch (err) {
    next(err);
  }
});

// Mount API router with version prefix
app.use('/api/v1', apiRouter);

// Serve static frontend
app.use(express.static('public', {
  maxAge: config.env === 'production' ? '1d' : 0,
  etag: true,
}));

// 404 handler for unknown routes
app.use((req, res) => {
  responseHelper.notFound(res, 'Route not found');
});

// Centralized error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
let server;
let isShuttingDown = false;

async function startServer() {
  try {
    // Test database connection
    await db.query('SELECT 1');
    logger.info('Database connection established');

    server = app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`, {
        env: config.env,
        pid: process.pid,
      });
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error('Server error', { error: err.message });
      }
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    logger.info('HTTP server closed');
  }

  // Close database pool
  await db.close();
  logger.info('Database pool closed');

  // Flush logs (Winston handles this automatically on exit)
  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  shutdown('uncaughtException').catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

// Start the server
startServer();

module.exports = app; // Export for testing
