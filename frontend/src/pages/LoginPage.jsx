import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/ideas';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.ok) {
      push('Welcome back!', 'success');
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold">
          Welcome <span className="text-gradient">back</span>
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-dim)]">Log in to vote, submit, and track your ideas.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl bg-[var(--color-surface-hi)] px-3.5 py-2.5 text-sm ring-1 ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-brand-1)]"
              placeholder="you@campus.edu"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl bg-[var(--color-surface-hi)] px-3.5 py-2.5 text-sm ring-1 ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-brand-1)]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 ring-1 ring-rose-200">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-raised w-full rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-dim)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-[var(--color-brand-1)] hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-4 rounded-xl bg-[var(--color-surface-hi)]/50 p-3 text-xs text-[var(--color-ink-faint)]">
          Demo: <span className="text-[var(--color-ink-dim)]">rohan@campus.edu</span> / <span className="text-[var(--color-ink-dim)]">Password123</span>
        </div>
      </motion.div>
    </div>
  );
}
