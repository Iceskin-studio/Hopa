/**
 * Central configuration for the application.
 * Values can be overridden by environment variables.
 */

export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'default-admin-token';
export const PORT = Number(process.env.PORT) || 3000;
export const DB_FILE = process.env.DB_FILE || 'ecommerce.db';
