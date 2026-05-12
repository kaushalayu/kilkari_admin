import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '', description: '', image: '', icon: '', type: 'default',
  features: [''],
  order: 0, isActive: true,
};

const Programs = () => {
  const { data, loading, create, update, remove } = useCRUD('programs');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setMsg(''); };

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      features: item.features?.length ? item.features : [''],
    });
    setEditId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const updateFeature = (i, v) => { const a = [...form.features]; a[i] = v; set('features', a); };
  const addFeature = () => set('features', [...form.features, '']);
  const removeFeature = (i) => set('features', form.features.filter((_, x) => x !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, features: form.features.filter(f => f.trim()), order: Number(form.order) || 0 };
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
    if (!window.confirm('Delete this program?')) return;
    try { await remove(id); setMsg('Deleted!'); setTimeout(() => setMsg(''), 3000); }
    catch { setMsg('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Programs</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Program</>}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Education Support" /></div>
          <div className="form-group"><label>Icon Class</label><input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="bi bi-mortarboard-fill" /></div>
          <div className="form-group full"><label>Description *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={3} placeholder="Program description..." /></div>
          <div className="form-group"><label>Image</label><ImageUpload value={form.image} onChange={v => set('image', v)} folder="programs" /></div>
          <div className="form-group"><label>Card Type</label><input value={form.type} onChange={e => set('type', e.target.value)} placeholder="default / education / health" /></div>
          <div className="form-group"><label>Display Order</label><input type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="1, 2, 3..." /></div>

          <h3 className="section-title">Features</h3>
          {form.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input value={f} onChange={e => updateFeature(i, e.target.value)} placeholder={`Feature ${i + 1}`} style={{ flex: 1 }} />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeFeature(i)}><FiX /></button>
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <button type="button" className="btn btn-secondary" onClick={addFeature}><FiPlus /> Add Feature</button>
          </div>

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
      {!loading && data.length === 0 && <p className="empty">No programs yet.</p>}

      {!loading && data.map((item) => (
        <div key={item._id} className="table-container" style={{ marginBottom: '0.75rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {item.image && <img src={getFullUrl(item.image)} alt={item.title} style={{ height: 45, width: 45, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />}
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.title}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '2px 0 0' }}>{item.description?.substring(0, 80)}... · {item.isActive ? <span className="status-badge status-success">Active</span> : <span className="status-badge status-failed">Inactive</span>}</p>
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

export default Programs;
