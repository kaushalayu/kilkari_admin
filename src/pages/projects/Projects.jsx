import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiImage } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '',
  description: '',
  image: '',
  category: '',
  status: 'active',
  startDate: '',
  endDate: '',
  highlights: [],
  keypoints: { title: '', items: [] },
  galleryImages: [],
  stats: [],
  sideList: [],
  whatsappNumber: '',
  phoneNumber: '',
  isActive: true,
};

const Projects = () => {
  const { data, loading, create, update, remove, total, fetchAll } = useCRUD('projects', true);
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
      ...emptyForm,
      ...item,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      galleryImages: item.galleryImages || [],
      highlights: item.highlights || [],
      keypoints: item.keypoints || { title: '', items: [] },
      stats: item.stats || [],
      sideList: item.sideList || [],
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
      const body = { ...form };
      if (!body.startDate) delete body.startDate;
      if (!body.endDate) delete body.endDate;
      if (editId) await update(editId, body);   // editId = slug
      else await create(body);
      setMsg(editId ? 'Project updated!' : 'Project created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this project?')) return;
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

  const addHighlight = () => setForm(p => ({ ...p, highlights: [...p.highlights, { icon: '', title: '', description: '' }] }));
  const updateHighlight = (i, key, val) => setForm(p => {
    const h = [...p.highlights]; h[i] = { ...h[i], [key]: val };
    return { ...p, highlights: h };
  });
  const removeHighlight = (i) => setForm(p => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));

  const addKeypoint = () => setForm(p => ({ ...p, keypoints: { ...p.keypoints, items: [...p.keypoints.items, ''] } }));
  const updateKeypoint = (i, val) => setForm(p => {
    const items = [...p.keypoints.items]; items[i] = val;
    return { ...p, keypoints: { ...p.keypoints, items } };
  });
  const removeKeypoint = (i) => setForm(p => ({ ...p, keypoints: { ...p.keypoints, items: p.keypoints.items.filter((_, idx) => idx !== i) } }));

  const addGalleryImage = () => setForm(p => ({ ...p, galleryImages: [...p.galleryImages, ''] }));
  const updateGalleryImage = (i, val) => setForm(p => {
    const g = [...p.galleryImages]; g[i] = val;
    return { ...p, galleryImages: g };
  });
  const removeGalleryImage = (i) => setForm(p => ({ ...p, galleryImages: p.galleryImages.filter((_, idx) => idx !== i) }));

  const addStat = () => setForm(p => ({ ...p, stats: [...p.stats, { number: '', label: '' }] }));
  const updateStat = (i, k, v) => setForm(p => { const s = [...p.stats]; s[i] = { ...s[i], [k]: v }; return { ...p, stats: s }; });
  const removeStat = (i) => setForm(p => ({ ...p, stats: p.stats.filter((_, idx) => idx !== i) }));

  const addSideList = () => setForm(p => ({ ...p, sideList: [...p.sideList, { icon: '', text: '' }] }));
  const updateSideList = (i, k, v) => setForm(p => { const s = [...p.sideList]; s[i] = { ...s[i], [k]: v }; return { ...p, sideList: s }; });
  const removeSideList = (i) => setForm(p => ({ ...p, sideList: p.sideList.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Projects {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Project</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search projects by title..."
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
          <div className="form-group full"><label>Description *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={4} /></div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>

          <h3 className="section-title">Media</h3>
          <div className="form-group full"><label>Cover Image</label><ImageUpload value={form.image} onChange={v => set('image', v)} folder="projects" /></div>

          <div className="form-group full">
            <label>Gallery Images</label>
            {form.galleryImages.map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <ImageUpload value={img} onChange={v => updateGalleryImage(i, v)} folder="projects" />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeGalleryImage(i)}><FiX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={addGalleryImage}><FiImage /> Add Image</button>
          </div>

          <h3 className="section-title">Highlights</h3>
          {form.highlights.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
              <input value={h.icon} onChange={e => updateHighlight(i, 'icon', e.target.value)} placeholder="Icon class (e.g. bi bi-heart)" />
              <input value={h.title} onChange={e => updateHighlight(i, 'title', e.target.value)} placeholder="Title" />
              <input value={h.description} onChange={e => updateHighlight(i, 'description', e.target.value)} placeholder="Description" />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeHighlight(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addHighlight}><FiPlus /> Add Highlight</button>

          <h3 className="section-title">Keypoints</h3>
          <div className="form-group"><label>Keypoints Title</label><input value={form.keypoints.title} onChange={e => set('keypoints', { ...form.keypoints, title: e.target.value })} placeholder="e.g. Key Achievements" /></div>
          {form.keypoints.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input value={item} onChange={e => updateKeypoint(i, e.target.value)} placeholder="Keypoint text" style={{ flex: 1 }} />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeKeypoint(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addKeypoint}><FiPlus /> Add Keypoint</button>

          <h3 className="section-title">Stats (Sidebar)</h3>
          {form.stats.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
              <input value={s.number} onChange={e => updateStat(i, 'number', e.target.value)} placeholder="Number (e.g. 5000+)" />
              <input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Label (e.g. Beneficiaries)" />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeStat(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addStat}><FiPlus /> Add Stat</button>

          <h3 className="section-title">Side List (Sidebar)</h3>
          {form.sideList.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
              <input value={s.icon} onChange={e => updateSideList(i, 'icon', e.target.value)} placeholder="Icon class (e.g. bi bi-check-circle-fill)" />
              <input value={s.text} onChange={e => updateSideList(i, 'text', e.target.value)} placeholder="Text" />
              <button type="button" className="btn-icon btn-delete" onClick={() => removeSideList(i)}><FiX /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSideList}><FiPlus /> Add Item</button>

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
      {!loading && data.length === 0 && <p className="empty">No projects yet.</p>}

      {!loading && data.map((item) => (
        <div key={item._id} className="table-container" style={{ marginBottom: '0.75rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {item.image && <img src={getFullUrl(item.image)} alt="project" style={{ height: 55, width: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />}
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>{item.title}</p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '2px 0 0' }}>{item.category || '—'} · <span className={`status-badge ${item.status === 'active' ? 'status-success' : item.status === 'completed' ? 'status-failed' : 'status-pending'}`}>{item.status}</span></p>
                <p style={{ color: 'var(--text-light)', fontSize: '0.78rem', margin: '2px 0 0' }}>{item.description?.substring(0, 80) || ''}...</p>
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

export default Projects;
