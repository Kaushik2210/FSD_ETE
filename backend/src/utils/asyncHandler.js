/**
 * Express 4 does not catch rejected promises from async handlers, so every
 * async controller is wrapped in this to funnel errors into next().
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export default asyncHandler;
