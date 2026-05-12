import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiImage } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '',
  description: [''],
  image: '',
  category: '',
  targetAmount: 0,
  raisedAmount: 0,
  status: 'active',
  deadline: '',
  highlights: [],
  keypoints: { title: '', items: [''] },
  galleryImages: [],
  whatsappNumber: '',
  phoneNumber: '',
  isActive: true,
};

const Causes = () => {
  const { data, loading, create, update, remove, total, fetchAll } = useCRUD('causes', true);
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState(null);   // stores slug
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
      galleryImages: item.galleryImages || [],
      highlights: item.highlights || [],
      keypoints: item.keypoints || { title: '', items: [''] },
      description: item.description?.length ? item.description : [''],
    });
    setEditId(item.slug);   // use slug
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        targetAmount: Number(form.targetAmount) || 0,
        raisedAmount: Number(form.raisedAmount) || 0,
      };
      if (!body.deadline) delete body.deadline;
      if (editId) await update(editId, body);   // editId = slug
      else await create(body);
      setMsg(editId ? 'Cause updated!' : 'Cause created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this cause?')) return;
    try { await remove(item.slug); setMsg('Deleted!'); setTimeout(() => setMsg(''), 3000); }
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

  const updateHL = (i, k, v) => { const a = [...form.highlights]; a[i] = { ...a[i], [k]: v }; set('highlights', a); };
  const addHL = () => set('highlights', [...form.highlights, { icon: '', title: '', description: '' }]);
  const removeHL = (i) => set('highlights', form.highlights.filter((_, x) => x !== i));

  const updateDesc = (i, v) => { const a = [...form.description]; a[i] = v; set('description', a); };
  const addDesc = () => set('description', [...form.description, '']);
  const removeDesc = (i) => set('description', form.description.filter((_, x) => x !== i));

  const updateKP = (i, v) => { const items = [...(form.keypoints?.items || [])]; items[i] = v; set('keypoints', { ...form.keypoints, items }); };
  const addKP = () => set('keypoints', { ...form.keypoints, items: [...(form.keypoints?.items || []), ''] });
  const removeKP = (i) => set('keypoints', { ...form.keypoints, items: (form.keypoints?.items || []).filter((_, x) => x !== i) });

  const addGallery = () => set('galleryImages', [...form.galleryImages, '']);
  const updateGallery = (i, v) => { const a = [...form.galleryImages]; a[i] = v; set('galleryImages', a); };
  const removeGallery = (i) => set('galleryImages', form.galleryImages.filter((_, x) => x !== i));

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Causes {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Cause</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search causes by title..."
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
          {search && <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={clearSearch}><FiX /> Clear</button>}
        </form>
      )}
      {search && <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Showing results for: <strong>"{search}"</strong></p>}

      {msg && <div className={`alert ${msg.toLowerCase().includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {showForm && (
        <form className="crud-form" onSubmit={handleSubmit}>
          <h3 className="section-title">Basic Info</h3>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required /></div>
          <div className="form-group"><label>Category</label><input value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Education" /></div>
          <div className="form-group full">
            <label>Description *</label>
            {form.description.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <textarea value={p} onChange={e => updateDesc(i, e.target.value)} rows={2} style={{ flex: 1 }} placeholder={`Paragraph ${i + 1}`} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeDesc(i)}><FiX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addDesc}><FiPlus /> Add Paragraph</button>
          </div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="urgent">Urgent</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <h3 className="section-title">Funding</h3>
          <div className="form-group"><label>Target Amount (₹)</label><input type="number" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} placeholder="50000" /></div>
          <div className="form-group"><label>Raised Amount (₹)</label><input type="number" value={form.raisedAmount} onChange={e => set('raisedAmount', e.target.value)} placeholder="25000" /></div>
          <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} /></div>

          <h3 className="section-title">Media</h3>
          <div className="form-group full"><label>Cover Image</label><ImageUpload value={form.image} onChange={v => set('image', v)} folder="causes" /></div>

          <div className="form-group full">
            <label>Gallery Images</label>
            {form.galleryImages.map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <ImageUpload value={img} onChange={v => updateGallery(i, v)} folder="causes" />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeGallery(i)}><FiX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addGallery}><FiImage /> Add Image</button>
          </div>

          <h3 className="section-title">Highlights</h3>
          {form.highlights.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
              <input value={h.icon} onChange={e => updateHL(i, 'icon', e.target.value)} placeholder="Icon class" />
              <input value={h.title} onChange={e => updateHL(i, 'title', e.target.value)} placeholder="Title" />
              <input value={h.description} onChange={e => updateHL(i, 'description', e.target.value)} placeholder="Description" />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeHL(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addHL}><FiPlus /> Add Highlight</button>

          <h3 className="section-title">Keypoints</h3>
          <div className="form-group"><label>Keypoints Title</label><input value={form.keypoints?.title || ''} onChange={e => set('keypoints', { ...form.keypoints, title: e.target.value })} /></div>
          {(form.keypoints?.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={item} onChange={e => updateKP(i, e.target.value)} placeholder={`Point ${i + 1}`} style={{ flex: 1 }} />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeKP(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addKP}><FiPlus /> Add Point</button>

          <h3 className="section-title">Contact Info</h3>
          <div className="form-group"><label>WhatsApp Number</label><input value={form.whatsappNumber || ''} onChange={e => set('whatsappNumber', e.target.value)} placeholder="919873336611" /></div>
          <div className="form-group"><label>Phone Number</label><input value={form.phoneNumber || ''} onChange={e => set('phoneNumber', e.target.value)} placeholder="+91-98733-36611" /></div>

          <h3 className="section-title">Settings</h3>
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
      {!loading && data.length === 0 && <p className="empty">No causes yet.</p>}

      {!loading && data.map((item) => (
        <div key={item._id} className="table-container" style={{ marginBottom: '0.75rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {item.image && <img src={getFullUrl(item.image)} alt="cause" style={{ height: 55, width: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />}
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.title}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '2px 0 0' }}>{item.category || '—'} · <span className={`status-badge ${item.status === 'active' ? 'status-success' : item.status === 'urgent' ? 'status-failed' : 'status-pending'}`}>{item.status}</span></p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', margin: '2px 0 0' }}>₹{item.raisedAmount || 0} / ₹{item.targetAmount || 0}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button className="btn-icon btn-edit" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
              <button className="btn-icon btn-delete" onClick={() => handleDelete(item)} title="Delete"><FiTrash2 /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Causes;
