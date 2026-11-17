/**
 * Public product and order routes.
 */

import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
} from '../dbFunctions.js';
import { success, error } from '../utils/response.js';
import { validateOrder } from '../middleware/validateOrder.js';
import { parseProductFilters } from '../middleware/parseProductFilters.js';
import { createOrderWithInventory } from '../controllers/orderController.js';

const router = Router();

/**
 * GET /api/products
 * Optional query: search, category, minPrice, maxPrice, page, limit
 */
router.get('/products', parseProductFilters, (req, res) => {
  try {
    const products = getAllProducts(req.parsedFilters);
    res.json(success(products));
  } catch (e) {
    console.error('GET /products error:', e);
    res.status(500).json(error('Failed to fetch products'));
  }
});

/**
 * GET /api/products/:id
 */
router.get('/products/:id', (req, res) => {
  const product = getProductById(Number(req.params.id));
  if (!product) return res.status(404).json(error('Product not found', 404));
  res.json(success(product));
});

/**
 * POST /api/orders
 * Body: { customer_name, email, address, items: [{ product_id, quantity }] }
 * Validation middleware ensures payload shape before reaching controller.
 */
router.post('/orders', validateOrder, (req, res) => {
  try {
    const order = createOrderWithInventory(req.body);
    res.status(201).json(success(order));
  } catch (e) {
    const status = e.statusCode || 400;
    console.error('POST /orders error:', e);
    res.status(status).json(error(e.message, status));
  }
});

export default router;
