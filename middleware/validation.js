/**
 * middleware/validation.js
 * ------------------------
 * Joi-based request validation middleware factory.
 * Updated to use the centralized response helper for consistent error payloads.
 */

'use strict';

const Joi = require('joi');
const { logger } = require('../utils/logger');
const { sendError } = require('../utils/responseHelper');

/**
 * Generic validation middleware.
 * @param {Joi.Schema} schema - Joi schema to validate against.
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params').
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      logger.warn({ details, path: req.path, method: req.method }, 'Validation failed');

      // Use standardized error response
      return sendError(
        res,
        {
          error: 'ValidationError',
          message: 'Invalid request data',
          details,
        },
        400
      );
    }

    // Replace the validated data (with conversions & stripped unknowns)
    req[source] = value;
    next();
  };
}

// --- Pre-defined schemas ---

const createGreetingSchema = Joi.object({
  text: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Greeting text is required',
    'string.max': 'Greeting text must be at most 200 characters',
  }),
  language: Joi.string().length(2).lowercase().pattern(/^[a-z]{2}$/).default('ar').messages({
    'string.length': 'Language must be a 2-letter code (e.g., "ar", "en")',
    'string.pattern.base': 'Language must be a 2-letter code (e.g., "ar", "en")',
  }),
});

const updateGreetingSchema = Joi.object({
  text: Joi.string().trim().min(1).max(200),
  language: Joi.string().length(2).lowercase().pattern(/^[a-z]{2}$/),
}).min(1).messages({
  'object.min': 'At least one field (text or language) must be provided',
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be positive',
  }),
});

const listQuerySchema = Joi.object({
  language: Joi.string().length(2).lowercase().pattern(/^[a-z]{2}$/),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  validate,
  schemas: {
    createGreeting: createGreetingSchema,
    updateGreeting: updateGreetingSchema,
    idParam: idParamSchema,
    listQuery: listQuerySchema,
  },
};
