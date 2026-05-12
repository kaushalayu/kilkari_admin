import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiPlus, FiSearch, FiMapPin, FiRefreshCw, FiUsers, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiEdit2, FiX, FiUser, FiPhone, FiCalendar, FiHome } from 'react-icons/fi';

const emptyForm = { name: '', age: '', gender: 'other', phone: '', email: '', address: '', city: '', state: '', pincode: '', category: '', familyMembers: 0, incomeLevel: '', gpsCoordinates: { lat: '', lng: '' }, notes: '' };

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

const Beneficiaries = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('cards');

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/beneficiaries', { params: { page: p || page, limit: 20, search } });
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch { setMsg('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); setPage(1); }, [search]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.gpsCoordinates?.lat || !payload.gpsCoordinates?.lng) delete payload.gpsCoordinates;
      if (editId) await api.put(`/beneficiaries/${editId}`, payload);
      else await api.post('/beneficiaries', payload);
      setMsg(editId ? 'Updated!' : 'Created!');
      reset(); fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const avColor = (s) => AV_COLORS[(s || 'A').charCodeAt(0) % AV_COLORS.length];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><FiUsers /> Beneficiaries <span className="text-dim" style={{ fontSize: '0.82rem', fontWeight: 400 }}>({total})</span></h2>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(true); }}>
          <FiPlus /> Add Beneficiary
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div className="dm-filters" style={{ marginBottom: '1rem' }}>
        <div className="dm-search-bar" style={{ maxWidth: 300 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search name/phone/ID/city..." value={search} onChange={e => setSearch(e.target.value)} />
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
              <div className="dm-empty-icon">🤝</div>
              <h3>No beneficiaries found</h3>
              <p>Add your first beneficiary to start tracking.</p>
              <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>+ Add Beneficiary</button>
            </div>
          ) : (
            <div className="donor-cards-grid">
              {data.map(b => {
                const av = avColor(b.name);
                return (
                  <div key={b._id} className="donor-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}>
                    <div className="donor-card-accent" style={{ background: `linear-gradient(90deg, ${av}, ${av}88)` }} />
                    <div className="donor-card-top">
                      <div className="donor-card-av" style={{ background: av }}>{(b.name || 'B')[0].toUpperCase()}</div>
                      <div className="donor-card-identity">
                        <div className="donor-card-name">{b.name}</div>
                        <span className="donor-card-id" style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: 600 }}>{b.beneficiaryId}</span>
                        {b.category && <span className="donor-card-type" style={{ background: '#7c3aed18', color: '#7c3aed', marginLeft: '0.3rem' }}>{b.category}</span>}
                      </div>
                      <div className="donor-card-total">
                        <div className="donor-card-total-val" style={{ fontSize: '0.85rem' }}>{b.serviceHistory?.length || 0}</div>
                        <div className="donor-card-total-label">Services</div>
                      </div>
                    </div>
                    <div className="donor-card-rows">
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiUser /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Age/Gender</span>
                          <span className="donor-card-row-value">{b.age || '—'}/{b.gender || '—'}</span>
                        </div>
                      </div>
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiPhone /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Phone</span>
                          <span className="donor-card-row-value">{b.phone || '—'}</span>
                        </div>
                      </div>
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiHome /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">City</span>
                          <span className="donor-card-row-value">{b.city || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="donor-card-footer">
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.familyMembers || 0} family members</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                        <button className="dm-btn-sm" onClick={() => { setForm({ ...emptyForm, ...b }); setEditId(b._id); setShowForm(true); }}><FiEdit2 size={11} /> Edit</button>
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
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age/Gender</th>
                    <th className="hide-mobile">Phone</th>
                    <th className="hide-mobile">City</th>
                    <th className="hide-mobile">Category</th>
                    <th className="hide-mobile">Services</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={8} className="text-center text-dim">No beneficiaries found</td></tr>}
                  {data.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{b.beneficiaryId}</td>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.age || '—'}/{b.gender || '—'}</td>
                      <td className="hide-mobile">{b.phone || '—'}</td>
                      <td className="hide-mobile">{b.city || '—'}</td>
                      <td className="hide-mobile">{b.category || '—'}</td>
                      <td className="hide-mobile"><span className="dm-count-badge">{b.serviceHistory?.length || 0}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => { setForm({ ...emptyForm, ...b }); setEditId(b._id); setShowForm(true); }}>Edit</button>
                          <button className="btn btn-sm btn-outline" onClick={() => setSelected(b)} title="View Services"><FiMapPin /></button>
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
              <div className="dm-av dm-av-lg" style={{ background: avColor(selected.name) }}>{(selected.name || 'B')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <h2 className="dm-modal-name">{selected.name}</h2>
                <p className="dm-modal-sub"><strong>{selected.beneficiaryId}</strong> · {selected.category || 'No category'} · {selected.city || '—'}</p>
              </div>
              <button className="dm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="dm-modal-info">
              <div className="dm-info-row"><FiUser /> {selected.age || '—'} yrs · {selected.gender}</div>
              <div className="dm-info-row"><FiPhone /> {selected.phone || '—'} · {selected.email || '—'}</div>
              <div className="dm-info-row"><FiHome /> {[selected.address, selected.city, selected.state, selected.pincode].filter(Boolean).join(', ') || '—'}</div>
              <div className="dm-info-row"><FiUsers /> Family: {selected.familyMembers || 0} · Income: {selected.incomeLevel || '—'}</div>
              {selected.notes && <div className="dm-info-row" style={{ fontSize: '0.78rem', color: '#64748b' }}>Notes: {selected.notes}</div>}
            </div>
            <div className="dm-modal-body" style={{ maxHeight: 200, overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Service History</h4>
              {(!selected.serviceHistory || selected.serviceHistory.length === 0) && <p className="text-dim" style={{ fontSize: '0.78rem' }}>No service records yet.</p>}
              {selected.serviceHistory?.map((s, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{new Date(s.serviceDate).toLocaleDateString('en-IN')} — {s.serviceType}</p>
                  <p className="text-dim" style={{ fontSize: '0.78rem' }}>{s.description}</p>
                </div>
              ))}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={() => { setSelected(null); setForm({ ...emptyForm, ...selected }); setEditId(selected._id); setShowForm(true); }}>Edit</button>
              <button className="dm-btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dm-modal-overlay" onClick={() => reset()}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editId ? 'Edit Beneficiary' : 'Add Beneficiary'}</h2>
              <button className="dm-modal-close" onClick={reset}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="dm-modal-body">
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Name *</label>
                    <input className="dm-form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Age</label>
                    <input className="dm-form-input" type="number" value={form.age} onChange={e => set('age', e.target.value)} />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Gender</label>
                    <select className="dm-form-input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Phone</label>
                    <input className="dm-form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Email</label>
                    <input className="dm-form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Category</label>
                    <input className="dm-form-input" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Education, Health" />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Family Members</label>
                    <input className="dm-form-input" type="number" value={form.familyMembers} onChange={e => set('familyMembers', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Income Level</label>
                    <input className="dm-form-input" value={form.incomeLevel} onChange={e => set('incomeLevel', e.target.value)} />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Address</label>
                  <textarea className="dm-form-input" value={form.address} onChange={e => set('address', e.target.value)} rows={2} />
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">City</label>
                    <input className="dm-form-input" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">State</label>
                    <input className="dm-form-input" value={form.state} onChange={e => set('state', e.target.value)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Pincode</label>
                    <input className="dm-form-input" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">GPS Latitude</label>
                    <input className="dm-form-input" type="number" step="any" value={form.gpsCoordinates?.lat || ''} onChange={e => set('gpsCoordinates', { ...form.gpsCoordinates, lat: parseFloat(e.target.value) || '' })} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">GPS Longitude</label>
                    <input className="dm-form-input" type="number" step="any" value={form.gpsCoordinates?.lng || ''} onChange={e => set('gpsCoordinates', { ...form.gpsCoordinates, lng: parseFloat(e.target.value) || '' })} />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Notes</label>
                  <textarea className="dm-form-input" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
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

export default Beneficiaries;
