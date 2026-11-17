import React, { createContext, useContext, useReducer } from "react";

/**
 * Cart item shape:
 * {
 *   id: string | number,
 *   title: string,
 *   price: number,
 *   image: string,
 *   quantity: number
 * }
 */

/* ---------- Contexts ---------- */
const CartStateContext = createContext(null);
const CartDispatchContext = createContext(null);

/* ---------- Reducer ---------- */
function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists) {
        // If already in cart, increase quantity
        return state.map((i) =>
          i.id === action.item.id
            ? { ...i, quantity: i.quantity + (action.item.quantity || 1) }
            : i
        );
      }
      return [...state, { ...action.item, quantity: action.item.quantity || 1 }];
    }
    case "update": {
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: action.quantity } : i
      );
    }
    case "remove": {
      return state.filter((i) => i.id !== action.id);
    }
    case "clear": {
      return [];
    }
    default:
      throw new Error(`Unhandled cart action type: ${action.type}`);
  }
}

/* ---------- Provider ---------- */
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  return (
    <CartStateContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

/* ---------- Hooks ---------- */
export function useCart() {
  const context = useContext(CartStateContext);
  if (context === null) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function useCartDispatch() {
  const context = useContext(CartDispatchContext);
  if (context === null) {
    throw new Error("useCartDispatch must be used within a CartProvider");
  }
  return context;
}

/* ---------- Utility ---------- */
export function cartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
