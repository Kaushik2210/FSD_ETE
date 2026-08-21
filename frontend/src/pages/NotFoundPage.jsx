import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="font-display text-gradient animate-float text-7xl font-extrabold"
      >
        404
      </motion.div>
      <h1 className="font-display mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-dim)]">The page you are looking for does not exist or was moved.</p>
      <Link
        to="/ideas"
        className="mt-6 rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to ideas
      </Link>
    </div>
  );
}
