import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiRefreshCw, FiUser, FiChevronLeft, FiChevronRight, FiMail, FiPhone, FiGlobe, FiGrid, FiList, FiX } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  name: '', photo: '', role: '', bio: '', email: '', phone: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  isActive: true,
};

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

const Volunteers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('cards');

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/volunteers?page=${p || page}&limit=20&search=${search}`);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch { setMsg('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); setPage(1); }, [search]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      socialLinks: {
        facebook: item.socialLinks?.facebook || '',
        instagram: item.socialLinks?.instagram || '',
        twitter: item.socialLinks?.twitter || '',
        linkedin: item.socialLinks?.linkedin || '',
      }
    });
    setEditId(item._id);
    setShowForm(true);
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/volunteers/${editId}`, form);
      else await api.post('/volunteers', form);
      setMsg(editId ? 'Updated!' : 'Created!');
      reset(); fetchData(page);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this volunteer?')) return;
    try { await api.delete(`/volunteers/${id}`); setMsg('Deleted!'); fetchData(page); }
    catch { setMsg('Delete failed'); }
  };

  const avColor = (s) => AV_COLORS[(s || 'A').charCodeAt(0) % AV_COLORS.length];

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title"><FiUser /> Volunteers</h1>
          <p className="dm-subtitle">{total} volunteers</p>
        </div>
        <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>
          <FiPlus size={13} /> Add Volunteer
        </button>
      </div>

      {msg && <div className={`dm-alert ${msg.includes('fail') || msg.includes('Fail') ? 'dm-alert-error' : 'dm-alert-success'}`}>{msg}</div>}

      <div className="dm-filters">
        <div className="dm-search-bar" style={{ maxWidth: 300 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search by name, role, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="dm-btn-outline" onClick={() => fetchData(page)}><FiRefreshCw size={13} /></button>
        <div className="dm-toggle-group">
          <button className={`dm-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}><FiGrid size={13} /></button>
          <button className={`dm-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}><FiList size={13} /></button>
        </div>
      </div>

      {showForm && (
        <div className="dm-modal-overlay" onClick={() => reset()}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editId ? 'Edit Volunteer' : 'Add Volunteer'}</h2>
              <button className="dm-modal-close" onClick={reset}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="dm-modal-body">
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Name *</label>
                    <input className="dm-form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Full name" />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Role *</label>
                    <input className="dm-form-input" value={form.role} onChange={e => set('role', e.target.value)} required placeholder="e.g. Education Volunteer" />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Email</label>
                    <input className="dm-form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Phone</label>
                    <input className="dm-form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Photo</label>
                  <ImageUpload value={form.photo} onChange={v => set('photo', v)} folder="volunteers" />
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Bio</label>
                  <textarea className="dm-form-input" value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} placeholder="Short bio..." />
                </div>
                <div className="dm-modal-section-title">Social Links</div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Facebook</label>
                    <input className="dm-form-input" value={form.socialLinks?.facebook || ''} onChange={e => set('socialLinks', { ...form.socialLinks, facebook: e.target.value })} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Instagram</label>
                    <input className="dm-form-input" value={form.socialLinks?.instagram || ''} onChange={e => set('socialLinks', { ...form.socialLinks, instagram: e.target.value })} placeholder="https://instagram.com/..." />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Twitter / X</label>
                    <input className="dm-form-input" value={form.socialLinks?.twitter || ''} onChange={e => set('socialLinks', { ...form.socialLinks, twitter: e.target.value })} placeholder="https://twitter.com/..." />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">LinkedIn</label>
                    <input className="dm-form-input" value={form.socialLinks?.linkedin || ''} onChange={e => set('socialLinks', { ...form.socialLinks, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Active</label>
                  <select className="dm-form-input" value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
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

      {loading ? (
        <div className="loading">Loading...</div>
      ) : viewMode === 'cards' ? (
        <>
          {data.length === 0 ? (
            <div className="dm-empty-state">
              <div className="dm-empty-icon">🙋</div>
              <h3>No volunteers yet</h3>
              <p>Add your first volunteer to build your team.</p>
              <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>+ Add Volunteer</button>
            </div>
          ) : (
            <div className="donor-cards-grid">
              {data.map((item) => {
                const av = avColor(item.name);
                return (
                  <div key={item._id} className="donor-card">
                    <div className="donor-card-accent" style={{ background: `linear-gradient(90deg, ${av}, ${av}88)` }} />
                    <div className="donor-card-top">
                      {item.photo ? (
                        <img src={getFullUrl(item.photo)} alt={item.name} style={{ height: 44, width: 44, objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--border)' }} />
                      ) : (
                        <div className="donor-card-av" style={{ background: av }}>{(item.name || 'V')[0].toUpperCase()}</div>
                      )}
                      <div className="donor-card-identity">
                        <div className="donor-card-name">{item.name}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.role || '—'}</span>
                      </div>
                      <div>
                        <span className={`status-badge ${item.isActive ? 'status-success' : 'status-failed'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="donor-card-rows">
                      {item.email && (
                        <div className="donor-card-row">
                          <div className="donor-card-row-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiMail /></div>
                          <div className="donor-card-row-body">
                            <span className="donor-card-row-label">Email</span>
                            <span className="donor-card-row-value">{item.email}</span>
                          </div>
                        </div>
                      )}
                      {item.phone && (
                        <div className="donor-card-row">
                          <div className="donor-card-row-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiPhone /></div>
                          <div className="donor-card-row-body">
                            <span className="donor-card-row-label">Phone</span>
                            <span className="donor-card-row-value">{item.phone}</span>
                          </div>
                        </div>
                      )}
                      <div className="donor-card-row">
                        <div className="donor-card-row-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiGlobe /></div>
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Assignments</span>
                          <span className="donor-card-row-value">{(item.assignedEvents?.length || 0) + (item.assignedProjects?.length || 0)} events/projects</span>
                        </div>
                      </div>
                    </div>
                    <div className="donor-card-footer">
                      {item.bio && <span style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{item.bio}</span>}
                      <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                        <button className="btn-icon btn-edit" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(item._id)} title="Delete"><FiTrash2 /></button>
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
          <div className="dm-card">
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Role</th><th className="hide-mobile">Email</th><th className="hide-mobile">Phone</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={6} className="dm-empty">No volunteers found</td></tr>}
                  {data.map(item => (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.role || '—'}</td>
                      <td className="hide-mobile dm-dim">{item.email || '—'}</td>
                      <td className="hide-mobile dm-dim">{item.phone || '—'}</td>
                      <td><span className={`dm-status ${item.isActive ? 'dm-status-success' : 'dm-status-failed'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="dm-btn-sm" onClick={() => openEdit(item)}><FiEdit2 size={11} /></button>
                          <button className="dm-btn-sm dm-btn-clear" onClick={() => handleDelete(item._id)}><FiTrash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="dm-pagination">
                <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><FiChevronLeft /></button>
                <span className="dm-page-info">Page {page} of {totalPages}</span>
                <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Volunteers;
