import { motion } from 'framer-motion';
import { useBookmarks } from '../hooks/useBookmarks.js';

export default function BookmarkButton({ ideaId, size = 'md' }) {
  const { isBookmarked, toggle } = useBookmarks();
  const active = isBookmarked(ideaId);
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(ideaId);
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove bookmark' : 'Bookmark this idea'}
      title={active ? 'Remove bookmark' : 'Bookmark this idea'}
      className={`grid ${dim} shrink-0 place-items-center rounded-full ring-1 transition-colors ${
        active
          ? 'bg-amber-400/15 text-amber-300 ring-amber-400/40'
          : 'bg-[var(--color-surface-hi)] text-[var(--color-ink-dim)] ring-[var(--color-border)] hover:text-amber-300'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3.5a1.5 1.5 0 011.5-1.5h7A1.5 1.5 0 0115 3.5V17l-5-3-5 3V3.5z" />
      </svg>
    </motion.button>
  );
}
