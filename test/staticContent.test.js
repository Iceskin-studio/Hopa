/**
 * QA test: verify static assets contain the expected Arabic greeting.
 *
 * Ensures public/index.html exists, includes the Arabic greeting "اهلا",
 * and declares UTF-8 encoding so the greeting renders correctly in browsers.
 */

'use strict';

const fs = require('fs');
const path = require('path');

describe('Static Arabic Greeting', () => {
  const indexPath = path.join(__dirname, '../public/index.html');

  test('index.html exists', () => {
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  test('index.html contains Arabic greeting "اهلا"', () => {
    const content = fs.readFileSync(indexPath, 'utf8');
    expect(content).toContain('اهلا');
  });

  test('index.html declares UTF-8 charset', () => {
    const content = fs.readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/charset=["']?utf-8["']?/i);
  });
});
