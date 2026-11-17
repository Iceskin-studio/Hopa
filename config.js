/**
 * config.js
 * ---------
 * Centralized configuration management.
 * Loads environment variables and provides typed, validated config values.
 */

'use strict';

require('dotenv').config();

/**
 * @typedef {Object} AppConfig
 * @property {string} env - Node environment (development|production|test)
 * @property {string} host - Server bind host
 * @property {number} port - Server listen port
 * @property {number} staticMaxAge - Static asset cache max-age in ms
 * @property {number} shutdownTimeoutMs - Graceful shutdown timeout
 * @property {Object} db - Database configuration
 * @property {string} db.host
 * @property {number} db.port
 * @property {string} db.name
 * @property {string} db.user
 * @property {string} db.password
 * @property {number} db.maxConnections
 * @property {number} db.idleTimeoutMs
 * @property {number} db.connectionTimeoutMs
 */

function parseIntEnv(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${name}: ${value}`);
  }
  return parsed;
}

function parseBoolEnv(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
}

/** @type {AppConfig} */
const config = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: parseIntEnv('PORT', 3000),
  staticMaxAge: parseIntEnv('STATIC_MAX_AGE', 3600000), // 1 hour default
  shutdownTimeoutMs: parseIntEnv('SHUTDOWN_TIMEOUT_MS', 10000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseIntEnv('DB_PORT', 5432),
    name: process.env.DB_NAME || 'arabic_greeting',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseIntEnv('DB_MAX_CONNECTIONS', 10),
    idleTimeoutMs: parseIntEnv('DB_IDLE_TIMEOUT_MS', 30000),
    connectionTimeoutMs: parseIntEnv('DB_CONNECTION_TIMEOUT_MS', 5000),
  },
};

// Validate required config in production
if (config.env === 'production') {
  const required = ['DB_PASSWORD'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable in production: ${key}`);
    }
  }
}

module.exports = config;
