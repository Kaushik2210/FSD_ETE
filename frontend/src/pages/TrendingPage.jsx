import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchIdeas } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import IdeaCard from '../components/IdeaCard.jsx';
import CardSkeleton from '../components/CardSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { deleteIdeaApi } from '../api/ideas.js';
import { useToast } from '../context/ToastContext.jsx';

/** Pure vote-ranked view -- the "Trending" section requested separately from the general feed's sort control. */
export default function TrendingPage() {
  const { push } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchIdeas({ sort: 'votes', limit: 12 })
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold">
          🔥 <span className="text-gradient">Trending</span> ideas
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-dim)]">The ideas the campus is rallying behind right now, ranked purely by votes.</p>
      </motion.div>

      <div className="mt-8">
        {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <EmptyState title="No ideas yet" message="Once ideas start getting votes, the hottest ones will show up here." />
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
