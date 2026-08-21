import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchIdea, deleteIdeaApi, updateStatusApi } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import VoteButton from '../components/VoteButton.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import LifecycleTracker from '../components/LifecycleTracker.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { DOMAIN_STYLES, STATUSES } from '../utils/constants.js';

export default function IdeaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchIdea(id)
      .then(({ data }) => !cancelled && setIdea(data))
      .catch((err) => !cancelled && setError(parseApiError(err).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteIdeaApi(id);
      push('Idea deleted', 'success');
      navigate('/ideas', { replace: true });
    } catch (err) {
      push(parseApiError(err).message, 'error');
    }
  };

  const nextStatus = idea ? STATUSES[STATUSES.indexOf(idea.status) + 1] : null;

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      const { data } = await updateStatusApi(id, nextStatus);
      setIdea(data);
      push(`Status advanced to ${nextStatus}`, 'success');
    } catch (err) {
      push(parseApiError(err).message, 'error');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-1)]" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="font-display text-xl font-semibold">{error || 'Idea not found'}</h2>
        <Link to="/ideas" className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-1)] hover:underline">
          ← Back to all ideas
        </Link>
      </div>
    );
  }

  const domainStyle = DOMAIN_STYLES[idea.domain] ?? DOMAIN_STYLES.Other;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/ideas" className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-ink-dim)] hover:text-white">
        ← Back to all ideas
      </Link>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${domainStyle}`}>
            {idea.domain}
          </span>
          <BookmarkButton ideaId={idea.id} />
        </div>

        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">{idea.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--color-ink-dim)]">
          <span>by <span className="font-medium text-[var(--color-ink)]">{idea.submittedBy?.name ?? 'Unknown'}</span></span>
          <span>•</span>
          <span>{new Date(idea.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="mt-8">
          <LifecycleTracker status={idea.status} />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Problem statement</h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--color-ink)]">{idea.problemStatement}</p>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Expected impact</h2>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--color-ink)]">{idea.expectedImpact}</p>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-faint)]">Technologies</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {idea.technologies.map((tech) => (
                  <span key={tech} className="rounded-lg bg-[var(--color-surface-hi)] px-3 py-1 text-sm font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)]">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="flex flex-row items-start gap-3 sm:flex-col">
            <StatusBadge status={idea.status} />
            <VoteButton idea={idea} onChange={(data) => setIdea((prev) => ({ ...prev, ...data }))} />
          </div>
        </div>

        {(idea.isOwner || user?.role === 'reviewer') && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-6">
            {idea.isOwner && (
              <>
                <Link
                  to={`/edit/${idea.id}`}
                  className="rounded-xl bg-[var(--color-surface-hi)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:text-white"
                >
                  Edit idea
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                >
                  Delete idea
                </button>
              </>
            )}
            {user?.role === 'reviewer' && nextStatus && (
              <button
                type="button"
                onClick={handleAdvance}
                disabled={advancing}
                className="ml-auto rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-3)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {advancing ? 'Advancing...' : `Advance to "${nextStatus}"`}
              </button>
            )}
          </div>
        )}
      </motion.article>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this idea?"
        message="This will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
