import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

/**
 * Hard gate: rejects the request unless a valid JWT is present and the user
 * still exists. Attaches the full user document to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('No token provided. Please log in.');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized('The user for this token no longer exists');

  req.user = user;
  next();
});

/**
 * Soft gate: identifies the caller if a token is present, but never rejects.
 * Used on public reads so the response can include per-user context such as
 * hasVoted / isOwner without forcing a login.
 */
export const identify = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch {
    // Invalid token on a public route is not an error — just stay anonymous.
  }
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`This action requires one of: ${roles.join(', ')}`));
  }
  next();
};
