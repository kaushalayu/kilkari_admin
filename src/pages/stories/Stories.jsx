import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import FileUpload from '../../components/FileUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '', heading: '', sectionTag: '',
  featuredImage: '',
  description: [''],
  galleryImages: [],
  highlights: [],
  keypoints: { title: '', items: [''] },
  stats: [],
  sideList: [],
  whatsappNumber: '', phoneNumber: '', pdfUrl: '', isActive: true,
};

const Stories = () => {
  const { data, loading, error, create, update, remove, total, fetchAll } = useCRUD('stories', true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);   // stores slug
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setMsg(''); };

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      description: item.description?.length ? item.description : [''],
      galleryImages: item.galleryImages || [],
      highlights: item.highlights || [],
      keypoints: item.keypoints || { title: '', items: [''] },
      stats: item.stats || [],
      sideList: item.sideList || [],
    });
    setEditId(item.slug);   // use slug
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // description array helpers
  const updateDesc = (i, v) => { const a = [...form.description]; a[i] = v; set('description', a); };
  const addDesc = () => set('description', [...form.description, '']);
  const removeDesc = (i) => set('description', form.description.filter((_, x) => x !== i));

  // gallery images helpers
  const updateGallery = (i, v) => { const a = [...form.galleryImages]; a[i] = v; set('galleryImages', a); };
  const addGallery = () => set('galleryImages', [...form.galleryImages, '']);
  const removeGallery = (i) => set('galleryImages', form.galleryImages.filter((_, x) => x !== i));

  // highlights helpers
  const updateHL = (i, k, v) => { const a = [...form.highlights]; a[i] = { ...a[i], [k]: v }; set('highlights', a); };
  const addHL = () => set('highlights', [...form.highlights, { icon: '', title: '', description: '' }]);
  const removeHL = (i) => set('highlights', form.highlights.filter((_, x) => x !== i));

  // stats helpers
  const updateStat = (i, k, v) => { const a = [...form.stats]; a[i] = { ...a[i], [k]: v }; set('stats', a); };
  const addStat = () => set('stats', [...form.stats, { number: '', label: '' }]);
  const removeStat = (i) => set('stats', form.stats.filter((_, x) => x !== i));

  // sideList helpers
  const updateSide = (i, k, v) => { const a = [...form.sideList]; a[i] = { ...a[i], [k]: v }; set('sideList', a); };
  const addSide = () => set('sideList', [...form.sideList, { icon: '', text: '' }]);
  const removeSide = (i) => set('sideList', form.sideList.filter((_, x) => x !== i));

  // keypoints helpers
  const updateKP = (i, v) => { const items = [...(form.keypoints?.items || [])]; items[i] = v; set('keypoints', { ...form.keypoints, items }); };
  const addKP = () => set('keypoints', { ...form.keypoints, items: [...(form.keypoints?.items || []), ''] });
  const removeKP = (i) => set('keypoints', { ...form.keypoints, items: (form.keypoints?.items || []).filter((_, x) => x !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await update(editId, form);   // editId = slug
      else await create(form);
      setMsg(editId ? 'Updated!' : 'Created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this story?')) return;
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

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Success Stories {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Story</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search stories by title..."
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
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Story title" /></div>
          <div className="form-group"><label>Section Tag</label><input value={form.sectionTag} onChange={e => set('sectionTag', e.target.value)} placeholder="e.g. Child Education" /></div>
          <div className="form-group full"><label>Sub Heading *</label><input value={form.heading} onChange={e => set('heading', e.target.value)} required placeholder="Short heading shown on listing" /></div>
          
          <div className="form-group full"><label>Featured Image (Main image on detail page)</label><ImageUpload value={form.featuredImage} onChange={v => set('featuredImage', v)} folder="stories" /></div>

          {/* Description paragraphs */}
          <div className="form-group full">
            <label>Description Paragraphs</label>
            {form.description.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <textarea value={p} onChange={e => updateDesc(i, e.target.value)} rows={2} style={{ flex: 1 }} placeholder={`Paragraph ${i + 1}`} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeDesc(i)}><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addDesc}><FiPlus /> Add Paragraph</button>
          </div>

          {/* Gallery Images */}
          <div className="form-group full">
            <label>Gallery Images (first image shown on listing)</label>
            {form.galleryImages.map((img, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <ImageUpload value={img} onChange={v => updateGallery(i, v)} folder="stories" placeholder={`Image ${i + 1}`} />
                </div>
                <button type="button" className="btn-icon btn-delete" onClick={() => removeGallery(i)}><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addGallery}><FiPlus /> Add Image</button>
          </div>

          {/* Highlights */}
          <div className="form-group full">
            <label>Highlights (icon cards on detail page)</label>
            {form.highlights.map((h, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong>Highlight {i + 1}</strong>
                  <button type="button" className="btn-icon btn-delete" onClick={() => removeHL(i)}><FiTrash2 /></button>
                </div>
                <div className="form-group"><label>Icon</label><input value={h.icon} onChange={e => updateHL(i, 'icon', e.target.value)} placeholder="bi bi-heart-fill" /></div>
                <div className="form-group"><label>Title</label><input value={h.title} onChange={e => updateHL(i, 'title', e.target.value)} placeholder="Highlight title" /></div>
                <div className="form-group full"><label>Description</label><textarea value={h.description} onChange={e => updateHL(i, 'description', e.target.value)} rows={2} /></div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addHL}><FiPlus /> Add Highlight</button>
          </div>

          {/* Stats */}
          <div className="form-group full">
            <label>Stats (shown on sidebar)</label>
            {form.stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input value={s.number} onChange={e => updateStat(i, 'number', e.target.value)} placeholder="e.g. 500+" style={{ flex: 1 }} />
                <input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="e.g. Children Helped" style={{ flex: 2 }} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeStat(i)}><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addStat}><FiPlus /> Add Stat</button>
          </div>

          {/* Side List */}
          <div className="form-group full">
            <label>Side List Items</label>
            {form.sideList.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input value={s.icon} onChange={e => updateSide(i, 'icon', e.target.value)} placeholder="bi-patch-check-fill" style={{ flex: 1 }} />
                <input value={s.text} onChange={e => updateSide(i, 'text', e.target.value)} placeholder="List item text" style={{ flex: 3 }} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeSide(i)}><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addSide}><FiPlus /> Add Item</button>
          </div>

          {/* Keypoints */}
          <div className="form-group full">
            <label>Key Points Section</label>
            <input value={form.keypoints?.title || ''} onChange={e => set('keypoints', { ...form.keypoints, title: e.target.value })} placeholder="Section title e.g. How Your Support Helps" style={{ marginBottom: 8 }} />
            {(form.keypoints?.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={item} onChange={e => updateKP(i, e.target.value)} placeholder={`Point ${i + 1}`} style={{ flex: 1 }} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeKP(i)}><FiTrash2 /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addKP}><FiPlus /> Add Point</button>
          </div>

          <div className="form-group"><label>WhatsApp Number</label><input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="919873336611" /></div>
          <div className="form-group"><label>Phone Number</label><input value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+91-98733-36611" /></div>
          <div className="form-group full">
            <label>PDF File</label>
            <FileUpload value={form.pdfUrl} onChange={v => set('pdfUrl', v)} folder="stories" accept=".pdf" />
          </div>
          <div className="form-group">
            <label>Active</label>
            <select value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}><FiSave /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <p className="loading">Loading...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && data.length === 0 && <p className="empty">No stories yet.</p>}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <div className="table-scroll-wrap">
            <table className="data-table">
              <thead><tr><th>Title</th><th>Tag</th><th>Heading</th><th>Images</th><th>Actions</th></tr></thead>
              <tbody>
                {data.map(item => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.sectionTag || '—'}</td>
                    <td>{item.heading?.substring(0, 50)}...</td>
                    <td>{item.galleryImages?.length || 0} images</td>
                    <td className="actions">
                      <button className="btn-icon btn-edit" onClick={() => openEdit(item)} title="Edit"><FiEdit2 /></button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(item)} title="Delete"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
