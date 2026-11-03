// OpportunitiesPage — main opportunities view

import FilterToolbar from './FilterToolbar.jsx';
import OpportunityTable from './OpportunityTable.jsx';
import EmptyState from './EmptyState.jsx';

export default function OpportunitiesPage({
  opportunities,
  loading,
  filters,
  onFilterChange,
  onClearFilters,
  onAdd,
  onEdit,
  onDelete,
  onDetail,
  onStatusChange,
  onLoadDemo,
  loadingDemo,
  deletingId,
}) {
  const hasFilters = filters.search || filters.type || filters.status || filters.work_arrangement;

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Opportunities</h1>
          <p className="page-subtitle">
            Everything you&rsquo;re <em>considering</em>,{' '}
            <span className="highlight-word">applying for</span> and tracking.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          Add opportunity
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading opportunities…
        </div>
      ) : opportunities.length === 0 && !hasFilters ? (
        /* True empty state — no records at all */
        <EmptyState
          onAdd={onAdd}
          onLoadDemo={onLoadDemo}
          loadingDemo={loadingDemo}
        />
      ) : (
        /* List state */
        <>
          <FilterToolbar
            filters={filters}
            onChange={onFilterChange}
            onClear={onClearFilters}
          />

          {opportunities.length === 0 ? (
            /* No results for current filters */
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              No opportunities match your filters.{' '}
              <button
                onClick={onClearFilters}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <OpportunityTable
              opportunities={opportunities}
              onEdit={onEdit}
              onDelete={onDelete}
              onDetail={onDetail}
              onStatusChange={onStatusChange}
              deletingId={deletingId}
            />
          )}
        </>
      )}
    </div>
  );
}
