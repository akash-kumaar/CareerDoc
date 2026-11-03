// FilterToolbar — search + selects + clear

const TYPES = ['job', 'internship', 'freelance'];
const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];
const ARRANGEMENTS = ['remote', 'hybrid', 'on-site'];

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function FilterToolbar({ filters, onChange, onClear }) {
  const hasActiveFilters = filters.search || filters.type || filters.status || filters.work_arrangement;

  return (
    <div className="filter-toolbar">
      <div className="filter-input-wrap">
        <span className="filter-input-icon">
          <IconSearch />
        </span>
        <input
          type="text"
          className="filter-input"
          placeholder="Search company, role or platform…"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>

      <select
        className="filter-select"
        value={filters.type}
        onChange={(e) => onChange('type', e.target.value)}
      >
        <option value="">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.status}
        onChange={(e) => onChange('status', e.target.value)}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={filters.work_arrangement}
        onChange={(e) => onChange('work_arrangement', e.target.value)}
      >
        <option value="">All arrangements</option>
        {ARRANGEMENTS.map((w) => (
          <option key={w} value={w}>
            {w.charAt(0).toUpperCase() + w.slice(1)}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}
