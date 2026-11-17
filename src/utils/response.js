/**
 * Helper to create consistent JSON API responses.
 */

/**
 * Success response wrapper.
 * @param {any} data
 * @returns {{ success: true, data: any }}
 */
export function success(data) {
  return { success: true, data };
}

/**
 * Error response wrapper.
 * @param {string} message
 * @param {number} [status=400]
 * @returns {{ success: false, error: string, status: number }}
 */
export function error(message, status = 400) {
  return { success: false, error: message, status };
}
