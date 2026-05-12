import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiBarChart2,
  FiUsers, FiDollarSign, FiCalendar, FiEye, FiTarget,
  FiX, FiSave, FiExternalLink, FiClock, FiCheckCircle,
  FiPauseCircle, FiAlertCircle
} from 'react-icons/fi';

const STATUS_OPTIONS = ['draft', 'active', 'paused', 'completed', 'cancelled'];

const STATUS_COLORS = {
  draft: { bg: '#f1f5f9', color: '#64748b' },
  active: { bg: '#d1fae5', color: '#059669' },
  paused: { bg: '#fef3c7', color: '#d97706' },
  completed: { bg: '#dbeafe', color: '#2563eb' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' }
};

const EMPTY_CAMPAIGN = {
  title: '', shortDescription: '', description: '',
  goalAmount: '', startDate: '', endDate: '', status: 'draft',
  cause: '', coverImage: '', assignedFundraisers: []
};

const CrowdFunding = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [causes, setCauses] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data.data || []);
    } catch { setCampaigns([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
    api.get('/causes').then(r => setCauses(r.data.data || [])).catch(() => {});
    api.get('/permissions/users?role=fundraiser').then(r => setFundraisers(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setForm(EMPTY_CAMPAIGN);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      title: c.title, shortDescription: c.shortDescription || '',
      description: c.description || '',
      goalAmount: c.goalAmount, startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
      status: c.status, cause: c.cause?._id || c.cause || '',
      coverImage: c.coverImage || '',
      assignedFundraisers: c.assignedFundraisers?.map(f => f._id || f) || []
    });
    setEditingId(c._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_CAMPAIGN);
  };

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) return showMsg('error', 'Title is required');
    if (!form.goalAmount || Number(form.goalAmount) <= 0) return showMsg('error', 'Valid goal amount is required');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/campaigns/${editingId}`, form);
        showMsg('success', 'Campaign updated!');
      } else {
        await api.post('/campaigns', form);
        showMsg('success', 'Campaign created!');
      }
      closeForm();
      fetchCampaigns();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      showMsg('success', 'Campaign deleted');
      fetchCampaigns();
    } catch { showMsg('error', 'Delete failed'); }
  };

  const totalRaised = campaigns.reduce((s, c) => s + (c.raisedAmount || 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalDonors = campaigns.reduce((s, c) => s + (c.donorCount || 0), 0);
  const avgProgress = campaigns.length
    ? Math.round(campaigns.reduce((s, c) => s + (c.progress || 0), 0) / campaigns.length)
    : 0;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Crowd Fundraising</h1>
          <p className="dm-subtitle">Manage fundraising campaigns, track donations, and monitor progress</p>
        </div>
        <button className="dm-btn-primary" onClick={openCreate}>
          <FiPlus /> New Campaign
        </button>
      </div>

      {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}

      <div className="dm-stats">
        <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiTarget /></div>
          </div>
          <div className="dm-stat-value">{activeCount}</div>
          <div className="dm-stat-label">Active Campaigns</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#2563eb' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiDollarSign /></div>
          </div>
          <div className="dm-stat-value">₹{totalRaised.toLocaleString('en-IN')}</div>
          <div className="dm-stat-label">Total Raised</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#7c3aed' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiUsers /></div>
          </div>
          <div className="dm-stat-value">{totalDonors}</div>
          <div className="dm-stat-label">Total Donors</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#d97706' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiBarChart2 /></div>
          </div>
          <div className="dm-stat-value">{avgProgress}%</div>
          <div className="dm-stat-label">Avg. Progress</div>
        </div>
      </div>

      <div className="dm-card">
        <div className="dm-card-header">
          <span className="dm-card-title"><FiTrendingUp /> All Campaigns</span>
          <span className="dm-count-badge">{campaigns.length} total</span>
        </div>
        {loading ? (
          <div className="loading">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="dm-empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <FiTarget size={40} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
            <h3>No Campaigns Yet</h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>Create your first fundraising campaign.</p>
            <button className="dm-btn-primary" onClick={openCreate}><FiPlus /> Create Campaign</button>
          </div>
        ) : (
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Target</th>
                  <th>Raised</th>
                  <th>Progress</th>
                  <th>Donors</th>
                  <th>Cause</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th style={{ width: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const sc = STATUS_COLORS[c.status] || STATUS_COLORS.draft;
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.title}</strong>
                        {c.shortDescription && <div className="dm-dim" style={{ fontSize: '0.7rem' }}>{c.shortDescription}</div>}
                      </td>
                      <td className="dm-amount">₹{Number(c.goalAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="dm-amount">₹{Number(c.raisedAmount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${c.progress || 0}%`, height: '100%', background: c.progress >= 100 ? '#059669' : '#2563eb', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)' }}>{c.progress || 0}%</span>
                        </div>
                      </td>
                      <td><span className="dm-count-badge">{c.donorCount || 0}</span></td>
                      <td className="dm-dim">{c.cause?.name || '—'}</td>
                      <td className="dm-dim" style={{ fontSize: '0.72rem' }}>
                        {c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : '—'}
                        {c.daysRemaining > 0 && <div style={{ color: '#d97706', fontSize: '0.65rem' }}>{c.daysRemaining}d left</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '99px', background: sc.bg, color: sc.color }}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon btn-edit" onClick={() => openEdit(c)} title="Edit"><FiEdit2 /></button>
                          <a href={`/campaign/${c.slug}`} target="_blank" rel="noopener noreferrer"
                            className="btn-icon" title="View Public Page"
                            style={{ background: '#f0fdf4', color: '#059669' }}>
                            <FiExternalLink />
                          </a>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(c._id)} title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="dm-modal-overlay" onClick={closeForm}>
          <div className="dm-modal dm-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editingId ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button className="dm-modal-close" onClick={closeForm}><FiX /></button>
            </div>
            <div className="dm-modal-body">
              <div className="dm-form-row">
                <div className="dm-form-group" style={{ flex: 2 }}>
                  <label className="dm-form-label">Campaign Title *</label>
                  <input className="dm-form-input" value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="e.g. Help 100 Children Go to School" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Goal Amount (₹) *</label>
                  <input type="number" className="dm-form-input" value={form.goalAmount}
                    onChange={e => handleChange('goalAmount', e.target.value)}
                    placeholder="500000" min="1" />
                </div>
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Short Description</label>
                <input className="dm-form-input" value={form.shortDescription}
                  onChange={e => handleChange('shortDescription', e.target.value)}
                  placeholder="Brief description for campaign cards" />
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Description</label>
                <textarea className="dm-form-input" rows={3} value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Full campaign description" />
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Start Date</label>
                  <input type="date" className="dm-form-input" value={form.startDate}
                    onChange={e => handleChange('startDate', e.target.value)} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">End Date</label>
                  <input type="date" className="dm-form-input" value={form.endDate}
                    onChange={e => handleChange('endDate', e.target.value)} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Status</label>
                  <select className="dm-form-input" value={form.status}
                    onChange={e => handleChange('status', e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Cause</label>
                  <select className="dm-form-input" value={form.cause}
                    onChange={e => handleChange('cause', e.target.value)}>
                    <option value="">— Select Cause —</option>
                    {causes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Cover Image URL</label>
                  <input className="dm-form-input" value={form.coverImage}
                    onChange={e => handleChange('coverImage', e.target.value)}
                    placeholder="/uploads/campaigns/image.jpg" />
                </div>
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Assigned Fundraisers</label>
                <select className="dm-form-input" multiple
                  value={form.assignedFundraisers}
                  onChange={e => handleChange('assignedFundraisers',
                    [...e.target.options].filter(o => o.selected).map(o => o.value)
                  )}>
                  {fundraisers.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                  ))}
                </select>
                <div className="dm-dim" style={{ fontSize: '0.68rem', marginTop: '0.25rem' }}>
                  Hold Ctrl/Cmd to select multiple fundraisers
                </div>
              </div>
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={closeForm}>Cancel</button>
              <button className="dm-btn-primary" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : editingId ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdFunding;
