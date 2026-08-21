import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import IdeaForm from '../components/IdeaForm.jsx';
import { fetchIdea, updateIdeaApi } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function EditIdeaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchIdea(id)
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.isOwner && user?.role !== 'reviewer') {
          setLoadError('You can only edit ideas you submitted.');
        } else {
          setIdea(data);
        }
      })
      .catch((err) => !cancelled && setLoadError(parseApiError(err).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleSubmit = async (values) => {
    setServerErrors({});
    try {
      await updateIdeaApi(id, values);
      push('Idea updated', 'success');
      navigate(`/ideas/${id}`);
    } catch (err) {
      const { message, errors } = parseApiError(err);
      setServerErrors(errors || { _form: message });
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-1)]" />
      </div>
    );
  }

  if (loadError || !idea) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="font-display text-xl font-semibold">{loadError || 'Idea not found'}</h2>
        <Link to="/ideas" className="mt-4 inline-block text-sm font-medium text-[var(--color-brand-1)] hover:underline">
          ← Back to all ideas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Edit <span className="text-gradient">idea</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-dim)]">Update the details below and save your changes.</p>
      </motion.div>

      <IdeaForm initialValues={idea} submitLabel="Save changes" onSubmit={handleSubmit} serverErrors={serverErrors} />
    </div>
  );
}
