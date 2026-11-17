/**
 * Simple validation helpers for product and order payloads.
 * Designed to be lightweight and not depend on external libraries,
 * making them easy to test and reuse across the codebase.
 */

/**
 * Validate product data received from admin routes.
 *
 * Expected fields:
 * - title (string, required, non‑empty)
 * - description (string, optional)
 * - price (number, required, > 0)
 * - stock (integer, required, >= 0)
 * - category (string, required)
 *
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProductData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Payload must be an object.');
    return { valid: false, errors };
  }

  if (typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('Title is required and must be a non‑empty string.');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Description, if provided, must be a string.');
  }

  if (typeof data.price !== 'number' || data.price <= 0) {
    errors.push('Price is required and must be a positive number.');
  }

  if (
    typeof data.stock !== 'number' ||
    !Number.isInteger(data.stock) ||
    data.stock < 0
  ) {
    errors.push('Stock is required and must be a non‑negative integer.');
  }

  if (typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push('Category is required and must be a non‑empty string.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate order data received from the checkout endpoint.
 *
 * Expected fields:
 * - name (string, required)
 * - email (string, required, basic email format)
 * - address (string, required)
 * - items (array of { productId, quantity })
 *
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateOrderData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Payload must be an object.');
    return { valid: false, errors };
  }

  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required.');
  }

  if (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid email address is required.');
  }

  if (typeof data.address !== 'string' || data.address.trim() === '') {
    errors.push('Address is required.');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item.');
  } else {
    data.items.forEach((item, idx) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Item #${idx + 1} is invalid.`);
        return;
      }
      if (!item.productId) {
        errors.push(`Item #${idx + 1} missing productId.`);
      }
      if (
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        errors.push(`Item #${idx + 1} has invalid quantity.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
