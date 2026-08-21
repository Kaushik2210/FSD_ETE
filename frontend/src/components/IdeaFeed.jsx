import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { fetchIdeas, deleteIdeaApi } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import { useToast } from '../context/ToastContext.jsx';
import IdeaCard from './IdeaCard.jsx';
import IdeaControls from './IdeaControls.jsx';
import CardSkeleton from './CardSkeleton.jsx';
import Pagination from './Pagination.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import EmptyState from './EmptyState.jsx';

const DEFAULTS = { search: '', domain: 'all', status: 'all', sort: 'newest', page: 1 };

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function IdeaFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { push } = useToast();

  const filters = {
    search: searchParams.get('search') ?? DEFAULTS.search,
    domain: searchParams.get('domain') ?? DEFAULTS.domain,
    status: searchParams.get('status') ?? DEFAULTS.status,
    sort: searchParams.get('sort') ?? DEFAULTS.sort,
    page: Number(searchParams.get('page') ?? DEFAULTS.page),
  };

  const [ideas, setIdeas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const applyFilters = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      const merged = { ...filters, ...patch };
      // Any real filter change resets pagination back to page 1.
      if (Object.keys(patch).some((k) => k !== 'page')) merged.page = 1;

      Object.entries(merged).forEach(([key, value]) => {
        const isDefault = String(value) === String(DEFAULTS[key]);
        if (!value || isDefault) next.delete(key);
        else next.set(key, value);
      });
      setSearchParams(next, { replace: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchIdeas({
      search: filters.search || undefined,
      domain: filters.domain,
      status: filters.status,
      sort: filters.sort,
      page: filters.page,
      limit: 9,
    })
      .then(({ data, meta }) => {
        if (cancelled) return;
        setIdeas(data);
        setMeta(meta);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(parseApiError(err).message);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.domain, filters.status, filters.sort, filters.page]);

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
    <div>
      <IdeaControls filters={filters} onChange={applyFilters} />

      <div className="mt-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>
        )}

        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && ideas.length === 0 && (
          <EmptyState
            title="No ideas match those filters"
            message="Try a broader search or clear a filter to see more ideas."
          />
        )}

        {!loading && !error && ideas.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filters.search}-${filters.domain}-${filters.status}-${filters.sort}-${filters.page}`}
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} onDelete={setPendingDelete} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={(page) => applyFilters({ page })} />}
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
