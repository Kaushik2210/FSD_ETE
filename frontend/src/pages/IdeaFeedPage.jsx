import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import IdeaFeed from '../components/IdeaFeed.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function IdeaFeedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Explore <span className="text-gradient">campus ideas</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-ink-dim)] sm:text-base">
            Browse student-submitted solutions to real problems, vote for the ones you believe in, and watch them
            move from idea to implementation.
          </p>
        </div>
        <Link
          to={isAuthenticated ? '/submit' : '/login'}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          + Submit an idea
        </Link>
      </motion.div>

      <IdeaFeed />
    </div>
  );
}
