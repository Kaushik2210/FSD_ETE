import SearchBar from './SearchBar.jsx';
import FilterPanel from './FilterPanel.jsx';
import SortDropdown from './SortDropdown.jsx';

/** Wires SearchBar + FilterPanel + SortDropdown together and reports combined query params up. */
export default function IdeaControls({ filters, onChange }) {
  const activeCount = [filters.domain !== 'all', filters.status !== 'all', Boolean(filters.search)].filter(Boolean).length;

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
      <SearchBar value={filters.search} onChange={(search) => onChange({ search })} />

      <div className="flex flex-wrap gap-2">
        <FilterPanel
          domain={filters.domain}
          status={filters.status}
          onDomainChange={(domain) => onChange({ domain })}
          onStatusChange={(status) => onChange({ status })}
        />
        <SortDropdown value={filters.sort} onChange={(sort) => onChange({ sort })} />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({ search: '', domain: 'all', status: 'all' })}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-ink-dim)] ring-1 ring-[var(--color-border)] transition-colors hover:text-[var(--color-ink)]"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
