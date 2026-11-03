// DetailModal — read-only view of a single opportunity

import StatusBadge from './StatusBadge.jsx';

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function Row({ label, value }) {
  return (
    <>
      <dt className="detail-label">{label}</dt>
      <dd className="detail-value">{value || '—'}</dd>
    </>
  );
}

export default function DetailModal({ opportunity, onClose, onEdit }) {
  if (!opportunity) return null;

  const o = opportunity;
  const salary = o.salary
    ? `${Number(o.salary).toLocaleString()} ${o.currency || ''}`.trim()
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="detail-company">{o.company_name}</div>
          <div className="detail-role">{o.role_title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <dl className="detail-grid">
            <Row label="Status" value={<StatusBadge status={o.status} />} />
            <Row label="Type" value={o.type?.charAt(0).toUpperCase() + o.type?.slice(1)} />
            <Row label="Platform" value={o.platform} />
            <Row label="URL" value={o.url ? <a href={o.url} target="_blank" rel="noreferrer">{o.url}</a> : null} />
            <Row label="Location" value={o.location} />
            <Row label="Work arrangement" value={o.work_arrangement} />
            <Row label="Salary" value={salary} />
            <Row label="Applied" value={formatDate(o.applied_date)} />
            <Row label="Deadline" value={formatDate(o.deadline)} />
            <Row label="Notes" value={o.notes} />
            <Row label="Added" value={formatDate(o.created_at)} />
          </dl>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(o); }}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
