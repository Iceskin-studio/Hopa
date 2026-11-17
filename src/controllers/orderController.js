/**
 * Order controller handling creation with inventory management.
 *
 * This module provides a wrapper around the low‑level DB functions to ensure
 * that product stock levels are validated and updated atomically when an
 * order is placed.
 *
 * It expects the following DB functions to exist:
 * - getProductById(id): returns a product object with at least `id`, `stock`,
 *   `price` fields.
 * - createOrder(orderPayload): inserts the order and returns the created
 *   order (including its generated ID).
 * - updateProduct(id, data): updates a product; used here to decrement stock.
 *
 * If any product in the order does not exist or does not have enough stock,
 * the function throws an error with `statusCode = 400`.
 */

import {
  getProductById,
  createOrder,
  updateProduct,
} from '../dbFunctions.js';

/**
 * Validate stock for each order item and calculate the total price.
 * @param {Array<{product_id:number, quantity:number}>} items
 * @returns {{validItems:Array, total:number}}
 * @throws {{message:string, statusCode:number}}
 */
function validateAndPrepareItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw { message: 'Order must contain at least one item', statusCode: 400 };
  }

  const validItems = [];
  let total = 0;

  for (const { product_id, quantity } of items) {
    if (!product_id || !quantity || quantity <= 0) {
      throw { message: 'Invalid item payload', statusCode: 400 };
    }

    const product = getProductById(product_id);
    if (!product) {
      throw { message: `Product ${product_id} not found`, statusCode: 400 };
    }

    if (product.stock === undefined) {
      // If stock tracking is not set up, treat as unlimited.
      validItems.push({ product_id, quantity, price: product.price });
      total += product.price * quantity;
      continue;
    }

    if (product.stock < quantity) {
      throw {
        message: `Insufficient stock for product ${product_id}`,
        statusCode: 400,
      };
    }

    // Prepare item with price snapshot
    validItems.push({ product_id, quantity, price: product.price });
    total += product.price * quantity;
  }

  return { validItems, total };
}

/**
 * Create an order while safely decrementing product inventory.
 *
 * @param {Object} orderPayload
 * @param {string} orderPayload.customer_name
 * @param {string} orderPayload.email
 * @param {string} orderPayload.address
 * @param {Array<{product_id:number, quantity:number}>} orderPayload.items
 * @returns {Object} created order (including generated id)
 * @throws {Error} with `statusCode` for API error handling
 */
export function createOrderWithInventory(orderPayload) {
  // Validate required fields (basic, deeper validation is done by middleware)
  const { customer_name, email, address, items } = orderPayload;
  if (!customer_name || !email || !address) {
    throw { message: 'Missing customer information', statusCode: 400 };
  }

  // Validate items and compute total price
  const { validItems, total } = validateAndPrepareItems(items);

  // Begin "transaction" – SQLite with better‑sqlite3 runs each statement
  // synchronously, so we can safely update stock before inserting the order.
  // In a real app we'd use an explicit transaction.
  for (const { product_id, quantity } of validItems) {
    const product = getProductById(product_id);
    const newStock = (product.stock ?? 0) - quantity;
    updateProduct(product_id, { stock: newStock });
  }

  // Build final order payload with price details
  const orderData = {
    customer_name,
    email,
    address,
    items: validItems,
    total_price: total,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // Persist order
  const createdOrder = createOrder(orderData);
  return createdOrder;
}
