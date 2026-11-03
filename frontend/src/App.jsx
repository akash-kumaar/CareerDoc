import { useEffect, useState, useCallback } from 'react';
import * as api from './services/api.js';
import { DEMO_RECORDS } from './data/demoRecords.js';

import Sidebar from './components/Sidebar.jsx';
import OverviewPage from './components/OverviewPage.jsx';
import OpportunitiesPage from './components/OpportunitiesPage.jsx';
import AddOpportunityModal from './components/AddOpportunityModal.jsx';
import DetailModal from './components/DetailModal.jsx';
import Toast from './components/Toast.jsx';

// ── App ───────────────────────────────────────────────────
export default function App() {
  // ── Navigation ───────────────────────────────────────
  const [activePage, setActivePage] = useState('overview');

  // ── Data ─────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [counts, setCounts] = useState({ total: 0, saved: 0, applied: 0, interview: 0, offer: 0 });
  const [loading, setLoading] = useState(true);

  // ── Filters ──────────────────────────────────────────
  const [filters, setFilters] = useState({ search: '', type: '', status: '', work_arrangement: '' });

  // ── Modal / form state ───────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [detailOpportunity, setDetailOpportunity] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── Demo loading ─────────────────────────────────────
  const [loadingDemo, setLoadingDemo] = useState(false);

  // ── Toast ─────────────────────────────────────────────
  const [toast, setToast] = useState({ message: '', type: 'success' });

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  // ── Fetch (filtered) ─────────────────────────────────
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listOpportunities(filters);
      setOpportunities(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load opportunities.', 'error');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ── Fetch all (for counts + overview) ────────────────
  const fetchAll = useCallback(async () => {
    try {
      const all = await api.listOpportunities({});
      setAllOpportunities(all || []);
      const next = { total: 0, saved: 0, applied: 0, interview: 0, offer: 0 };
      (all || []).forEach((o) => {
        next.total += 1;
        if (next[o.status] !== undefined) next[o.status] += 1;
      });
      setCounts(next);
    } catch (err) {
      console.error('Failed to load all opportunities for counts:', err);
    }
  }, []);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function refresh() {
    await Promise.all([fetchOpportunities(), fetchAll()]);
  }

  // ── Keyboard shortcut: N = add ───────────────────────
  useEffect(() => {
    function handleKey(e) {
      // Don't trigger when typing in inputs/modals
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (showForm || detailOpportunity) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openAddForm();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showForm, detailOpportunity]);

  // ── Handlers ─────────────────────────────────────────
  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleClearFilters() {
    setFilters({ search: '', type: '', status: '', work_arrangement: '' });
  }

  function openAddForm() {
    setEditingOpportunity(null);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(opportunity) {
    setEditingOpportunity(opportunity);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError('');
  }

  async function handleFormSubmit(formData) {
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
      if (editingOpportunity) {
        await api.updateOpportunity(editingOpportunity.id, payload);
        showToast('Opportunity updated.');
      } else {
        await api.createOpportunity(payload);
        showToast('Opportunity added.');
      }
      setShowForm(false);
      await refresh();
    } catch (err) {
      setFormError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await api.deleteOpportunity(id);
      showToast('Opportunity deleted.');
      if (detailOpportunity && detailOpportunity.id === id) {
        setDetailOpportunity(null);
      }
      await refresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(opportunity, newStatus) {
    try {
      await api.updateOpportunityStatus(opportunity.id, newStatus);
      await refresh();
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  }

  async function openDetail(opportunity) {
    try {
      const fresh = await api.getOpportunity(opportunity.id);
      setDetailOpportunity(fresh);
    } catch {
      setDetailOpportunity(opportunity);
    }
  }

  async function handleLoadDemo() {
    setLoadingDemo(true);
    let succeeded = 0;
    let failed = 0;
    for (const record of DEMO_RECORDS) {
      try {
        await api.createOpportunity(record);
        succeeded++;
      } catch {
        failed++;
      }
    }
    await refresh();
    setLoadingDemo(false);
    if (succeeded > 0) {
      showToast(
        `${succeeded} demo record${succeeded > 1 ? 's' : ''} loaded.${failed > 0 ? ` (${failed} failed)` : ''}`,
        'success'
      );
    } else {
      showToast('Failed to load demo records.', 'error');
    }
  }

  // ── Shared props ──────────────────────────────────────
  const commonProps = {
    onAdd:       openAddForm,
    onLoadDemo:  handleLoadDemo,
    loadingDemo,
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-content">
        {activePage === 'overview' ? (
          <OverviewPage
            {...commonProps}
            counts={counts}
            allOpportunities={allOpportunities}
            loading={loading}
          />
        ) : (
          <OpportunitiesPage
            {...commonProps}
            opportunities={opportunities}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onDetail={openDetail}
            onStatusChange={handleStatusChange}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* Add / Edit modal */}
      <AddOpportunityModal
        isOpen={showForm}
        editingOpportunity={editingOpportunity}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        saving={saving}
        formError={formError}
      />

      {/* Detail modal */}
      <DetailModal
        opportunity={detailOpportunity}
        onClose={() => setDetailOpportunity(null)}
        onEdit={openEditForm}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
