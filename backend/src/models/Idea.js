import mongoose from 'mongoose';

export const DOMAINS = [
  'Education',
  'Sustainability',
  'Health',
  'Technology',
  'Infrastructure',
  'Safety',
  'Other',
];

// Ordered — index position defines the lifecycle, so "advance status" is just +1.
export const STATUSES = ['Submitted', 'Under Review', 'Approved', 'Prototype', 'Implemented'];

export const MIN_PROBLEM_LENGTH = 50;

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
      minlength: [MIN_PROBLEM_LENGTH, `Problem statement must be at least ${MIN_PROBLEM_LENGTH} characters`],
      maxlength: [2000, 'Problem statement cannot exceed 2000 characters'],
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      enum: { values: DOMAINS, message: '{VALUE} is not a valid domain' },
    },
    technologies: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one technology is required',
      },
    },
    expectedImpact: {
      type: String,
      required: [true, 'Expected impact is required'],
      trim: true,
      minlength: [10, 'Expected impact must be at least 10 characters'],
      maxlength: [1000, 'Expected impact cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: '{VALUE} is not a valid status' },
      default: 'Submitted',
    },
    // Denormalised counter so we can sort by votes without an aggregation.
    // Kept in lockstep with votedBy.length by the vote controller.
    voteCount: { type: Number, default: 0, min: 0 },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index powers keyword search across title / problem / technologies.
// Weights bias matches in the title above body text.
ideaSchema.index(
  { title: 'text', problemStatement: 'text', technologies: 'text' },
  { weights: { title: 5, technologies: 3, problemStatement: 1 }, name: 'idea_search_index' }
);

// Compound indexes for the common feed queries (filter + sort).
ideaSchema.index({ domain: 1, status: 1, createdAt: -1 });
ideaSchema.index({ voteCount: -1, createdAt: -1 });

export default mongoose.model('Idea', ideaSchema);
