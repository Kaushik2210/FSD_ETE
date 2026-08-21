/**
 * Operational error with an HTTP status attached. Anything thrown that is NOT
 * an ApiError is treated as a programming bug by the error handler and reported
 * as a generic 500 (details logged, never leaked to the client).
 */
export default class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors) { return new ApiError(400, message, errors); }
  static unauthorized(message = 'Not authenticated') { return new ApiError(401, message); }
  static forbidden(message = 'Not authorized to perform this action') { return new ApiError(403, message); }
  static notFound(message = 'Resource not found') { return new ApiError(404, message); }
  static conflict(message) { return new ApiError(409, message); }
}
