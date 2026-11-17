// src/server.js
/**
 * Minimal Express API for the e‑commerce store.
 * Exposes public product routes and protected admin routes.
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

// ---- DB Setup --------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, "store.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    size TEXT,
    color TEXT,
    stock INTEGER,
    image TEXT
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT,
    address TEXT,
    email TEXT,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL
  );
`);

// ---- Middleware -------------------------------------------------------------
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "public")));

// ---- Helper ---------------------------------------------------------------
function jsonResponse(success, data = null, error = null) {
  return { success, data, error };
}

// ---- Public Routes ---------------------------------------------------------
app.get("/api/products", (req, res) => {
  const { search, category, minPrice, maxPrice, size, color } = req.query;
  let stmt = db.prepare("SELECT * FROM products");
  let rows = stmt.all();

  // Simple in‑memory filtering (good enough for demo)
  if (search) rows = rows.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  if (category) rows = rows.filter(p => p.category === category);
  if (size) rows = rows.filter(p => p.size === size);
  if (color) rows = rows.filter(p => p.color === color);
  if (minPrice) rows = rows.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) rows = rows.filter(p => p.price <= parseFloat(maxPrice));

  res.json(jsonResponse(true, rows));
});

app.get("/api/products/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
  const product = stmt.get(req.params.id);
  if (!product) return res.status(404).json(jsonResponse(false, null, "Not found"));
  res.json(jsonResponse(true, product));
});

app.post("/api/checkout", (req, res) => {
  const { cart, customer, address, email } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json(jsonResponse(false, null, "Empty cart"));
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer, address, email, total) VALUES (?, ?, ?, ?)
  `);
  const orderInfo = insertOrder.run(customer, address, email, total);
  const orderId = orderInfo.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)
  `);
  const updateStock = db.prepare(`
    UPDATE products SET stock = stock - ? WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    cart.forEach(item => {
      insertItem.run(orderId, item.id, item.quantity, item.price);
      updateStock.run(item.quantity, item.id);
    });
  });
  transaction();

  res.json(jsonResponse(true, { orderId, total }));
});

// ---- Admin Middleware -------------------------------------------------------
const ADMIN_TOKEN = "super-secret-token"; // In real life use env + proper auth

function adminAuth(req, res, next) {
  const token = req.header("X-Admin-Token");
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json(jsonResponse(false, null, "Forbidden"));
  }
  next();
}

// ---- Admin Routes -----------------------------------------------------------
app.use("/api/admin", adminAuth);

app.get("/api/admin/products", (req, res) => {
  const rows = db.prepare("SELECT * FROM products").all();
  res.json(jsonResponse(true, rows));
});

app.post("/api/admin/products", (req, res) => {
  const { title, description, price, category, size, color, stock, image } = req.body;
  const stmt = db.prepare(`
    INSERT INTO products (title, description, price, category, size, color, stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, price, category, size, color, stock, image);
  res.json(jsonResponse(true, { id: info.lastInsertRowid }));
});

app.put("/api/admin/products/:id", (req, res) => {
  const { title, description, price, category, size, color, stock, image } = req.body;
  const stmt = db.prepare(`
    UPDATE products SET title = ?, description = ?, price = ?, category = ?, size = ?, color = ?, stock = ?, image = ?
    WHERE id = ?
  `);
  stmt.run(title, description, price, category, size, color, stock, image, req.params.id);
  res.json(jsonResponse(true));
});

app.delete("/api/admin/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json(jsonResponse(true));
});

app.get("/api/admin/orders", (req, res) => {
  const rows = db.prepare(`
    SELECT o.*, GROUP_CONCAT(oi.product_id) AS productIds
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all();
  res.json(jsonResponse(true, rows));
});

app.patch("/api/admin/orders/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json(jsonResponse(true));
});

// ---- Error Handler ---------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json(jsonResponse(false, null, "Internal Server Error"));
});

// ---- Server Export ---------------------------------------------------------
export function startServer(port = 3000) {
  app.listen(port, () => console.log(`🚀 Server listening on http://localhost:${port}`));
}

// If run directly, start server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
