/**
 * Middleware that parses common product‑filter query parameters
 * and attaches a `filters` object to the request.
 *
 * Supported query params:
 *   - category: string
 *   - size: string (comma‑separated list)
 *   - color: string (comma‑separated list)
 *   - minPrice, maxPrice: numbers
 *   - q: free‑text search term
 *
 * The resulting `req.filters` shape:
 * {
 *   category?: string,
 *   sizes?: string[],
 *   colors?: string[],
 *   priceRange?: { min?: number, max?: number },
 *   search?: string
 * }
 */
export function parseProductFilters(req, res, next) {
  const { category, size, color, minPrice, maxPrice, q } = req.query;
  const filters = {};

  if (category) filters.category = String(category).trim();

  if (size) {
    filters.sizes = String(size)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (color) {
    filters.colors = String(color)
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }

  const priceRange = {};
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    if (!Number.isNaN(min)) priceRange.min = min;
  }
  if (maxPrice !== undefined) {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) priceRange.max = max;
  }
  if (Object.keys(priceRange).length) filters.priceRange = priceRange;

  if (q) filters.search = String(q).trim();

  req.filters = filters;
  next();
}
