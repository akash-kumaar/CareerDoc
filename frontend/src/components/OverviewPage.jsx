// OverviewPage — dashboard with stat cards + recent list

import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).toUpperCase();
}

const STATUS_CONFIG = {
  saved:     { color: 'var(--text-secondary)', dotClass: 'saved',     icon: '○',  sub: 'not yet applied' },
  applied:   { color: '#4A90D9',              dotClass: 'applied',   icon: '●',  sub: 'awaiting response' },
  interview: { color: '#E8A838',              dotClass: 'interview', icon: '◑',  sub: 'in progress' },
  offer:     { color: 'var(--status-green)',  dotClass: 'offer',     icon: '✓',  sub: 'received' },
};

const ALL_STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];

const STATUS_DOT_ICONS = {
  saved:     '○',
  applied:   '●',
  interview: '◑',
  offer:     '✓',
  rejected:  '✕',
  closed:    '—',
};

export default function OverviewPage({
  counts,
  allOpportunities,
  loading,
  onAdd,
  onLoadDemo,
  loadingDemo,
}) {
  const recent = allOpportunities.slice(0, 5);
  const isEmpty = counts.total === 0;

  // Build status pill counts from allOpportunities
  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = allOpportunities.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-date">{getTodayLabel()}</div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Where your search stands <span className="highlight-word">today.</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          Add opportunity
          <span className="btn-kbd">N</span>
        </button>
      </div>

      {/* Tagline */}
      <p className="overview-tagline">Do the next small thing, then record it.</p>

      <div className="divider" style={{ margin: '0 0 20px' }} />

      {/* Stat cards */}
      <div className="stat-grid">
        {/* Total */}
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{counts.total}</div>
          <div className="stat-sublabel">across <em>all</em> types</div>
        </div>

        {/* Saved */}
        <div className="stat-card">
          <div className="stat-label">
            <span className="stat-label-icon saved" />
            Saved
          </div>
          <div className="stat-value">{counts.saved}</div>
          <div className="stat-sublabel">not yet applied</div>
        </div>

        {/* Applied */}
        <div className="stat-card">
          <div className="stat-label">
            <span className="stat-label-icon applied" />
            Applied
          </div>
          <div className="stat-value">{counts.applied}</div>
          <div className="stat-sublabel">awaiting response</div>
        </div>

        {/* Interviews */}
        <div className="stat-card">
          <div className="stat-label">
            <span style={{ fontSize: 10 }}>◑</span>
            &nbsp;Interviews
          </div>
          <div className="stat-value">{counts.interview}</div>
          <div className="stat-sublabel">in progress</div>
        </div>

        {/* Offers */}
        <div className="stat-card">
          <div className="stat-label">
            <span style={{ fontSize: 10 }}>✓</span>
            &nbsp;Offers
          </div>
          <div className="stat-value">{counts.offer}</div>
          <div className="stat-sublabel">received</div>
        </div>
      </div>

      {/* Status pill row */}
      <div className="status-pill-row">
        {ALL_STATUSES.map((s) => (
          <div key={s} className="status-pill">
            <span className={`status-pill-dot ${s}`} />
            {s.toUpperCase()}&nbsp;{statusCounts[s]}
          </div>
        ))}
      </div>

      <div className="divider" style={{ margin: '0 0 24px' }} />

      {/* Empty or recent list */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading…
        </div>
      ) : isEmpty ? (
        <EmptyState
          onAdd={onAdd}
          onLoadDemo={onLoadDemo}
          loadingDemo={loadingDemo}
        />
      ) : (
        <>
          <div className="recent-section-title">Recent opportunities</div>
          <div className="recent-list">
            {recent.map((o) => (
              <div className="recent-item" key={o.id}>
                <div className="recent-item-left">
                  <div className="recent-company">{o.company_name}</div>
                  <div className="recent-role">{o.role_title}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
