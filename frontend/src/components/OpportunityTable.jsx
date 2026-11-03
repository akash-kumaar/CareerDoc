// OpportunityTable — desktop table + mobile cards

import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function capitalize(str) {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Confirm delete dialog
function ConfirmDialog({ company, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-title">Delete opportunity?</div>
        <p className="confirm-body">
          <strong>{company}</strong> will be permanently removed. This cannot be undone.
        </p>
        <div className="confirm-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OpportunityTable({
  opportunities,
  onEdit,
  onDelete,
  onDetail,
  onStatusChange,
  deletingId,
}) {
  const [confirmId, setConfirmId] = useState(null);

  function handleDeleteClick(id) {
    setConfirmId(id);
  }

  function handleConfirmDelete() {
    if (confirmId) {
      onDelete(confirmId);
      setConfirmId(null);
    }
  }

  const confirmOpp = confirmId ? opportunities.find((o) => o.id === confirmId) : null;

  return (
    <>
      {/* Desktop table */}
      <div className="opp-table-wrap">
        <table className="opp-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Type</th>
              <th>Platform</th>
              <th>Location</th>
              <th>Status</th>
              <th>Applied</th>
              <th style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id}>
                <td>
                  <span className="opp-company" onClick={() => onDetail(o)}>
                    {o.company_name}
                  </span>
                </td>
                <td>
                  <span className="opp-role" onClick={() => onDetail(o)}>
                    {o.role_title}
                  </span>
                </td>
                <td className="opp-muted">{capitalize(o.type)}</td>
                <td className="opp-muted">{o.platform || '—'}</td>
                <td className="opp-muted">{o.location || '—'}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td className="opp-muted">{formatDate(o.applied_date)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onEdit(o)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--accent-red)' }}
                      onClick={() => handleDeleteClick(o.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="opp-cards">
        {opportunities.map((o) => (
          <div className="opp-card" key={o.id}>
            <div className="opp-card-header">
              <div>
                <div className="opp-card-company" onClick={() => onDetail(o)}>
                  {o.company_name}
                </div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="opp-card-role">{o.role_title}</div>
            <div className="opp-card-meta">
              <span>{capitalize(o.type)}</span>
              {o.platform && <><span>·</span><span>{o.platform}</span></>}
              {o.location && <><span>·</span><span>{o.location}</span></>}
              {o.applied_date && <><span>·</span><span>{formatDate(o.applied_date)}</span></>}
            </div>
            <div className="opp-card-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(o)}>
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteClick(o.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm delete */}
      {confirmOpp && (
        <ConfirmDialog
          company={confirmOpp.company_name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmId(null)}
          deleting={deletingId === confirmId}
        />
      )}
    </>
  );
}
