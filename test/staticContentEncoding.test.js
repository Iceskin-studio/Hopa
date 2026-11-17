/**
 * QA test: verify UTF-8 byte-level encoding of the Arabic greeting.
 *
 * Ensures the greeting "اهلا" is stored as proper UTF-8 bytes (not HTML
 * entities or unicode escapes) so browsers render it correctly regardless
 * of the response Content-Type header.
 */

'use strict';

const fs = require('fs');
const path = require('path');

describe('Arabic greeting UTF-8 encoding', () => {
  const indexPath = path.join(__dirname, '../public/index.html');

  test('greeting is stored as raw UTF-8 bytes', () => {
    const buffer = fs.readFileSync(indexPath);
    // "اهلا" in UTF-8 is: D8 A7 D9 87 D9 84 D8 A7
    const greetingBytes = Buffer.from('اهلا', 'utf8');
    expect(buffer.includes(greetingBytes)).toBe(true);
  });

  test('greeting is not HTML-entity encoded', () => {
    const content = fs.readFileSync(indexPath, 'utf8');
    // Should not contain numeric character references for the greeting
    expect(content).not.toMatch(/&#x627;|&#1575;/);
  });

  test('greeting is not unicode-escaped', () => {
    const content = fs.readFileSync(indexPath, 'utf8');
    expect(content).not.toContain('\\u0627');
  });

  test('index.html is valid UTF-8 (no replacement characters)', () => {
    const content = fs.readFileSync(indexPath, 'utf8');
    // U+FFFD is the replacement character inserted on decode failure
    expect(content).not.toContain('\uFFFD');
  });
});
