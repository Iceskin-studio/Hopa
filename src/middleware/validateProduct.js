/**
 * Validates product payload for create / update.
 * Required fields: title, description, price, category, stock.
 * Optional: size, color, image_url.
 */

import { error } from '../utils/response.js';

export function validateProduct(req, res, next) {
  const {
    title,
    description,
    price,
    category,
    stock,
    size,
    color,
    image_url,
  } = req.body;

  if (
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    typeof category !== 'string' ||
    typeof price !== 'number' ||
    typeof stock !== 'number'
  ) {
    return res.status(400).json(error('Invalid product payload'));
  }

  // optional fields validation
  if (size && typeof size !== 'string') {
    return res.status(400).json(error('Invalid size field'));
  }
  if (color && typeof color !== 'string') {
    return res.status(400).json(error('Invalid color field'));
  }
  if (image_url && typeof image_url !== 'string') {
    return res.status(400).json(error('Invalid image_url field'));
  }

  next();
}
