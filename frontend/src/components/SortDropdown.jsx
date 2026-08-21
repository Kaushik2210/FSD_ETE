const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'votes', label: 'Highest votes' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort ideas"
      className="rounded-xl bg-[var(--color-surface-hi)] px-3 py-2.5 text-sm text-[var(--color-ink)] ring-1 ring-[var(--color-border)] focus:ring-[var(--color-brand-1)]"
    >
      {SORTS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
