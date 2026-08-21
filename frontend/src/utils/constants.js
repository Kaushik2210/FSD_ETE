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

// Light-mode badge palette: pastel tint background, a text shade dark enough
// to clear 4.5:1 contrast on that tint, and a soft matching ring.
export const STATUS_STYLES = {
  Submitted: {
    dot: 'bg-slate-500',
    text: 'text-slate-700',
    bg: 'bg-slate-100',
    ring: 'ring-slate-300',
  },
  'Under Review': {
    dot: 'bg-amber-500',
    text: 'text-amber-800',
    bg: 'bg-amber-100',
    ring: 'ring-amber-300',
  },
  Approved: {
    dot: 'bg-sky-500',
    text: 'text-sky-800',
    bg: 'bg-sky-100',
    ring: 'ring-sky-300',
  },
  Prototype: {
    dot: 'bg-fuchsia-500',
    text: 'text-fuchsia-800',
    bg: 'bg-fuchsia-100',
    ring: 'ring-fuchsia-300',
  },
  Implemented: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-800',
    bg: 'bg-emerald-100',
    ring: 'ring-emerald-300',
  },
};

export const DOMAIN_STYLES = {
  Education: 'text-violet-800 bg-violet-100 ring-violet-300',
  Sustainability: 'text-emerald-800 bg-emerald-100 ring-emerald-300',
  Health: 'text-rose-800 bg-rose-100 ring-rose-300',
  Technology: 'text-cyan-800 bg-cyan-100 ring-cyan-300',
  Infrastructure: 'text-amber-800 bg-amber-100 ring-amber-300',
  Safety: 'text-red-800 bg-red-100 ring-red-300',
  Other: 'text-slate-700 bg-slate-100 ring-slate-300',
};

// Hex equivalents of the STATUS_STYLES / DOMAIN_STYLES dot colors, for use in
// chart fills (SVG/recharts) where a Tailwind class string cannot apply.
export const STATUS_HEX = {
  Submitted: '#64748b',
  'Under Review': '#f59e0b',
  Approved: '#0ea5e9',
  Prototype: '#d946ef',
  Implemented: '#10b981',
};

export const DOMAIN_HEX = {
  Education: '#8b5cf6',
  Sustainability: '#10b981',
  Health: '#f43f5e',
  Technology: '#06b6d4',
  Infrastructure: '#f59e0b',
  Safety: '#ef4444',
  Other: '#64748b',
};

export const MIN_PROBLEM_LENGTH = 50;
