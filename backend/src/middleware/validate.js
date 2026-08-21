import { validationResult, body, query, param } from 'express-validator';
import ApiError from '../utils/ApiError.js';
import { DOMAINS, STATUSES, MIN_PROBLEM_LENGTH } from '../models/Idea.js';

/**
 * Collapses express-validator's array of issues into the { field: message }
 * map the frontend renders inline under each input.
 */
export const runValidation = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = {};
  for (const err of result.array()) {
    if (!errors[err.path]) errors[err.path] = err.msg; // keep the first message per field
  }
  next(ApiError.badRequest('Validation failed', errors));
};

/* ---------------------------------- auth ---------------------------------- */

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
];

export const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/* ---------------------------------- ideas --------------------------------- */

// Accepts either ["React","Node"] or "React, Node" and normalises to a
// de-duplicated, trimmed array. Runs before the validators below see the value.
const normaliseTechnologies = (value) => {
  const list = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(list.map((t) => String(t).trim()).filter(Boolean))];
};

const ideaBodyRules = (isUpdate = false) => {
  const optional = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    optional(body('title').trim().notEmpty().withMessage('Title is required'))
      .isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),

    optional(body('problemStatement').trim().notEmpty().withMessage('Problem statement is required'))
      .isLength({ min: MIN_PROBLEM_LENGTH, max: 2000 })
      .withMessage(`Problem statement must be ${MIN_PROBLEM_LENGTH}-2000 characters`),

    optional(body('domain').trim().notEmpty().withMessage('Domain is required'))
      .isIn(DOMAINS).withMessage(`Domain must be one of: ${DOMAINS.join(', ')}`),

    optional(body('technologies').customSanitizer(normaliseTechnologies)
      .isArray({ min: 1 }).withMessage('Add at least one technology'))
      .custom((v) => v.every((t) => t.length <= 40))
      .withMessage('Each technology must be 40 characters or fewer'),

    optional(body('expectedImpact').trim().notEmpty().withMessage('Expected impact is required'))
      .isLength({ min: 10, max: 1000 }).withMessage('Expected impact must be 10-1000 characters'),

    // status is deliberately NOT settable here — it moves only via the
    // dedicated /status endpoint, which is role-gated.
    body('status').not().exists().withMessage('Status cannot be set directly; use PATCH /:id/status'),
  ];
};

export const createIdeaRules = ideaBodyRules(false);
export const updateIdeaRules = ideaBodyRules(true);

export const statusRules = [
  body('status').trim().notEmpty().withMessage('Status is required')
    .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
];

export const listIdeasRules = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term is too long'),
  query('domain').optional().trim().isIn([...DOMAINS, 'all', '']).withMessage('Unknown domain filter'),
  query('status').optional().trim().isIn([...STATUSES, 'all', '']).withMessage('Unknown status filter'),
  query('sort').optional().trim().isIn(['newest', 'oldest', 'votes', 'relevance'])
    .withMessage('Sort must be newest, oldest, votes or relevance'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be 1 or greater').toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50').toInt(),
];

export const objectIdRule = [param('id').isMongoId().withMessage('Invalid idea id')];
