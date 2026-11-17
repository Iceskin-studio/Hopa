/**
 * routes/greeting.js
 * ------------------
 * API routes for greeting CRUD operations.
 */

'use strict';

const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { validate } = require('../middleware/validation');
const { paginateResponse, parsePagination } = require('../utils/pagination');
const greetingModel = require('../models/greeting');
const { successResponse, createdResponse } = require('../utils/responseHelper');

const router = express.Router();

/**
 * GET /api/greetings
 * List all greetings with pagination.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = parsePagination(req.query);
    const { rows, total } = await greetingModel.findAll({ limit, offset });
    const meta = require('../utils/pagination').buildPaginationMeta(page, limit, total);
    res.json(paginateResponse(rows, meta));
  })
);

/**
 * GET /api/greetings/:id
 * Get a single greeting by ID.
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const greeting = await greetingModel.findById(req.params.id);
    if (!greeting) {
      return res.status(404).json({ error: 'Not Found', message: 'Greeting not found' });
    }
    res.json(successResponse(greeting));
  })
);

/**
 * POST /api/greetings
 * Create a new greeting.
 */
router.post(
  '/',
  validate({
    body: {
      text: { type: 'string', required: true, minLength: 1, maxLength: 255 },
      language: { type: 'string', required: false, maxLength: 50 },
    },
  }),
  asyncHandler(async (req, res) => {
    const greeting = await greetingModel.create(req.body);
    res.status(201).json(createdResponse(greeting, 'Greeting created successfully'));
  })
);

/**
 * PUT /api/greetings/:id
 * Update a greeting by ID.
 */
router.put(
  '/:id',
  validate({
    body: {
      text: { type: 'string', required: false, minLength: 1, maxLength: 255 },
      language: { type: 'string', required: false, maxLength: 50 },
    },
  }),
  asyncHandler(async (req, res) => {
    const greeting = await greetingModel.update(req.params.id, req.body);
    if (!greeting) {
      return res.status(404).json({ error: 'Not Found', message: 'Greeting not found' });
    }
    res.json(successResponse(greeting, 'Greeting updated successfully'));
  })
);

/**
 * DELETE /api/greetings/:id
 * Delete a greeting by ID.
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await greetingModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Not Found', message: 'Greeting not found' });
    }
    res.json(successResponse(null, 'Greeting deleted successfully'));
  })
);

module.exports = router;
