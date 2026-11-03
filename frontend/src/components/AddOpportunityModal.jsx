// AddOpportunityModal — full form matching the screenshot design

import { useState, useEffect, useRef } from 'react';

const TYPES = ['job', 'internship', 'freelance'];
const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected', 'closed'];
const ARRANGEMENTS = ['remote', 'hybrid', 'on-site'];

const STATUS_DOT_COLORS = {
  saved:     'var(--text-secondary)',
  applied:   '#4A90D9',
  interview: '#E8A838',
  offer:     'var(--status-green)',
  rejected:  'var(--accent-red)',
  closed:    'var(--border)',
};

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
      <line x1="6" y1="4" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
    </svg>
  );
}

const EMPTY_FORM = {
  company_name: '',
  role_title: '',
  type: 'job',
  platform: '',
  url: '',
  location: '',
  work_arrangement: '',
  salary: '',
  currency: 'USD',
  status: 'saved',
  applied_date: '',
  deadline: '',
  notes: '',
};

export default function AddOpportunityModal({
  isOpen,
  editingOpportunity,
  onClose,
  onSubmit,
  saving,
  formError,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const firstInputRef = useRef(null);

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) return;
    if (editingOpportunity) {
      setFormData({
        company_name:    editingOpportunity.company_name || '',
        role_title:      editingOpportunity.role_title || '',
        type:            editingOpportunity.type || 'job',
        platform:        editingOpportunity.platform || '',
        url:             editingOpportunity.url || '',
        location:        editingOpportunity.location || '',
        work_arrangement: editingOpportunity.work_arrangement || '',
        salary:          editingOpportunity.salary != null ? String(editingOpportunity.salary) : '',
        currency:        editingOpportunity.currency || 'USD',
        status:          editingOpportunity.status || 'saved',
        applied_date:    editingOpportunity.applied_date ? editingOpportunity.applied_date.slice(0, 10) : '',
        deadline:        editingOpportunity.deadline ? editingOpportunity.deadline.slice(0, 10) : '',
        notes:           editingOpportunity.notes || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setTouched({});
  }, [isOpen, editingOpportunity]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function set(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function touch(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Mark required fields touched
    setTouched({ company_name: true, role_title: true, type: true, status: true });
    onSubmit(formData);
  }

  const companyError = touched.company_name && !formData.company_name.trim();
  const roleError    = touched.role_title   && !formData.role_title.trim();

  const isEditing = !!editingOpportunity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? 'Edit opportunity' : 'Add opportunity'}
          </div>
          <div className="modal-required-note">
            <em>*</em> required
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {/* Error banner */}
        {formError && (
          <div className="form-banner-error">{formError}</div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* 01 ROLE */}
            <div className="form-section">
              <div className="form-section-label">01 Role</div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-field">
                  <label className="form-label">
                    Company name <span className="required-star">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    className={`form-input${companyError ? ' error' : ''}`}
                    placeholder="e.g. Acme Inc."
                    value={formData.company_name}
                    onChange={(e) => set('company_name', e.target.value)}
                    onBlur={() => touch('company_name')}
                    required
                  />
                  {companyError && (
                    <span className="form-error-msg">
                      <IconAlert /> Enter the company name.
                    </span>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label">
                    Role title <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${roleError ? ' error' : ''}`}
                    placeholder="e.g. Product Designer"
                    value={formData.role_title}
                    onChange={(e) => set('role_title', e.target.value)}
                    onBlur={() => touch('role_title')}
                    required
                  />
                  {roleError && (
                    <span className="form-error-msg">
                      <IconAlert /> Enter the role title.
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">
                  Type <span className="required-star">*</span>
                </label>
                <div className="type-toggle">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-toggle-btn${formData.type === t ? ' active' : ''}`}
                      onClick={() => set('type', t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 02 SOURCE */}
            <div className="form-section">
              <div className="form-section-label">02 Source</div>
              <div className="form-row" style={{ marginBottom: 12 }}>
                <div className="form-field">
                  <label className="form-label">Platform</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. LinkedIn, company site"
                    value={formData.platform}
                    onChange={(e) => set('platform', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://"
                    value={formData.url}
                    onChange={(e) => set('url', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bengaluru"
                    value={formData.location}
                    onChange={(e) => set('location', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Work arrangement</label>
                  <select
                    className="form-select"
                    value={formData.work_arrangement}
                    onChange={(e) => set('work_arrangement', e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {ARRANGEMENTS.map((w) => (
                      <option key={w} value={w}>
                        {w.charAt(0).toUpperCase() + w.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 03 COMPENSATION */}
            <div className="form-section">
              <div className="form-section-label">03 Compensation</div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Salary</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1200000"
                    value={formData.salary}
                    onChange={(e) => set('salary', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={formData.currency}
                    onChange={(e) => set('currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                    <option value="SGD">SGD</option>
                    <option value="JPY">JPY</option>
                    <option value="AED">AED</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 04 STATUS */}
            <div className="form-section">
              <div className="form-section-label">04 Status</div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">
                    Status <span className="required-star">*</span>
                  </label>
                  <div className="status-select-wrap">
                    <span
                      className="status-select-dot"
                      style={{ background: STATUS_DOT_COLORS[formData.status] }}
                    />
                    <select
                      className="form-select status-select-field"
                      value={formData.status}
                      onChange={(e) => set('status', e.target.value)}
                      required
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Applied date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.applied_date}
                    onChange={(e) => set('applied_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 05 NOTES */}
            <div className="form-section">
              <div className="form-section-label">05 Notes</div>
              <div className="form-field">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Anything worth remembering: contacts, deadlines, follow-ups."
                  value={formData.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? 'Saving…'
                : isEditing
                ? 'Save changes'
                : 'Save opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
