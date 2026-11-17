/**
 * models/greeting.js
 * ------------------
 * Data access layer for greetings table.
 */

'use strict';

const db = require('../db');

/**
 * Find all greetings with pagination.
 * @param {Object} options
 * @param {number} options.limit
 * @param {number} options.offset
 * @returns {Promise<{rows: Array, total: number}>}
 */
async function findAll({ limit, offset }) {
  const dataQuery = `
    SELECT id, text, language, created_at, updated_at
    FROM greetings
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const countQuery = `SELECT COUNT(*) FROM greetings`;

  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, [limit, offset]),
    db.query(countQuery),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Find a greeting by ID.
 * @param {string|number} id
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  const query = `
    SELECT id, text, language, created_at, updated_at
    FROM greetings
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Create a new greeting.
 * @param {Object} data
 * @param {string} data.text
 * @param {string} [data.language]
 * @returns {Promise<Object>}
 */
async function create({ text, language = 'ar' }) {
  const query = `
    INSERT INTO greetings (text, language)
    VALUES ($1, $2)
    RETURNING id, text, language, created_at, updated_at
  `;
  const result = await db.query(query, [text, language]);
  return result.rows[0];
}

/**
 * Update a greeting by ID.
 * @param {string|number} id
 * @param {Object} data
 * @param {string} [data.text]
 * @param {string} [data.language]
 * @returns {Promise<Object|null>}
 */
async function update(id, { text, language }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (text !== undefined) {
    fields.push(`text = $${paramIndex++}`);
    values.push(text);
  }
  if (language !== undefined) {
    fields.push(`language = $${paramIndex++}`);
    values.push(language);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE greetings
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, text, language, created_at, updated_at
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete a greeting by ID.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
async function deleteById(id) {
  const query = `DELETE FROM greetings WHERE id = $1`;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: deleteById,
};
