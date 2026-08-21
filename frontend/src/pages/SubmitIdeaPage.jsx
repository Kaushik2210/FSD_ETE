import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import IdeaForm from '../components/IdeaForm.jsx';
import { createIdeaApi } from '../api/ideas.js';
import { parseApiError } from '../utils/apiError.js';
import { useToast } from '../context/ToastContext.jsx';

export default function SubmitIdeaPage() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (values) => {
    setServerErrors({});
    try {
      const { data } = await createIdeaApi(values);
      push('Idea submitted successfully!', 'success');
      navigate(`/ideas/${data.id}`);
    } catch (err) {
      const { message, errors } = parseApiError(err);
      setServerErrors(errors || { _form: message });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Submit a new <span className="text-gradient">idea</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
          Describe a real problem you have seen on campus and how your idea solves it.
        </p>
      </motion.div>

      <IdeaForm submitLabel="Submit idea" onSubmit={handleSubmit} serverErrors={serverErrors} />
    </div>
  );
}
