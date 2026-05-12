import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { FiPlus, FiSearch, FiCheck, FiX, FiRefreshCw, FiUserCheck, FiDownload, FiUpload, FiUsers, FiCalendar, FiClock, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const emptyForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  dob: '', gender: 'other', membershipType: 'general', membershipLevel: 'regular',
  occupation: '', notes: '', referralCode: ''
};

const LEVELS = ['regular', 'patron', 'life', 'honorary'];
const STATUS_MAP = { pending: 'warning', approved: 'success', rejected: 'danger', expired: 'dim' };
const LEVEL_COLORS = { regular: '#6b7280', patron: '#7c3aed', life: '#059669', honorary: '#d97706' };
const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

const Members = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('cards');
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 20, search };
      if (tab !== 'all') params.status = tab;
      const { data: res } = await api.get('/members', { params });
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch { setMsg('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); setPage(1); }, [tab, search]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/members/${editId}`, form);
      else await api.post('/members', form);
      setMsg(editId ? 'Updated!' : 'Created!');
      reset(); fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    try { await api.put(`/members/${id}/approve`); setMsg('Approved!'); fetchData(page); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await api.put(`/members/${id}/reject`, { reason }); setMsg('Rejected.'); fetchData(page); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleRenew = async (id) => {
    if (!window.confirm('Renew this membership for another term?')) return;
    try { await api.put(`/members/${id}/renew`); setMsg('Renewed!'); fetchData(page); }
    catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleGenerateIdCard = async (id) => {
    try {
      const res = await api.put(`/members/${id}/generate-id-card`);
      setMsg('ID Card URL generated: ' + (res.data.data?.idCardUrl || ''));
      fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/members/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(`Imported ${res.data.imported} of ${res.data.total} members`);
      fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Bulk import failed'); }
    finally { setBulkImporting(false); fileRef.current.value = ''; }
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name, email: m.email || '', phone: m.phone, address: m.address || '',
      city: m.city || '', state: m.state || '', pincode: m.pincode || '',
      dob: m.dob ? m.dob.split('T')[0] : '', gender: m.gender || 'other',
      membershipType: m.membershipType || 'general', membershipLevel: m.membershipLevel || 'regular',
      occupation: m.occupation || '', notes: m.notes || '', referralCode: m.referralCode || ''
    });
    setEditId(m._id);
    setShowForm(true);
  };

  const avColor = (s) => AV_COLORS[(s || 'A').charCodeAt(0) % AV_COLORS.length];

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><FiUserCheck /> Members <span className="text-dim" style={{ fontSize: '0.82rem', fontWeight: 400 }}>({total})</span></h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={bulkImporting}>
            <FiUpload /> {bulkImporting ? 'Importing...' : 'Bulk Import'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleBulkImport} />
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(true); }}>
            <FiPlus /> Add Member
          </button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="dm-filters" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.key)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="dm-search-bar" style={{ maxWidth: 250 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search name/phone/ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="dm-btn-outline" onClick={() => fetchData(page)}><FiRefreshCw size={13} /></button>
        <div className="dm-toggle-group">
          <button className={`dm-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}><FiGrid size={13} /></button>
          <button className={`dm-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}><FiList size={13} /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : viewMode === 'cards' ? (
        <>
          {data.length === 0 ? (
            <div className="dm-empty-state">
              <div className="dm-empty-icon">👤</div>
              <h3>No members found</h3>
              <p>Add your first member to get started.</p>
              <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>+ Add Member</button>
            </div>
          ) : (
            <div className="donor-cards-grid">
              {data.map(m => {
                const av = avColor(m.name);
                const isExpired = m.expiryDate && new Date(m.expiryDate) < new Date();
                return (
                  <div key={m._id} className="donor-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(m)}>
                    <div className="donor-card-accent" style={{ background: `linear-gradient(90deg, ${av}, ${av}88)` }} />
                    <div className="donor-card-top">
                      <div className="donor-card-av" style={{ background: av }}>{(m.name || 'M')[0].toUpperCase()}</div>
                      <div className="donor-card-identity">
                        <div className="donor-card-name">{m.name}</div>
                        <span className="donor-card-id" style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600 }}>{m.memberId}</span>
                        <span className="donor-card-type" style={{ background: LEVEL_COLORS[m.membershipLevel] + '18', color: LEVEL_COLORS[m.membershipLevel], marginLeft: '0.3rem' }}>{m.membershipLevel}</span>
                      </div>
                      <div className="donor-card-total">
                        <div className={`status-badge status-${STATUS_MAP[m.status] || 'pending'}`}>{m.status}</div>
                      </div>
                    </div>
                    <div className="donor-card-rows">
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiCalendar /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Expiry</span>
                          <span className="donor-card-row-value">{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN') : '—'}{isExpired ? <span className="badge badge-danger" style={{ marginLeft: '0.3rem' }}>Expired</span> : ''}</span>
                        </div>
                      </div>
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiUsers /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Referral Code</span>
                          <span className="donor-card-row-value">{m.referralCode || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="donor-card-footer">
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.phone}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        <button className="dm-btn-sm" onClick={() => handleEdit(m)}>Edit</button>
                        {m.status === 'pending' && <button className="dm-btn-sm" style={{ color: '#059669' }} onClick={() => handleApprove(m._id)}><FiCheck /></button>}
                        {m.status === 'approved' && <button className="dm-btn-sm" onClick={() => handleRenew(m._id)} title="Renew"><FiClock /></button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {totalPages > 1 && (
            <div className="dm-pagination">
              <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><FiChevronLeft /></button>
              <span className="dm-page-info">Page {page} of {totalPages}</span>
              <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="table-container">
            <div className="table-scroll-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th className="hide-mobile">Level</th>
                    <th>Status</th>
                    <th className="hide-mobile">Referral Code</th>
                    <th className="hide-mobile">Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={8} className="text-center text-dim">No members found</td></tr>}
                  {data.map(m => (
                    <tr key={m._id}>
                      <td className="text-mono" style={{ fontSize: '0.75rem' }}>{m.memberId}</td>
                      <td><strong>{m.name}</strong><br /><span className="text-dim" style={{ fontSize: '0.75rem' }}>{m.email}</span></td>
                      <td>{m.phone}</td>
                      <td className="hide-mobile"><span className={`badge badge-${m.membershipLevel === 'life' ? 'success' : m.membershipLevel === 'patron' ? 'info' : 'default'}`}>{m.membershipLevel}</span></td>
                      <td><span className={`status-badge status-${STATUS_MAP[m.status] || 'pending'}`}>{m.status}</span></td>
                      <td className="hide-mobile text-mono" style={{ fontSize: '0.7rem' }}>{m.referralCode || '—'}</td>
                      <td className="hide-mobile" style={{ fontSize: '0.8rem' }}>
                        {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN') : '—'}
                        {m.expiryDate && new Date(m.expiryDate) < new Date() && <span className="badge badge-danger" style={{ marginLeft: '0.3rem' }}>Expired</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(m)}>Edit</button>
                          {m.status === 'pending' && (
                            <>
                              <button className="btn btn-sm btn-primary" onClick={() => handleApprove(m._id)}><FiCheck /></button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleReject(m._id)}><FiX /></button>
                            </>
                          )}
                          {m.status === 'approved' && (
                            <button className="btn btn-sm btn-outline" onClick={() => handleRenew(m._id)} title="Renew"><FiClock /></button>
                          )}
                          <button className="btn btn-sm btn-outline" onClick={() => handleGenerateIdCard(m._id)} title="Generate ID Card"><FiDownload /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="dm-pagination" style={{ marginTop: '0.75rem' }}>
              <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><FiChevronLeft /></button>
              <span className="dm-page-info">Page {page} of {totalPages}</span>
              <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="dm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <div className="dm-av dm-av-lg" style={{ background: avColor(selected.name) }}>{(selected.name || 'M')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <h2 className="dm-modal-name">{selected.name}</h2>
                <p className="dm-modal-sub"><strong>{selected.memberId}</strong> · {selected.membershipLevel} · {selected.status}</p>
              </div>
              <button className="dm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="dm-modal-info">
              <div className="dm-info-row"><FiUsers /> {selected.phone} · {selected.email || '—'}</div>
              <div className="dm-info-row"><FiCalendar /> DOB: {selected.dob ? new Date(selected.dob).toLocaleDateString('en-IN') : '—'} · Joined: {selected.joinDate ? new Date(selected.joinDate).toLocaleDateString('en-IN') : '—'}</div>
              <div className="dm-info-row"><FiClock /> Expiry: {selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString('en-IN') : '—'} · Referral: {selected.referralCode || '—'}</div>
              {selected.notes && <div className="dm-info-row" style={{ fontSize: '0.78rem', color: '#64748b' }}>Notes: {selected.notes}</div>}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={() => { setSelected(null); handleEdit(selected); }}>Edit</button>
              <button className="dm-btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dm-modal-overlay" onClick={() => reset()}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editId ? 'Edit Member' : 'Add Member'}</h2>
              <button className="dm-modal-close" onClick={reset}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="dm-modal-body">
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Name *</label>
                    <input className="dm-form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Phone *</label>
                    <input className="dm-form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Email</label>
                    <input className="dm-form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Gender</label>
                    <select className="dm-form-input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Membership Level</label>
                    <select className="dm-form-input" value={form.membershipLevel} onChange={e => setForm(f => ({ ...f, membershipLevel: e.target.value }))}>
                      {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Occupation</label>
                    <input className="dm-form-input" value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">DOB</label>
                    <input className="dm-form-input" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Referral Code</label>
                    <input className="dm-form-input" value={form.referralCode} onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))} placeholder="KILXXXXXX" />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Address</label>
                  <textarea className="dm-form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">City</label>
                    <input className="dm-form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">State</label>
                    <input className="dm-form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Pincode</label>
                    <input className="dm-form-input" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Notes</label>
                  <textarea className="dm-form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>
              <div className="dm-modal-footer">
                <button type="button" className="dm-btn-outline" onClick={reset}>Cancel</button>
                <button type="submit" className="dm-btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
