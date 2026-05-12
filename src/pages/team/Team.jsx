import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  name: '', photo: '', role: '', bio: '',
  socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
  order: 0, isActive: true,
};

const Team = () => {
  const { data, loading, create, update, remove, total, fetchAll } = useCRUD('team');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setMsg(''); };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      if (editId) await update(editId, body);
      else await create(body);
      setMsg(editId ? 'Updated!' : 'Created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try { await remove(id); setMsg('Deleted!'); setTimeout(() => setMsg(''), 3000); }
    catch { setMsg('Delete failed'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchAll({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    fetchAll();
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Team Members {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Member</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search team members by name..."
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
          {search && <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={clearSearch}><FiX /> Clear</button>}
        </form>
      )}
      {search && <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Showing results for: <strong>"{search}"</strong></p>}

      {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Full name" /></div>
          <div className="form-group"><label>Role / Designation *</label><input value={form.role} onChange={e => set('role', e.target.value)} required placeholder="e.g. Founder" /></div>
          <div className="form-group"><label>Photo</label><ImageUpload value={form.photo} onChange={v => set('photo', v)} folder="team" /></div>
          <div className="form-group"><label>Display Order</label><input type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="1, 2, 3..." /></div>
          <div className="form-group full"><label>Bio</label><textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Short biography..." /></div>

          <h3 className="section-title">Social Links</h3>
          <div className="form-group"><label>Facebook</label><input value={form.socialLinks?.facebook || ''} onChange={e => set('socialLinks', { ...form.socialLinks, facebook: e.target.value })} placeholder="https://facebook.com/..." /></div>
          <div className="form-group"><label>Instagram</label><input value={form.socialLinks?.instagram || ''} onChange={e => set('socialLinks', { ...form.socialLinks, instagram: e.target.value })} placeholder="https://instagram.com/..." /></div>
          <div className="form-group"><label>Twitter / X</label><input value={form.socialLinks?.twitter || ''} onChange={e => set('socialLinks', { ...form.socialLinks, twitter: e.target.value })} placeholder="https://twitter.com/..." /></div>
          <div className="form-group"><label>LinkedIn</label><input value={form.socialLinks?.linkedin || ''} onChange={e => set('socialLinks', { ...form.socialLinks, linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></div>

          <div className="form-group">
            <label>Active</label>
            <select value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}><FiSave /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button><button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button></div>
        </form>
      )}

      {loading && <p className="loading">Loading...</p>}
      {!loading && data.length === 0 && <p className="empty">No team members yet.</p>}

      {!loading && data.map((item) => (
        <div key={item._id} className="table-container" style={{ marginBottom: '0.75rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {item.photo && <img src={getFullUrl(item.photo)} alt={item.name} style={{ height: 45, width: 45, objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--border)' }} />}
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.name}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '2px 0 0' }}>{item.role || '—'} · {item.isActive ? <span className="status-badge status-success">Active</span> : <span className="status-badge status-failed">Inactive</span>}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button className="btn-icon btn-edit" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
              <button className="btn-icon btn-delete" onClick={() => handleDelete(item._id)} title="Delete"><FiTrash2 /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Team;
