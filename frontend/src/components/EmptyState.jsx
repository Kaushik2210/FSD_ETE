import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center"
    >
      <div className="animate-float grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-1)]/20 to-[var(--color-brand-3)]/20 ring-1 ring-[var(--color-border)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7 text-[var(--color-brand-1)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0c-.643.643-1.343 1.317-1.343 2.657h-4.386c0-1.34-.7-2.014-1.343-2.657z" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--color-ink-dim)]">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="btn-raised mt-2 rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
