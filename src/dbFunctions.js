/**
 * Database access layer for the e‑commerce API.
 * Uses better-sqlite3 for synchronous queries (suitable for small SQLite DB).
 *
 * Exported functions match the imports used in the route files.
 */

import Database from 'better-sqlite3';
import { DB_FILE } from './config.js';

// Initialise (or open) the SQLite database.
const db = new Database(DB_FILE);

// ---------------------------------------------------------------------------
// Schema initialization (run once on startup)
// ---------------------------------------------------------------------------
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    category TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL CHECK (price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// ---------------------------------------------------------------------------
// Helper: build dynamic WHERE clause for product filters
// ---------------------------------------------------------------------------
function buildProductFilter(query) {
  const conditions = [];
  const params = {};

  if (query.search) {
    conditions.push(`(title LIKE @search OR description LIKE @search)`);
    params.search = `%${query.search}%`;
  }
  if (query.category) {
    conditions.push(`category = @category`);
    params.category = query.category;
  }
  if (query.minPrice) {
    conditions.push(`price >= @minPrice`);
    params.minPrice = Number(query.minPrice);
  }
  if (query.maxPrice) {
    conditions.push(`price <= @maxPrice`);
    params.maxPrice = Number(query.maxPrice);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

// ---------------------------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------------------------
export function getAllProducts(filter = {}) {
  const { where, params } = buildProductFilter(filter);
  const stmt = db.prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC`);
  return stmt.all(params);
}

export function getProductById(id) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
}

export function createProduct(data) {
  const {
    title,
    description = '',
    price,
    category = '',
    stock = 0,
    image_url = '',
  } = data;

  if (!title || price === undefined) {
    throw new Error('Missing required fields: title, price');
  }

  const stmt = db.prepare(`
    INSERT INTO products (title, description, price, category, stock, image_url, created_at, updated_at)
    VALUES (@title, @description, @price, @category, @stock, @image_url, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  const info = stmt.run({ title, description, price, category, stock, image_url });
  return getProductById(info.lastInsertRowid);
}

export function updateProduct(id, data) {
  const product = getProductById(id);
  if (!product) throw new Error('Product not found');

  const fields = [];
  const params = { id };

  // Only update provided fields
  for (const key of ['title', 'description', 'price', 'category', 'stock', 'image_url']) {
    if (key in data) {
      fields.push(`${key} = @${key}`);
      params[key] = data[key];
    }
  }

  if (!fields.length) {
    throw new Error('No fields to update');
  }

  const stmt = db.prepare(`
    UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  stmt.run(params);
  return getProductById(id);
}

export function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  stmt.run(id);
}

// ---------------------------------------------------------------------------
// Order handling
// ---------------------------------------------------------------------------
export function createOrder(orderData) {
  const { customer_name, email, address, items } = orderData;

  if (!customer_name || !email || !address) {
    throw new Error('Missing required customer fields');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // Validate each item
  const validatedItems = items.map((it) => {
    const { product_id, quantity } = it;
    if (!product_id || !quantity) {
      throw new Error('Each item must have product_id and quantity');
    }
    const product = getProductById(product_id);
    if (!product) throw new Error(`Product ${product_id} not found`);
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for product ${product_id}`);
    }
    return {
      product_id,
      quantity,
      price: product.price, // capture current price
    };
  });

  // Transaction ensures atomicity
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_name, email, address, status, created_at, updated_at)
    VALUES (@customer_name, @email, @address, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (@order_id, @product_id, @quantity, @price)
  `);
  const updateStock = db.prepare(`
    UPDATE products SET stock = stock - @quantity, updated_at = CURRENT_TIMESTAMP
    WHERE id = @product_id
  `);

  const transaction = db.transaction(() => {
    const orderInfo = insertOrder.run({ customer_name, email, address });
    const orderId = orderInfo.lastInsertRowid;

    for (const it of validatedItems) {
      insertItem.run({
        order_id: orderId,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
      });
      updateStock.run({ product_id: it.product_id, quantity: it.quantity });
    }

    return orderId;
  });

  const orderId = transaction();

  // Return a compact order representation
  return {
    id: orderId,
    customer_name,
    email,
    address,
    status: 'pending',
    items: validatedItems,
  };
}

export function getOrders() {
  const stmt = db.prepare(`
    SELECT o.*, COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);
  return stmt.all();
}

export function getOrderById(id) {
  const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  const order = orderStmt.get(id);
  if (!order) return null;

  const itemsStmt = db.prepare(`
    SELECT oi.*, p.title, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `);
  const items = itemsStmt.all(id);
  return { ...order, items };
}

export function updateOrderStatus(id, status) {
  const allowed = ['pending', 'shipped', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
  }

  const stmt = db.prepare(`
    UPDATE orders SET status = @status, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  const info = stmt.run({ id, status });
  if (info.changes === 0) return null;
  return getOrderById(id);
}
