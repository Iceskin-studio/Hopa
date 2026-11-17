/**
 * Pure cart helper utilities.
 * A cart is an array of items: { productId, title, price, quantity }.
 */

/**
 * Calculate total price of cart items.
 * @param {Array} cartItems
 * @returns {number}
 */
export function calculateCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Add an item to the cart (or increase quantity if exists).
 * @param {Array} cartItems
 * @param {Object} newItem { productId, title, price, quantity }
 * @returns {Array} new cart array
 */
export function addItemToCart(cartItems, newItem) {
  const existing = cartItems.find(i => i.productId === newItem.productId);
  if (existing) {
    return cartItems.map(i =>
      i.productId === newItem.productId
        ? { ...i, quantity: i.quantity + newItem.quantity }
        : i
    );
  }
  return [...cartItems, newItem];
}

/**
 * Remove an item from the cart.
 * @param {Array} cartItems
 * @param {number} productId
 * @returns {Array}
 */
export function removeItemFromCart(cartItems, productId) {
  return cartItems.filter(i => i.productId !== productId);
}

/**
 * Update quantity of a cart item.
 * @param {Array} cartItems
 * @param {number} productId
 * @param {number} quantity
 * @returns {Array}
 */
export function updateCartItemQuantity(cartItems, productId, quantity) {
  if (quantity <= 0) return removeItemFromCart(cartItems, productId);
  return cartItems.map(i =>
    i.productId === productId ? { ...i, quantity } : i
  );
}
