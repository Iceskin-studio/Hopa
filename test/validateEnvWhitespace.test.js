/**
 * Additional Jest tests for utils/validateEnv.js
 *
 * These tests verify that the environment validation utility correctly
 * treats whitespace‑only strings as missing and handles edge cases such as
 * an empty required‑variables list.
 */

'use strict';

const validateEnv = require('../utils/validateEnv');

describe('validateEnv – edge cases', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    // Restore original environment after each test
    process.env = { ...ORIGINAL_ENV };
  });

  test('whitespace‑only values are considered missing', () => {
    process.env.DB_HOST = '   '; // whitespace only
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
    ])).toThrow(/Missing required environment variables: DB_HOST/);
  });

  test('does not throw when required variables list is empty', () => {
    // No environment variables needed
    expect(() => validateEnv([])).not.toThrow();
  });

  test('ignores undefined variables that are not required', () => {
    // Only DB_HOST is required; others may be undefined
    process.env.DB_HOST = 'localhost';
    expect(() => validateEnv(['DB_HOST'])).not.toThrow();
  });
});
