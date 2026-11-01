import { useEffect, useState, useCallback } from 'react';
import * as api from './services/api';

const TYPES = ['job', 'internship', 'freelance'];
const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];
const WORK_ARRANGEMENTS = ['remote', 'hybrid', 'on-site'];

const EMPTY_FORM = {
  company_name: '',
  role_title: '',
  type: 'job',
  platform: '',
  url: '',
  location: '',
  work_arrangement: '',
  salary: '',
  currency: '',
  status: 'saved',
  applied_date: '',
  deadline: '',
  notes: '',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [counts, setCounts] = useState({ total: 0, saved: 0, applied: 0, interview: 0, offer: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [filters, setFilters] = useState({ search: '', type: '', status: '', work_arrangement: '' });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [detailOpportunity, setDetailOpportunity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.listOpportunities(filters);
      setOpportunities(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load opportunities. Is the backend running?');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCounts = useCallback(async () => {
    try {
      const all = await api.listOpportunities({});
      const next = { total: 0, saved: 0, applied: 0, interview: 0, offer: 0 };
      (all || []).forEach((o) => {
        next.total += 1;
        if (next[o.status] !== undefined) next[o.status] += 1;
      });
      setCounts(next);
    } catch (err) {
      // Non-fatal: summary counts are a convenience, don't block the page on this.
      console.error('Failed to load summary counts', err);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleClearFilters() {
    setFilters({ search: '', type: '', status: '', work_arrangement: '' });
  }

  function openAddForm() {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(opportunity) {
    setFormData({
      company_name: opportunity.company_name || '',
      role_title: opportunity.role_title || '',
      type: opportunity.type || 'job',
      platform: opportunity.platform || '',
      url: opportunity.url || '',
      location: opportunity.location || '',
      work_arrangement: opportunity.work_arrangement || '',
      salary: opportunity.salary != null ? String(opportunity.salary) : '',
      currency: opportunity.currency || '',
      status: opportunity.status || 'saved',
      applied_date: opportunity.applied_date ? opportunity.applied_date.slice(0, 10) : '',
      deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
      notes: opportunity.notes || '',
    });
    setEditingId(opportunity.id);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError('');
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    const payload = {
      ...formData,
      salary: formData.salary === '' ? null : Number(formData.salary),
      applied_date: formData.applied_date || null,
      deadline: formData.deadline || null,
      work_arrangement: formData.work_arrangement || null,
    };

    try {
      if (editingId) {
        await api.updateOpportunity(editingId, payload);
        setSuccessMessage('Opportunity updated.');
      } else {
        await api.createOpportunity(payload);
        setSuccessMessage('Opportunity added.');
      }
      setShowForm(false);
      await fetchOpportunities();
      await fetchCounts();
    } catch (err) {
      setFormError(err.message || 'Failed to save opportunity.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(opportunity, newStatus) {
    try {
      await api.updateOpportunityStatus(opportunity.id, newStatus);
      await fetchOpportunities();
      await fetchCounts();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this opportunity?');
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteError('');
    try {
      await api.deleteOpportunity(id);
      setSuccessMessage('Opportunity deleted.');
      if (detailOpportunity && detailOpportunity.id === id) {
        setDetailOpportunity(null);
      }
      await fetchOpportunities();
      await fetchCounts();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete opportunity.');
    } finally {
      setDeletingId(null);
    }
  }

  async function openDetail(opportunity) {
    try {
      const fresh = await api.getOpportunity(opportunity.id);
      setDetailOpportunity(fresh);
    } catch (err) {
      setDetailOpportunity(opportunity);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>JobTrack</h1>
        <p className="subtitle">Track jobs, internships and freelance opportunities.</p>
      </header>

      <section className="summary">
        <div className="summary-card">
          <span className="summary-label">Total</span>
          <span className="summary-value">{counts.total}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Saved</span>
          <span className="summary-value">{counts.saved}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Applied</span>
          <span className="summary-value">{counts.applied}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Interview</span>
          <span className="summary-value">{counts.interview}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Offer</span>
          <span className="summary-value">{counts.offer}</span>
        </div>
      </section>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAddForm}>
          Add Opportunity
        </button>
      </div>

      {successMessage && <div className="banner banner-success">{successMessage}</div>}
      {error && <div className="banner banner-error">{error}</div>}
      {deleteError && <div className="banner banner-error">{deleteError}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search company, role or platform..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.work_arrangement}
          onChange={(e) => handleFilterChange('work_arrangement', e.target.value)}
        >
          <option value="">All arrangements</option>
          {WORK_ARRANGEMENTS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={handleClearFilters}>
          Clear filters
        </button>
      </div>

      <section className="list-section">
        {loading ? (
          <p className="empty-state">Loading opportunities...</p>
        ) : opportunities.length === 0 ? (
          <p className="empty-state">No opportunities found. Try adding one or adjusting your filters.</p>
        ) : (
          <table className="opportunity-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Type</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Location</th>
                <th>Arrangement</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id}>
                  <td className="clickable" onClick={() => openDetail(o)}>
                    {o.company_name}
                  </td>
                  <td className="clickable" onClick={() => openDetail(o)}>
                    {o.role_title}
                  </td>
                  <td>{o.type}</td>
                  <td>{o.platform || '—'}</td>
                  <td>
                    <select value={o.status} onChange={(e) => handleStatusChange(o, e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{o.location || '—'}</td>
                  <td>{o.work_arrangement || '—'}</td>
                  <td>{formatDate(o.deadline)}</td>
                  <td className="row-actions">
                    <button className="btn btn-small" onClick={() => openEditForm(o)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(o.id)}
                      disabled={deletingId === o.id}
                    >
                      {deletingId === o.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Opportunity' : 'Add Opportunity'}</h2>
            {formError && <div className="banner banner-error">{formError}</div>}
            <form onSubmit={handleFormSubmit} className="opportunity-form">
              <label>
                Company name *
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => handleFormChange('company_name', e.target.value)}
                />
              </label>
              <label>
                Role title *
                <input
                  type="text"
                  required
                  value={formData.role_title}
                  onChange={(e) => handleFormChange('role_title', e.target.value)}
                />
              </label>
              <label>
                Type *
                <select
                  required
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Platform
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => handleFormChange('platform', e.target.value)}
                />
              </label>
              <label>
                URL
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleFormChange('url', e.target.value)}
                />
              </label>
              <label>
                Location
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </label>
              <label>
                Work arrangement
                <select
                  value={formData.work_arrangement}
                  onChange={(e) => handleFormChange('work_arrangement', e.target.value)}
                >
                  <option value="">—</option>
                  {WORK_ARRANGEMENTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Salary
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleFormChange('salary', e.target.value)}
                />
              </label>
              <label>
                Currency
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleFormChange('currency', e.target.value)}
                  placeholder="USD"
                />
              </label>
              <label>
                Status *
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Applied date
                <input
                  type="date"
                  value={formData.applied_date}
                  onChange={(e) => handleFormChange('applied_date', e.target.value)}
                />
              </label>
              <label>
                Deadline
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleFormChange('deadline', e.target.value)}
                />
              </label>
              <label className="full-width">
                Notes
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </label>

              <div className="form-actions full-width">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOpportunity && (
        <div className="modal-overlay" onClick={() => setDetailOpportunity(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{detailOpportunity.company_name}</h2>
            <dl className="detail-list">
              <dt>Role</dt>
              <dd>{detailOpportunity.role_title}</dd>
              <dt>Type</dt>
              <dd>{detailOpportunity.type}</dd>
              <dt>Platform</dt>
              <dd>{detailOpportunity.platform || '—'}</dd>
              <dt>URL</dt>
              <dd>
                {detailOpportunity.url ? (
                  <a href={detailOpportunity.url} target="_blank" rel="noreferrer">
                    {detailOpportunity.url}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
              <dt>Location</dt>
              <dd>{detailOpportunity.location || '—'}</dd>
              <dt>Work arrangement</dt>
              <dd>{detailOpportunity.work_arrangement || '—'}</dd>
              <dt>Salary</dt>
              <dd>
                {detailOpportunity.salary
                  ? `${detailOpportunity.salary} ${detailOpportunity.currency || ''}`.trim()
                  : '—'}
              </dd>
              <dt>Status</dt>
              <dd>{detailOpportunity.status}</dd>
              <dt>Applied date</dt>
              <dd>{formatDate(detailOpportunity.applied_date)}</dd>
              <dt>Deadline</dt>
              <dd>{formatDate(detailOpportunity.deadline)}</dd>
              <dt>Notes</dt>
              <dd>{detailOpportunity.notes || '—'}</dd>
              <dt>Created</dt>
              <dd>{formatDate(detailOpportunity.created_at)}</dd>
            </dl>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setDetailOpportunity(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
