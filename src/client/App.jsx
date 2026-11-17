import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import LanguageToggle from "./components/LanguageToggle";
import { CartProvider } from "./context/CartContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <CartProvider>
        <Router>
          <div className="app-container">
            <header className="header">
              <h1 className="title">E‑Commerce Store</h1>
              <LanguageToggle />
              <nav className="nav">
                <a href="/products" className="nav-link">Products</a>
                <a href="/cart" className="nav-link">Cart</a>
                <a href="/checkout" className="nav-link">Checkout</a>
                <a href="/admin" className="nav-link">Admin</a>
              </nav>
            </header>
            <main className="main-content">
              <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<div>Admin Dashboard (protected)</div>} />
              </Routes>
            </main>
            <footer className="footer">
              <p>© 2023 E‑Commerce Store</p>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </I18nextProvider>
  );
}
```
