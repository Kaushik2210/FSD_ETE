import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DOMAINS, MIN_PROBLEM_LENGTH } from '../utils/constants.js';

const EMPTY = { title: '', problemStatement: '', domain: '', technologies: [], expectedImpact: '' };

const validate = (values) => {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
  else if (values.title.trim().length > 120) errors.title = 'Title cannot exceed 120 characters';

  if (!values.problemStatement.trim()) errors.problemStatement = 'Problem statement is required';
  else if (values.problemStatement.trim().length < MIN_PROBLEM_LENGTH)
    errors.problemStatement = `Add at least ${MIN_PROBLEM_LENGTH - values.problemStatement.trim().length} more characters`;

  if (!values.domain) errors.domain = 'Choose a domain';

  if (values.technologies.length === 0) errors.technologies = 'Add at least one technology';

  if (!values.expectedImpact.trim()) errors.expectedImpact = 'Expected impact is required';
  else if (values.expectedImpact.trim().length < 10) errors.expectedImpact = 'Describe the impact in a bit more detail';

  return errors;
};

const fieldClass = (hasError) =>
  `w-full rounded-xl bg-[var(--color-surface-hi)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] ring-1 transition-colors placeholder:text-[var(--color-ink-faint)] focus:ring-2 ${
    hasError ? 'ring-rose-300 focus:ring-rose-400' : 'ring-[var(--color-border)] focus:ring-[var(--color-brand-1)]'
  }`;

const FieldError = ({ message }) =>
  message ? (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-rose-700">
      {message}
    </motion.p>
  ) : null;

export default function IdeaForm({ initialValues = EMPTY, submitLabel = 'Submit idea', onSubmit, serverErrors = {} }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValues });
  const [touched, setTouched] = useState({});
  const [techDraft, setTechDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clientErrors = useMemo(() => validate(values), [values]);
  const errors = { ...clientErrors, ...serverErrors };
  const isValid = Object.keys(clientErrors).length === 0;

  const setField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const addTech = (raw) => {
    const items = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !values.technologies.includes(t));
    if (items.length) setField('technologies', [...values.technologies, ...items]);
    setTechDraft('');
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTech(techDraft);
    } else if (e.key === 'Backspace' && !techDraft && values.technologies.length) {
      setField('technologies', values.technologies.slice(0, -1));
    }
  };

  const removeTech = (tech) => setField('technologies', values.technologies.filter((t) => t !== tech));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, problemStatement: true, domain: true, technologies: true, expectedImpact: true });
    if (!isValid) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = values.problemStatement.trim().length;

  return (
    <form onSubmit={handleSubmit} className="glass space-y-6 rounded-2xl p-6 sm:p-8" noValidate>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => setField('title', e.target.value)}
          onBlur={() => markTouched('title')}
          placeholder="e.g. Smart Canteen Queue Predictor"
          className={fieldClass(touched.title && errors.title)}
        />
        {touched.title && <FieldError message={errors.title} />}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--color-ink)]" htmlFor="problemStatement">
            Problem statement
          </label>
          <span className={`text-xs ${charCount < MIN_PROBLEM_LENGTH ? 'text-[var(--color-ink-faint)]' : 'text-emerald-600'}`}>
            {charCount}/{MIN_PROBLEM_LENGTH}+ characters
          </span>
        </div>
        <textarea
          id="problemStatement"
          value={values.problemStatement}
          onChange={(e) => setField('problemStatement', e.target.value)}
          onBlur={() => markTouched('problemStatement')}
          rows={5}
          placeholder="Describe the real problem on campus this idea solves, who it affects, and why it matters..."
          className={fieldClass(touched.problemStatement && errors.problemStatement)}
        />
        {touched.problemStatement && <FieldError message={errors.problemStatement} />}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="domain">
            Domain
          </label>
          <select
            id="domain"
            value={values.domain}
            onChange={(e) => setField('domain', e.target.value)}
            onBlur={() => markTouched('domain')}
            className={fieldClass(touched.domain && errors.domain)}
          >
            <option value="" disabled>
              Choose a domain
            </option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {touched.domain && <FieldError message={errors.domain} />}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="tech">
            Technologies
          </label>
          <div
            className={`flex flex-wrap items-center gap-1.5 rounded-xl bg-[var(--color-surface-hi)] p-2 ring-1 focus-within:ring-2 ${
              touched.technologies && errors.technologies ? 'ring-rose-300' : 'ring-[var(--color-border)] focus-within:ring-[var(--color-brand-1)]'
            }`}
          >
            {values.technologies.map((tech) => (
              <span key={tech} className="flex items-center gap-1 rounded-md bg-[var(--color-brand-1)]/15 px-2 py-1 text-xs font-medium text-[var(--color-brand-1)]">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} className="text-[var(--color-brand-1)]/70 hover:text-[var(--color-ink)]" aria-label={`Remove ${tech}`}>
                  ×
                </button>
              </span>
            ))}
            <input
              id="tech"
              value={techDraft}
              onChange={(e) => setTechDraft(e.target.value)}
              onKeyDown={handleTechKeyDown}
              onBlur={() => {
                addTech(techDraft);
                markTouched('technologies');
              }}
              placeholder={values.technologies.length ? '' : 'React, Node.js, MongoDB...'}
              className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
            />
          </div>
          {touched.technologies && <FieldError message={errors.technologies} />}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="expectedImpact">
          Expected impact
        </label>
        <textarea
          id="expectedImpact"
          value={values.expectedImpact}
          onChange={(e) => setField('expectedImpact', e.target.value)}
          onBlur={() => markTouched('expectedImpact')}
          rows={3}
          placeholder="Who benefits, and how? Quantify it if you can (e.g. saves 200 students 10 minutes a day)."
          className={fieldClass(touched.expectedImpact && errors.expectedImpact)}
        />
        {touched.expectedImpact && <FieldError message={errors.expectedImpact} />}
      </div>

      {serverErrors._form && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{serverErrors._form}</div>
      )}

      <motion.button
        type="submit"
        disabled={submitting || !isValid}
        whileTap={{ scale: 0.98 }}
        className="btn-raised w-full rounded-xl bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? 'Saving...' : submitLabel}
      </motion.button>
      {!isValid && Object.keys(touched).length > 0 && (
        <p className="-mt-3 text-center text-xs text-[var(--color-ink-faint)]">
          Fill in every field correctly to enable this button.
        </p>
      )}
    </form>
  );
}
