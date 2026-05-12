import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  badge: '',
  titleLine1: '',
  titleHighlight: '',
  titleLine3: '',
  primaryBtnLabel: 'Donate Now',
  primaryBtnLink: '/donation',
  secondaryBtnLabel: 'Contact Us',
  secondaryBtnLink: '/contact',
  image: '',
  isActive: true,
};

const Hero = () => {
  const { data, loading, create, update, remove } = useCRUD('hero');
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openEdit = (item) => {
    setForm({ ...emptyForm, ...item });
    setEditId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await update(editId, form);
      else await create(form);
      setMsg(editId ? 'Hero slide updated!' : 'Hero slide created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hero slide?')) return;
    try { await remove(id); setMsg('Deleted!'); setTimeout(() => setMsg(''), 3000); }
    catch { setMsg('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Hero Slider</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Slide</>}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <h3 className="section-title">Slide Text</h3>
          <div className="form-group"><label>Badge Text</label><input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. Empowering Communities" /></div>
          <div className="form-group"><label>Title Line 1</label><input value={form.titleLine1} onChange={e => set('titleLine1', e.target.value)} placeholder="e.g. Together We" /></div>
          <div className="form-group"><label>Title Highlight (colored)</label><input value={form.titleHighlight} onChange={e => set('titleHighlight', e.target.value)} placeholder="e.g. Change Lives" /></div>
          <div className="form-group"><label>Title Line 3</label><input value={form.titleLine3} onChange={e => set('titleLine3', e.target.value)} placeholder="e.g. For a Better Tomorrow" /></div>

          <h3 className="section-title">Buttons</h3>
          <div className="form-group"><label>Primary Button Label</label><input value={form.primaryBtnLabel} onChange={e => set('primaryBtnLabel', e.target.value)} placeholder="Donate Now" /></div>
          <div className="form-group"><label>Primary Button Link</label><input value={form.primaryBtnLink} onChange={e => set('primaryBtnLink', e.target.value)} placeholder="/donation" /></div>
          <div className="form-group"><label>Secondary Button Label</label><input value={form.secondaryBtnLabel} onChange={e => set('secondaryBtnLabel', e.target.value)} placeholder="Contact Us" /></div>
          <div className="form-group"><label>Secondary Button Link</label><input value={form.secondaryBtnLink} onChange={e => set('secondaryBtnLink', e.target.value)} placeholder="/contact" /></div>

          <h3 className="section-title">Background Image</h3>
          <div className="form-group full">
            <label>Slide Background Image</label>
            <ImageUpload value={form.image} onChange={v => set('image', v)} folder="hero" placeholder="Upload slide image" />
          </div>

          <div className="form-group">
            <label>Active</label>
            <select value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="form-actions" style={{ gridColumn: '1/-1' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}><FiSave /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <p className="loading">Loading...</p>}
      {!loading && data.length === 0 && <p className="empty">No hero slides yet. Add your first slide above.</p>}

      {data.map((item) => (
        <div key={item._id} className="table-container" style={{ marginBottom: '0.75rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {item.image && (
                <img src={getFullUrl(item.image)} alt="slide" style={{ height: 55, width: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
              )}
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.badge || '—'}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '2px 0 0' }}>
                  {item.titleLine1} <strong>{item.titleHighlight}</strong> {item.titleLine3}
                </p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                  [{item.primaryBtnLabel}] [{item.secondaryBtnLabel}] — {item.isActive ? <span className="status-badge status-success">Active</span> : <span className="status-badge status-failed">Inactive</span>}
                </p>
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

export default Hero;
