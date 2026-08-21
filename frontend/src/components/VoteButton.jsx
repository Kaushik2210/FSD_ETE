import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voteIdeaApi, unvoteIdeaApi } from '../api/ideas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { parseApiError } from '../utils/apiError.js';

/**
 * Optimistic vote toggle: flips the UI immediately, then reconciles with the
 * server response. On failure it rolls back so the count never drifts from
 * what the backend actually has (the backend is the source of truth for
 * duplicate-vote prevention -- this is a UX layer on top of it).
 */
export default function VoteButton({ idea, onChange, size = 'md' }) {
  const { isAuthenticated } = useAuth();
  const { push } = useToast();
  const [voteCount, setVoteCount] = useState(idea.voteCount);
  const [hasVoted, setHasVoted] = useState(idea.hasVoted);
  const [busy, setBusy] = useState(false);
  const [justVoted, setJustVoted] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      push('Log in to vote for an idea', 'info');
      return;
    }
    if (busy) return;

    const prevCount = voteCount;
    const prevVoted = hasVoted;
    const nextVoted = !prevVoted;

    setBusy(true);
    setHasVoted(nextVoted);
    setVoteCount(prevCount + (nextVoted ? 1 : -1));
    if (nextVoted) {
      setJustVoted(true);
      setTimeout(() => setJustVoted(false), 400);
    }

    try {
      const { data } = nextVoted ? await voteIdeaApi(idea.id) : await unvoteIdeaApi(idea.id);
      setVoteCount(data.voteCount);
      setHasVoted(data.hasVoted);
      onChange?.(data);
    } catch (error) {
      setHasVoted(prevVoted);
      setVoteCount(prevCount);
      push(parseApiError(error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const sizing = size === 'sm' ? 'px-2.5 py-1.5 text-xs gap-1' : 'px-3.5 py-2 text-sm gap-1.5';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={hasVoted}
      className={`relative flex items-center rounded-full font-semibold ring-1 transition-colors ${sizing} ${
        hasVoted
          ? 'bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] text-white ring-transparent'
          : 'bg-[var(--color-surface-hi)] text-[var(--color-ink-dim)] ring-[var(--color-border)] hover:text-[var(--color-ink)] hover:ring-[var(--color-brand-1)]/50'
      } disabled:opacity-70`}
    >
      <motion.svg
        animate={justVoted ? { scale: [1, 1.5, 1], rotate: [0, -15, 0] } : {}}
        transition={{ duration: 0.4 }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z"
          clipRule="evenodd"
        />
      </motion.svg>
      <span className="relative inline-grid place-items-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={voteCount}
            initial={{ y: justVoted ? 10 : 0, opacity: justVoted ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {voteCount}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
