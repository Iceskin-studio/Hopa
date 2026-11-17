/**
 * SQLite database initialization and helper functions.
 * Uses better-sqlite3 for synchronous API (suitable for small e‑commerce app).
 */

import Database from 'better-sqlite3';
import { DB_FILE } from './config.js';
import { error, success } from './utils/response.js';

const db = new Database(DB_FILE);

/* ---------- Schema ---------- */
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    category TEXT,
    size TEXT,
    color TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

/* ---------- Product Helpers ---------- */
export function getAllProducts(filters = {}) {
  let sql = `SELECT * FROM products WHERE 1=1`;
  const params = [];

  if (filters.search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    const term = `%${filters.search}%`;
    params.push(term, term);
  }
  if (filters.category) {
    sql += ` AND category = ?`;
    params.push(filters.category);
  }
  if (filters.minPrice) {
    sql += ` AND price >= ?`;
    params.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    sql += ` AND price <= ?`;
    params.push(filters.maxPrice);
  }

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function getProductById(id) {
  const stmt = db.prepare(`SELECT * FROM products WHERE id = ?`);
  return stmt.get(id);
}

export function createProduct(product) {
  const stmt = db.prepare(`
    INSERT INTO products (title, description, price, image, category, size, color, stock)
    VALUES (@title, @description, @price, @image, @category, @size, @color, @stock)
  `);
  const info = stmt.run(product);
  return getProductById(info.lastInsertRowid);
}

export function updateProduct(id, updates) {
  const fields = Object.keys(updates)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  const stmt = db.prepare(`
    UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
  `);
  stmt.run({ ...updates, id });
  return getProductById(id);
}

export function deleteProduct(id) {
  const stmt = db.prepare(`DELETE FROM products WHERE id = ?`);
  stmt.run(id);
}

/* ---------- Order Helpers ---------- */
export function createOrder(orderData) {
  const { customer_name, email, address, items } = orderData;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, email, address, total)
    VALUES (?, ?, ?, ?)
  `);
  const orderInfo = insertOrder.run(customer_name, email, address, total);
  const orderId = orderInfo.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (?, ?, ?, ?)
  `);
  const decrementStock = db.prepare(`
    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
  `);

  const transaction = db.transaction((items) => {
    for (const item of items) {
      // Ensure enough stock
      const stockCheck = db
        .prepare(`SELECT stock FROM products WHERE id = ?`)
        .get(item.product_id);
      if (!stockCheck || stockCheck.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      decrementStock.run(item.quantity, item.product_id, item.quantity);
    }
  });

  transaction(items);

  return getOrderById(orderId);
}

export function getOrders() {
  const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
  return stmt.all();
}

export function getOrderById(id) {
  const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  if (!order) return null;
  const items = db
    .prepare(
      `SELECT oi.*, p.title, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`
    )
    .all(id);
  return { ...order, items };
}

export function updateOrderStatus(id, status) {
  const stmt = db.prepare(`UPDATE orders SET status = ? WHERE id = ?`);
  stmt.run(status, id);
  return getOrderById(id);
}
