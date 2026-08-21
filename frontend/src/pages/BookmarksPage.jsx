import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchBookmarked } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import IdeaCard from '../components/IdeaCard.jsx';
import CardSkeleton from '../components/CardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { deleteIdeaApi } from '../api/ideas.js';
import { useToast } from '../context/ToastContext.jsx';

export default function BookmarksPage() {
  const { push } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchBookmarked()
      .then(({ data }) => setIdeas(data))
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteIdeaApi(pendingDelete.id);
      setIdeas((prev) => prev.filter((i) => i.id !== pendingDelete.id));
      push('Idea deleted', 'success');
    } catch (err) {
      push(parseApiError(err).message, 'error');
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">
        My <span className="text-gradient">bookmarks</span>
      </motion.h1>
      <p className="mt-2 text-sm text-[var(--color-ink-dim)]">Ideas you have saved for later.</p>

      <div className="mt-8">
        {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <EmptyState
            title="No bookmarks yet"
            message="Tap the bookmark icon on any idea to save it here for quick access later."
            actionLabel="Browse ideas"
            actionTo="/ideas"
          />
        )}

        {!loading && !error && ideas.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onDelete={setPendingDelete} />
            ))}
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this idea?"
        message={`"${pendingDelete?.title ?? ''}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
