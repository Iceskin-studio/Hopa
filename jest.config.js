/**
 * Jest configuration for the Arabic Greeting App.
 * Runs tests located in the `test/` directory and uses Node environment.
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
