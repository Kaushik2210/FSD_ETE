import { DOMAINS, STATUSES } from '../utils/constants.js';

const selectClass =
  'rounded-xl bg-[var(--color-surface-hi)] px-3 py-2.5 text-sm text-[var(--color-ink)] ring-1 ring-[var(--color-border)] focus:ring-[var(--color-brand-1)]';

/** Combines the domain + status filters -- the two axes the spec asks to be combinable. */
export default function FilterPanel({ domain, status, onDomainChange, onStatusChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <select value={domain} onChange={(e) => onDomainChange(e.target.value)} className={selectClass} aria-label="Filter by domain">
        <option value="all">All domains</option>
        {DOMAINS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={selectClass} aria-label="Filter by status">
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
