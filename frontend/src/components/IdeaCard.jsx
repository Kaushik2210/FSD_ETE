import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpotlightCard from './SpotlightCard.jsx';
import TiltCard from './TiltCard.jsx';
import StatusBadge from './StatusBadge.jsx';
import VoteButton from './VoteButton.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import { DOMAIN_STYLES } from '../utils/constants.js';

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of units) {
    const n = Math.floor(diff / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

/**
 * The whole card navigates to the idea's detail page, but it also hosts real
 * buttons (vote, bookmark, edit, delete) -- nesting those inside an <a> is
 * invalid HTML and breaks click handling. Instead we use the "stretched
 * link" pattern: an absolutely-positioned Link fills the card and catches
 * clicks on empty space, while interactive controls sit in their own
 * stacking context (via `relative`) so they render above it and keep their
 * own click behaviour.
 */
export default function IdeaCard({ idea, onDelete }) {
  const domainStyle = DOMAIN_STYLES[idea.domain] ?? DOMAIN_STYLES.Other;

  return (
    <motion.div variants={cardVariants} layout>
      <TiltCard maxTilt={7}>
      <SpotlightCard className="glass flex h-full flex-col p-5 shadow-xl shadow-[var(--color-ink)]/5 transition-shadow duration-300 hover:shadow-2xl hover:shadow-[var(--color-brand-1)]/15">
        <Link to={`/ideas/${idea.id}`} className="absolute inset-0" aria-label={idea.title} />

        <div className="relative flex items-start justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${domainStyle}`}>
            {idea.domain}
          </span>
          <BookmarkButton ideaId={idea.id} size="sm" />
        </div>

        <h3 className="font-display pointer-events-none relative mt-3 line-clamp-2 text-lg font-semibold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-brand-1)]">
          {idea.title}
        </h3>

        <p className="pointer-events-none relative mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--color-ink-dim)]">
          {idea.problemStatement}
        </p>

        <div className="pointer-events-none relative mt-4 flex flex-wrap gap-1.5">
          {idea.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-[var(--color-surface-hi)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)]"
            >
              {tech}
            </span>
          ))}
          {idea.technologies.length > 4 && (
            <span className="rounded-md px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-faint)]">
              +{idea.technologies.length - 4}
            </span>
          )}
        </div>

        <div className="relative mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <div className="pointer-events-none flex items-center gap-2">
            <StatusBadge status={idea.status} size="sm" />
          </div>
          <VoteButton idea={idea} size="sm" />
        </div>

        <div className="pointer-events-none relative mt-3 flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]">
          <span>by {idea.submittedBy?.name ?? 'Unknown'}</span>
          <span>{timeAgo(idea.createdAt)}</span>
        </div>

        {idea.isOwner && (
          <div className="relative mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
            <Link
              to={`/edit/${idea.id}`}
              className="flex-1 rounded-lg bg-[var(--color-surface-hi)] py-1.5 text-center text-xs font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] transition-colors hover:text-[var(--color-ink)]"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(idea);
              }}
              className="flex-1 rounded-lg bg-rose-50 py-1.5 text-center text-xs font-medium text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
            >
              Delete
            </button>
          </div>
        )}
      </SpotlightCard>
      </TiltCard>
    </motion.div>
  );
}
