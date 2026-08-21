import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const validate = (form) => {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    errors.password = 'Password needs at least one letter and one number';
  if (form.confirm !== form.password) errors.confirm = 'Passwords do not match';
  return errors;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
        placeholder={placeholder}
        className={`w-full rounded-xl bg-[var(--color-surface-hi)] px-3.5 py-2.5 text-sm ring-1 focus:ring-2 ${
          touched[name] && errors[name] ? 'ring-rose-400/60 focus:ring-rose-400' : 'ring-[var(--color-border)] focus:ring-[var(--color-brand-1)]'
        }`}
      />
      {touched[name] && errors[name] && <p className="mt-1.5 text-xs text-rose-300">{errors[name]}</p>}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;

    setServerError('');
    setSubmitting(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setSubmitting(false);

    if (result.ok) {
      push('Account created — welcome!', 'success');
      navigate('/ideas', { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold">
          Join the <span className="text-gradient">Hub</span>
        </h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-dim)]">Create an account to submit ideas and vote.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {field('name', 'Full name', 'text', 'Ada Lovelace')}
          {field('email', 'Email', 'email', 'you@campus.edu')}
          {field('password', 'Password', 'password', 'At least 8 characters')}
          {field('confirm', 'Confirm password', 'password', 'Repeat your password')}

          {serverError && <p className="rounded-lg bg-rose-500/10 p-2.5 text-xs text-rose-300 ring-1 ring-rose-500/30">{serverError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-dim)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-brand-1)] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
