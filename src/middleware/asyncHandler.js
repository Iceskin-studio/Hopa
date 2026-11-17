/**
 * Wrap an async route handler and forward errors to Express.
 *
 * @param {function(import('express').Request, import('express').Response, import('express').NextFunction): Promise<any>} fn
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction)}
 */
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
