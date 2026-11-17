/**
 * utils/pagination.js
 * -------------------
 * Pagination helper utilities for consistent API responses.
 */

'use strict';

/**
 * Build pagination metadata.
 * @param {number} page - Current page (1-indexed).
 * @param {number} limit - Items per page.
 * @param {number} total - Total number of items.
 * @returns {Object} Pagination metadata.
 */
function buildPaginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  };
}

/**
 * Parse and validate pagination query parameters.
 * @param {Object} query - Express req.query object.
 * @param {Object} [options] - Options.
 * @param {number} [options.defaultLimit=20] - Default items per page.
 * @param {number} [options.maxLimit=100] - Maximum allowed limit.
 * @returns {{ page: number, limit: number, offset: number }}
 */
function parsePagination(query, options = {}) {
  const defaultLimit = options.defaultLimit ?? 20;
  const maxLimit = options.maxLimit ?? 100;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create a paginated response envelope.
 * @param {Array} data - Array of items for current page.
 * @param {Object} meta - Pagination metadata from buildPaginationMeta.
 * @returns {Object} Standardized paginated response.
 */
function paginateResponse(data, meta) {
  return {
    data,
    meta: {
      pagination: meta,
    },
  };
}

module.exports = {
  buildPaginationMeta,
  parsePagination,
  paginateResponse,
};
