const range = (page, totalPages) => {
  const items = [];
  const push = (v) => items.push(v);
  const window = 1;

  push(1);
  if (page - window > 2) push('...');
  for (let p = Math.max(2, page - window); p <= Math.min(totalPages - 1, page + window); p++) push(p);
  if (page + window < totalPages - 1) push('...');
  if (totalPages > 1) push(totalPages);

  return items;
};

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] transition-colors hover:text-white disabled:opacity-30"
        aria-label="Previous page"
      >
        ‹
      </button>

      {range(page, totalPages).map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1.5 text-[var(--color-ink-faint)]">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-2.5 text-sm font-medium transition-colors ${
              item === page
                ? 'bg-gradient-to-r from-[var(--color-brand-1)] to-[var(--color-brand-2)] text-white'
                : 'text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] hover:text-white'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] transition-colors hover:text-white disabled:opacity-30"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
