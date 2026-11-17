/**
 * QA test: verify project structure and configuration files.
 *
 * Ensures key files exist and configuration files are valid. This guards
 * against accidental deletions or misconfigurations that would break the
 * app at runtime or during deployment.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

describe('Project structure – required files', () => {
  const requiredFiles = [
    'package.json',
    'server.js',
    'config.js',
    'public/index.html',
    'public/styles.css',
    'public/script.js',
    'db/schema.sql',
    'db/seed.sql',
    'migrations/001_create_greetings.sql',
    'openapi.yaml',
    '.env.example',
  ];

  test.each(requiredFiles)('%s exists', (file) => {
    expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
  });
});

describe('package.json', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
  );

  test('has a start script', () => {
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
  });

  test('has a test script', () => {
    expect(pkg.scripts.test).toBeDefined();
  });

  test('declares express dependency', () => {
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };
    expect(deps.express).toBeDefined();
  });
});

describe('.env.example', () => {
  const envExample = fs.readFileSync(
    path.join(ROOT, '.env.example'),
    'utf8'
  );

  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  test.each(requiredVars)('declares %s', (name) => {
    expect(envExample).toMatch(new RegExp(`^${name}=`, 'm'));
  });
});

describe('JSON config files', () => {
  test('public/manifest.json is valid JSON', () => {
    const content = fs.readFileSync(
      path.join(ROOT, 'public/manifest.json'),
      'utf8'
    );
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
