/**
 * Security‑related middleware bundle.
 * Applies Helmet, CORS, and rate‑limiting to the Express app.
 * Intended to be imported and invoked from `src/server.js`.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

/**
 * Apply security middle‑wares to an Express application.
 *
 * @param {import('express').Express} app
 */
export function applySecurity(app) {
  // Set a comprehensive set of security headers
  app.use(helmet());

  // Enable CORS – adjust origin in production as needed
  app.use(
    cors({
      origin: '*', // TODO: restrict to allowed origins in prod
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Admin-Token'],
    })
  );

  // Basic rate limiting to mitigate brute‑force and DoS attempts
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
  });

  app.use(limiter);
}
