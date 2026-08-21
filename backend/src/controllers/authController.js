import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Whitelist what leaves the server — never spread the raw document.
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bookmarkedIdeas: user.bookmarkedIdeas ?? [],
  createdAt: user.createdAt,
});

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw ApiError.conflict('An account with that email already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false on the schema, so ask for it explicitly.
  const user = await User.findOne({ email }).select('+password');

  // Same message for "no such user" and "wrong password" so the endpoint
  // cannot be used to enumerate which emails are registered.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.status(200).json({
    success: true,
    message: 'Logged in',
    data: { user: publicUser(user), token: signToken(user) },
  });
});

/** GET /api/auth/me — lets the frontend rehydrate auth state on page reload */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: publicUser(req.user) } });
});

/** PATCH /api/auth/bookmarks/:id — toggle a bookmark on/off */
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const index = user.bookmarkedIdeas.findIndex((b) => b.toString() === id);
  const bookmarked = index === -1;

  if (bookmarked) user.bookmarkedIdeas.push(id);
  else user.bookmarkedIdeas.splice(index, 1);

  await user.save();

  res.status(200).json({
    success: true,
    message: bookmarked ? 'Idea bookmarked' : 'Bookmark removed',
    data: { bookmarked, bookmarkedIdeas: user.bookmarkedIdeas },
  });
});

export { publicUser };
