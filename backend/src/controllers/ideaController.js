import Idea, { DOMAINS, STATUSES } from '../models/Idea.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Shapes an idea for the client and folds in per-request context.
 * votedBy is a list of user ids -- it is never sent to the client (privacy +
 * payload size); instead we send the single boolean the UI actually needs.
 */
const serialize = (idea, user) => {
  const obj = idea.toObject ? idea.toObject() : idea;
  const { votedBy = [], ...rest } = obj;
  const uid = user?._id?.toString();

  return {
    ...rest,
    id: obj._id.toString(),
    hasVoted: Boolean(uid && votedBy.some((v) => v.toString() === uid)),
    isOwner: Boolean(uid && (obj.submittedBy?._id ?? obj.submittedBy)?.toString() === uid),
  };
};

/** Throws unless the caller owns the idea (reviewers bypass ownership). */
const assertCanModify = (idea, user) => {
  const ownerId = (idea.submittedBy?._id ?? idea.submittedBy).toString();
  if (ownerId !== user._id.toString() && user.role !== 'reviewer') {
    throw ApiError.forbidden('You can only modify ideas you submitted');
  }
};

// User input goes into a RegExp -- escape it so "c++" or "a.b" cannot blow up
// or turn into an unintended pattern.
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/ideas
 * Query: search, domain, status, technology, sort, page, limit
 */
export const listIdeas = asyncHandler(async (req, res) => {
  const { search, domain, status, technology, sort = 'newest' } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;

  const filter = {};
  if (domain && domain !== 'all') filter.domain = domain;
  if (status && status !== 'all') filter.status = status;
  // Technology filter is a separate axis from the keyword search so the two
  // can be combined (e.g. domain Sustainability + technology React + a keyword).
  if (technology) filter.technologies = { $regex: `^${escapeRegex(technology)}$`, $options: 'i' };

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { problemStatement: rx }, { technologies: rx }];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    votes: { voteCount: -1, createdAt: -1 }, // createdAt breaks ties deterministically
    relevance: { voteCount: -1, updatedAt: -1 },
  };

  const [ideas, total] = await Promise.all([
    Idea.find(filter)
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('submittedBy', 'name email')
      .lean({ virtuals: false }),
    Idea.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  res.status(200).json({
    success: true,
    data: ideas.map((i) => serialize(i, req.user)),
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

/** GET /api/ideas/:id */
export const getIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findById(req.params.id).populate('submittedBy', 'name email');
  if (!idea) throw ApiError.notFound('Idea not found');
  res.status(200).json({ success: true, data: serialize(idea, req.user) });
});

/** POST /api/ideas */
export const createIdea = asyncHandler(async (req, res) => {
  const { title, problemStatement, domain, technologies, expectedImpact } = req.body;

  const idea = await Idea.create({
    title,
    problemStatement,
    domain,
    technologies,
    expectedImpact,
    submittedBy: req.user._id,
  });

  await idea.populate('submittedBy', 'name email');

  res.status(201).json({ success: true, message: 'Idea submitted', data: serialize(idea, req.user) });
});

/** PUT /api/ideas/:id -- owner only */
export const updateIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) throw ApiError.notFound('Idea not found');
  assertCanModify(idea, req.user);

  // Explicit whitelist: keeps voteCount/votedBy/submittedBy/status out of reach
  // of a crafted request body.
  for (const field of ['title', 'problemStatement', 'domain', 'technologies', 'expectedImpact']) {
    if (req.body[field] !== undefined) idea[field] = req.body[field];
  }

  await idea.save(); // .save() (not findByIdAndUpdate) so schema validators run
  await idea.populate('submittedBy', 'name email');

  res.status(200).json({ success: true, message: 'Idea updated', data: serialize(idea, req.user) });
});

/** DELETE /api/ideas/:id -- owner only */
export const deleteIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findById(req.params.id);
  if (!idea) throw ApiError.notFound('Idea not found');
  assertCanModify(idea, req.user);

  await idea.deleteOne();

  res.status(200).json({ success: true, message: 'Idea deleted', data: { id: req.params.id } });
});

/**
 * PATCH /api/ideas/:id/vote
 * One vote per user per idea. The duplicate check is done inside the update
 * filter ($ne on votedBy) rather than read-then-write, so two simultaneous
 * requests from the same user cannot both pass the check.
 */
export const voteIdea = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const idea = await Idea.findOneAndUpdate(
    { _id: req.params.id, votedBy: { $ne: userId } },
    { $addToSet: { votedBy: userId }, $inc: { voteCount: 1 } },
    { new: true }
  ).populate('submittedBy', 'name email');

  if (!idea) {
    // Either the idea does not exist, or this user already voted -- disambiguate.
    const exists = await Idea.findById(req.params.id).select('_id voteCount');
    if (!exists) throw ApiError.notFound('Idea not found');
    throw ApiError.conflict('You have already voted for this idea');
  }

  res.status(200).json({
    success: true,
    message: 'Vote recorded',
    data: { id: idea._id, voteCount: idea.voteCount, hasVoted: true },
  });
});

/** DELETE /api/ideas/:id/vote -- undo a vote */
export const unvoteIdea = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const idea = await Idea.findOneAndUpdate(
    { _id: req.params.id, votedBy: userId },
    { $pull: { votedBy: userId }, $inc: { voteCount: -1 } },
    { new: true }
  );

  if (!idea) {
    const exists = await Idea.exists({ _id: req.params.id });
    if (!exists) throw ApiError.notFound('Idea not found');
    throw ApiError.conflict('You have not voted for this idea');
  }

  res.status(200).json({
    success: true,
    message: 'Vote removed',
    data: { id: idea._id, voteCount: idea.voteCount, hasVoted: false },
  });
});

/** PATCH /api/ideas/:id/status -- reviewer role only */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const idea = await Idea.findById(req.params.id);
  if (!idea) throw ApiError.notFound('Idea not found');

  // The lifecycle is a forward pipeline; block arbitrary jumps backwards so the
  // stage history stays meaningful.
  if (STATUSES.indexOf(status) < STATUSES.indexOf(idea.status)) {
    throw ApiError.badRequest(`Cannot move an idea backwards from ${idea.status} to ${status}`);
  }

  idea.status = status;
  await idea.save();
  await idea.populate('submittedBy', 'name email');

  res.status(200).json({ success: true, message: `Status set to ${status}`, data: serialize(idea, req.user) });
});

/** GET /api/ideas/meta/stats -- powers the dashboard cards */
export const getStats = asyncHandler(async (req, res) => {
  const [total, byStatus, byDomain, topVoted, totalVotesAgg] = await Promise.all([
    Idea.countDocuments(),
    Idea.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Idea.aggregate([{ $group: { _id: '$domain', count: { $sum: 1 } } }]),
    Idea.find().sort({ voteCount: -1, createdAt: -1 }).limit(5)
      .populate('submittedBy', 'name').lean(),
    Idea.aggregate([{ $group: { _id: null, votes: { $sum: '$voteCount' } } }]),
  ]);

  // Aggregations omit zero-count buckets; backfill so the UI always renders
  // every stage/domain and the chart bars stay in a stable order.
  const fill = (rows, keys) =>
    keys.map((key) => ({ key, count: rows.find((r) => r._id === key)?.count ?? 0 }));

  res.status(200).json({
    success: true,
    data: {
      totalIdeas: total,
      totalVotes: totalVotesAgg[0]?.votes ?? 0,
      byStatus: fill(byStatus, STATUSES),
      byDomain: fill(byDomain, DOMAINS),
      topVoted: topVoted.map((i) => serialize(i, req.user)),
    },
  });
});

/** GET /api/ideas/meta/bookmarks -- the current user's saved ideas */
export const getBookmarked = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({ _id: { $in: req.user.bookmarkedIdeas } })
    .sort({ createdAt: -1 })
    .populate('submittedBy', 'name email')
    .lean();

  res.status(200).json({ success: true, data: ideas.map((i) => serialize(i, req.user)) });
});

/** GET /api/ideas/meta/mine -- ideas submitted by the current user */
export const getMyIdeas = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({ submittedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate('submittedBy', 'name email')
    .lean();

  res.status(200).json({ success: true, data: ideas.map((i) => serialize(i, req.user)) });
});

/** GET /api/ideas/meta/options -- enum values, so the UI never hardcodes them */
export const getOptions = (req, res) => {
  res.status(200).json({ success: true, data: { domains: DOMAINS, statuses: STATUSES } });
};

export { serialize };
