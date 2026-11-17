/**
 * Middleware to validate the shape of an order payload.
 * Expected body:
 * {
 *   customer_name: string,
 *   email: string,
 *   address: string,
 *   items: [
 *     { product_id: number, quantity: number, price: number }
 *   ]
 * }
 *
 * If validation fails, responds with 400 and a standardized error JSON.
 */

import { error } from '../utils/response.js';

/**
 * Checks if a value is a non‑empty string.
 * @param {any} v
 * @returns {boolean}
 */
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Validates a single order item.
 * @param {any} item
 * @returns {string|null} error message or null if valid
 */
function validateItem(item) {
  if (typeof item !== 'object' || item === null) {
    return 'Each item must be an object';
  }
  const { product_id, quantity, price } = item;
  if (typeof product_id !== 'number' || product_id <= 0) {
    return 'Invalid product_id in item';
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return 'Quantity must be a positive number';
  }
  if (typeof price !== 'number' || price < 0) {
    return 'Price must be a non‑negative number';
  }
  return null;
}

/**
 * Express middleware.
 */
export function validateOrder(req, res, next) {
  const { customer_name, email, address, items } = req.body;

  if (!isNonEmptyString(customer_name)) {
    return res.status(400).json(error('customer_name is required'));
  }
  if (!isNonEmptyString(email)) {
    return res.status(400).json(error('email is required'));
  }
  if (!isNonEmptyString(address)) {
    return res.status(400).json(error('address is required'));
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json(error('items array must contain at least one item'));
  }

  for (let i = 0; i < items.length; i++) {
    const msg = validateItem(items[i]);
    if (msg) {
      return res.status(400).json(error(`Item ${i}: ${msg}`));
    }
  }

  // All good – proceed to the controller
  next();
}
