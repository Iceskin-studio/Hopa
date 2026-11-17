import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { validateProduct } from '../middleware/validateProduct.js';
import { validateOrder } from '../middleware/validateOrder.js';
import { success, error } from '../utils/response.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from '../dbFunctions.js';

const router = Router();

/* ------------------------------------------------------------------ */
/* Product Management (CRUD)                                           */
/* ------------------------------------------------------------------ */

router.post(
  '/products',
  adminAuth,
  validateProduct,
  asyncHandler(async (req, res) => {
    const newProduct = await createProduct(req.body);
    res.status(201).json(success(newProduct));
  })
);

router.put(
  '/products/:id',
  adminAuth,
  validateProduct,
  asyncHandler(async (req, res) => {
    const updated = await updateProduct(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json(error('Product not found', 404));
    res.json(success(updated));
  })
);

router.delete(
  '/products/:id',
  adminAuth,
  asyncHandler(async (req, res) => {
    const deleted = await deleteProduct(Number(req.params.id));
    if (!deleted) return res.status(404).json(error('Product not found', 404));
    res.json(success({ id: Number(req.params.id) }));
  })
);

/* ------------------------------------------------------------------ */
/* Order Management                                                    */
/* ------------------------------------------------------------------ */

router.get(
  '/orders',
  adminAuth,
  asyncHandler(async (req, res) => {
    const orders = await getAllOrders();
    res.json(success(orders));
  })
);

router.put(
  '/orders/:id/status',
  adminAuth,
  validateOrder,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const updated = await updateOrderStatus(Number(req.params.id), status);
    if (!updated) return res.status(404).json(error('Order not found', 404));
    res.json(success(updated));
  })
);

export default router;
