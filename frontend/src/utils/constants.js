// Mirrors the backend enums (backend/src/models/Idea.js). Duplicated here
// deliberately -- these are display constants (colors/labels), not the source
// of truth for validity, which the server always re-checks.
export const STATUSES = ['Submitted', 'Under Review', 'Approved', 'Prototype', 'Implemented'];

export const DOMAINS = [
  'Education',
  'Sustainability',
  'Health',
  'Technology',
  'Infrastructure',
  'Safety',
  'Other',
];

export const STATUS_STYLES = {
  Submitted: {
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    bg: 'bg-slate-400/10',
    ring: 'ring-slate-400/30',
  },
  'Under Review': {
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    bg: 'bg-amber-400/10',
    ring: 'ring-amber-400/30',
  },
  Approved: {
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-400/10',
    ring: 'ring-sky-400/30',
  },
  Prototype: {
    dot: 'bg-fuchsia-400',
    text: 'text-fuchsia-300',
    bg: 'bg-fuchsia-400/10',
    ring: 'ring-fuchsia-400/30',
  },
  Implemented: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    bg: 'bg-emerald-400/10',
    ring: 'ring-emerald-400/30',
  },
};

export const DOMAIN_STYLES = {
  Education: 'text-violet-300 bg-violet-400/10 ring-violet-400/30',
  Sustainability: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/30',
  Health: 'text-rose-300 bg-rose-400/10 ring-rose-400/30',
  Technology: 'text-cyan-300 bg-cyan-400/10 ring-cyan-400/30',
  Infrastructure: 'text-amber-300 bg-amber-400/10 ring-amber-400/30',
  Safety: 'text-red-300 bg-red-400/10 ring-red-400/30',
  Other: 'text-slate-300 bg-slate-400/10 ring-slate-400/30',
};

export const MIN_PROBLEM_LENGTH = 50;
