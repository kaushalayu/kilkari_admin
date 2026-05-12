import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiPlus, FiEdit2, FiX, FiSave, FiMapPin, FiSmartphone, FiUser,
  FiToggleLeft, FiToggleRight, FiDollarSign, FiTrendingUp, FiEye,
  FiMail, FiBarChart2
} from 'react-icons/fi';

const HOLDING_KEYS = [
  'cash', 'upi', 'gpay', 'phonepay', 'paytm', 'neft', 'rtgs',
  'cheque', 'dd', 'razorpay', 'bank_transfer', 'other'
];

const HOLDING_LABELS = {
  cash: 'Cash', upi: 'UPI', gpay: 'Google Pay', phonepay: 'PhonePe',
  paytm: 'Paytm', neft: 'NEFT', rtgs: 'RTGS', cheque: 'Cheque',
  dd: 'Demand Draft', razorpay: 'Razorpay', bank_transfer: 'Bank Transfer', other: 'Other'
};

const sumHoldings = (h) =>
  HOLDING_KEYS.reduce((s, k) => s + (h?.[k] || 0), 0);

const EMPTY_CENTER = {
  name: '', code: '', address: '', city: '', state: '',
  contactPerson: '', contactPhone: '', email: '', isActive: true
};

const Centers = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_CENTER);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [holdingsCenter, setHoldingsCenter] = useState(null);
  const [holdingsData, setHoldingsData] = useState(null);
  const [holdingsLoading, setHoldingsLoading] = useState(false);

  const fetchCenters = () => {
    setLoading(true);
    api.get('/centers')
      .then(res => setCenters(res.data.data || []))
      .catch(() => setCenters([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCenters(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_CENTER);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setEditingId(c._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_CENTER);
  };

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return showMsg('error', 'Center name is required');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/centers/${editingId}`, form);
        showMsg('success', 'Center updated!');
      } else {
        await api.post('/centers', form);
        showMsg('success', 'Center created!');
      }
      closeForm();
      fetchCenters();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/centers/${id}/toggle`);
      fetchCenters();
    } catch {
      showMsg('error', 'Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this center?')) return;
    try {
      await api.delete(`/centers/${id}`);
      showMsg('success', 'Center deleted');
      fetchCenters();
    } catch {
      showMsg('error', 'Delete failed');
    }
  };

  const viewHoldings = async (c) => {
    setHoldingsCenter(c);
    setHoldingsLoading(true);
    try {
      const res = await api.get(`/centers/${c._id}/holdings`);
      setHoldingsData(res.data.data);
    } catch {
      setHoldingsData(null);
    }
    setHoldingsLoading(false);
  };

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Collection Centers</h1>
          <p className="dm-subtitle">Register and manage donation collection centers</p>
        </div>
        <button className="dm-btn-primary" onClick={openCreate}>
          <FiPlus /> Add Center
        </button>
      </div>

      {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}

      {loading ? (
        <div className="loading">Loading centers...</div>
      ) : centers.length === 0 ? (
        <div className="dm-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <FiMapPin size={40} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>No centers registered yet.</p>
          <button className="dm-btn-primary" onClick={openCreate}><FiPlus /> Add First Center</button>
        </div>
      ) : (
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Center Name</th>
                <th>City</th>
                <th>In Hand</th>
                <th>Under Settlement</th>
                <th>Bank Balance</th>
                <th>Collected</th>
                <th>Settled</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {centers.map(c => (
                <tr key={c._id} className={!c.isActive ? 'dm-row-inactive' : ''}>
                  <td className="dm-mono" style={{ fontWeight: 700 }}>{c.code || '—'}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.city || '—'}</td>
                  <td className="dm-amount" style={{ fontSize: '0.78rem' }}>
                    ₹{sumHoldings(c.inHand).toLocaleString('en-IN')}
                  </td>
                  <td className="dm-amount" style={{ fontSize: '0.78rem', color: '#d97706' }}>
                    ₹{sumHoldings(c.underSettlement).toLocaleString('en-IN')}
                  </td>
                  <td className="dm-amount" style={{ fontSize: '0.78rem' }}>
                    ₹{Number(c.bankBalance || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="dm-dim">₹{Number(c.totalCollected || 0).toLocaleString('en-IN')}</td>
                  <td className="dm-dim">₹{Number(c.totalSettled || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ fontSize: '0.72rem' }}>
                      {c.contactPerson && <div><FiUser size={10} /> {c.contactPerson}</div>}
                      {c.contactPhone && <div><FiSmartphone size={10} /> {c.contactPhone}</div>}
                    </div>
                  </td>
                  <td>
                    <span className={`dm-status ${c.isActive ? 'dm-status-success' : 'dm-status-inactive'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}
                        onClick={() => viewHoldings(c)} title="View Holdings">
                        <FiBarChart2 />
                      </button>
                      <button className="btn-icon btn-edit" onClick={() => openEdit(c)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className={`btn-icon ${c.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggle(c._id)}
                        title={c.isActive ? 'Deactivate' : 'Activate'}>
                        {c.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(c._id)} title="Delete">
                        <FiX />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="dm-modal-overlay" onClick={closeForm}>
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editingId ? 'Edit Center' : 'Add Center'}</h2>
              <button className="dm-modal-close" onClick={closeForm}><FiX /></button>
            </div>
            <div className="dm-modal-body">
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Center Name *</label>
                  <input className="dm-form-input" value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="e.g. Delhi North Center" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Center Code</label>
                  <input className="dm-form-input" value={form.code}
                    onChange={e => handleChange('code', e.target.value.toUpperCase())}
                    placeholder="Auto-generated if empty" maxLength={10} />
                </div>
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Address</label>
                <input className="dm-form-input" value={form.address}
                  onChange={e => handleChange('address', e.target.value)} />
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">City</label>
                  <input className="dm-form-input" value={form.city}
                    onChange={e => handleChange('city', e.target.value)} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">State</label>
                  <input className="dm-form-input" value={form.state}
                    onChange={e => handleChange('state', e.target.value)} />
                </div>
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Contact Person</label>
                  <input className="dm-form-input" value={form.contactPerson}
                    onChange={e => handleChange('contactPerson', e.target.value)} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Contact Phone</label>
                  <input className="dm-form-input" value={form.contactPhone}
                    onChange={e => handleChange('contactPhone', e.target.value)} />
                </div>
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Email</label>
                <input type="email" className="dm-form-input" value={form.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="center@example.com" />
              </div>
              <div className="dm-form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => handleChange('isActive', e.target.checked)} />
                  Active
                </label>
              </div>
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={closeForm}>Cancel</button>
              <button className="dm-btn-primary" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : editingId ? 'Update Center' : 'Create Center'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Detail Modal */}
      {holdingsCenter && (
        <div className="dm-modal-overlay" onClick={() => { setHoldingsCenter(null); setHoldingsData(null); }}>
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{holdingsCenter.name}</h2>
              <p className="dm-modal-sub">{holdingsCenter.code} — Holdings Breakdown</p>
              <button className="dm-modal-close" onClick={() => { setHoldingsCenter(null); setHoldingsData(null); }}><FiX /></button>
            </div>
            <div className="dm-modal-body">
              {holdingsLoading ? (
                <div className="loading">Loading holdings...</div>
              ) : (
                <>
                  <div className="dm-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem' }}>
                    <div className="dm-stat-card" style={{ '--sc': '#059669', padding: '0.75rem' }}>
                      <div className="dm-stat-label">In Hand</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem' }}>
                        ₹{sumHoldings(holdingsData?.inHand).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="dm-stat-card" style={{ '--sc': '#d97706', padding: '0.75rem' }}>
                      <div className="dm-stat-label">Under Settlement</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem', color: '#d97706' }}>
                        ₹{sumHoldings(holdingsData?.underSettlement).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="dm-stat-card" style={{ '--sc': '#2563eb', padding: '0.75rem' }}>
                      <div className="dm-stat-label">Bank Balance</div>
                      <div className="dm-stat-value" style={{ fontSize: '1rem' }}>
                        ₹{Number(holdingsData?.bankBalance || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <table className="dm-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th>Payment Mode</th>
                        <th>In Hand</th>
                        <th>Under Settlement</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HOLDING_KEYS.map(k => {
                        const ih = holdingsData?.inHand?.[k] || 0;
                        const us = holdingsData?.underSettlement?.[k] || 0;
                        if (!ih && !us) return null;
                        return (
                          <tr key={k}>
                            <td><strong>{HOLDING_LABELS[k]}</strong></td>
                            <td className="dm-amount">₹{ih.toLocaleString('en-IN')}</td>
                            <td className="dm-amount" style={{ color: '#d97706' }}>
                              ₹{us.toLocaleString('en-IN')}
                            </td>
                            <td className="dm-amount">₹{(ih + us).toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="dm-total-row">
                        <td><strong>Total</strong></td>
                        <td className="dm-amount">
                          <strong>₹{sumHoldings(holdingsData?.inHand).toLocaleString('en-IN')}</strong>
                        </td>
                        <td className="dm-amount" style={{ color: '#d97706' }}>
                          <strong>₹{sumHoldings(holdingsData?.underSettlement).toLocaleString('en-IN')}</strong>
                        </td>
                        <td className="dm-amount">
                          <strong>₹{(sumHoldings(holdingsData?.inHand) + sumHoldings(holdingsData?.underSettlement)).toLocaleString('en-IN')}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-primary" onClick={() => { setHoldingsCenter(null); setHoldingsData(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Centers;
