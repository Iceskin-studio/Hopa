/**
 * Jest tests for utils/validateEnv.js
 *
 * These tests ensure that the environment validation utility correctly
 * identifies missing variables and passes when all required variables are set.
 */

'use strict';

const validateEnv = require('../utils/validateEnv');

describe('validateEnv', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    // Restore original environment after each test
    process.env = { ...ORIGINAL_ENV };
  });

  test('does not throw when all required vars are present', () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'testdb';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'secret';

    expect(() => validateEnv([
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ])).not.toThrow();
  });

  test('throws an error listing missing variables', () => {
    process.env.DB_HOST = 'localhost';
    // DB_PORT intentionally missing
    process.env.DB_NAME = '';
    process.env.DB_USER = 'postgres';
    // DB_PASSWORD missing

    expect(() => validateEnv([
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
    ])).toThrow(
      /Missing required environment variables: DB_PORT, DB_NAME, DB_PASSWORD/
    );
  });
});
