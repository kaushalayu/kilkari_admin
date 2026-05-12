import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiImage } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '',
  author: { name: '', photo: '', bio: '', socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' } },
  category: '',
  featuredImage: '',
  excerpt: '',
  content: '',
  description: [''],
  galleryImages: [],
  tags: '',
  isPublished: true,
};

const Blogs = () => {
  const { data, loading, error, create, update, remove, getIdentifier, total, fetchAll } = useCRUD('blogs', true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);   // stores slug for slug-based routes
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setMsg(''); };

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      author: {
        name: item.author?.name || '',
        photo: item.author?.photo || '',
        bio: item.author?.bio || '',
        socialLinks: {
          facebook: item.author?.socialLinks?.facebook || '',
          twitter: item.author?.socialLinks?.twitter || '',
          instagram: item.author?.socialLinks?.instagram || '',
          linkedin: item.author?.socialLinks?.linkedin || '',
        }
      },
      description: item.description?.length ? item.description : (item.content ? item.content.split('\n').filter(p => p.trim()) : ['']),
      galleryImages: item.galleryImages || [],
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
    setEditId(item.slug);   // use slug as identifier
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const updateDesc = (i, v) => { const a = [...form.description]; a[i] = v; set('description', a); };
  const addDesc = () => set('description', [...form.description, '']);
  const removeDesc = (i) => set('description', form.description.filter((_, x) => x !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagsArr = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const body = { ...form, description: form.description.filter(p => p.trim()), tags: tagsArr };
      if (editId) await update(editId, body);   // editId = slug
      else await create(body);
      setMsg(editId ? 'Updated!' : 'Created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this blog?')) return;
    try { await remove(item.slug); setMsg('Deleted!'); setTimeout(() => setMsg(''), 3000); }
    catch { setMsg('Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Blogs {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Blog</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search blogs by title, content..."
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
          <h3 className="section-title"><FiImage /> Basic Info</h3>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Blog title" /></div>
          <div className="form-group"><label>Category</label><input value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Health & Nutrition" /></div>
          <div className="form-group full"><label>Tags (comma separated)</label><input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. Nutrition, Health, Education" /></div>
          <div className="form-group full"><label>Excerpt</label><textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} placeholder="Brief summary shown on listing page..." /></div>

          <h3 className="section-title">Author Details</h3>
          <div className="form-group"><label>Author Name</label><input value={form.author?.name || ''} onChange={e => set('author', { ...form.author, name: e.target.value })} placeholder="e.g. Kilkari Team" /></div>
          <div className="form-group"><label>Author Photo</label><ImageUpload value={form.author?.photo || ''} onChange={v => set('author', { ...form.author, photo: v })} folder="authors" /></div>
          <div className="form-group full"><label>Author Bio</label><textarea value={form.author?.bio || ''} onChange={e => set('author', { ...form.author, bio: e.target.value })} rows={2} placeholder="Short bio..." /></div>
          <div className="form-group"><label>Facebook</label><input value={form.author?.socialLinks?.facebook || ''} onChange={e => set('author', { ...form.author, socialLinks: { ...form.author.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/..." /></div>
          <div className="form-group"><label>Twitter</label><input value={form.author?.socialLinks?.twitter || ''} onChange={e => set('author', { ...form.author, socialLinks: { ...form.author.socialLinks, twitter: e.target.value } })} placeholder="https://twitter.com/..." /></div>
          <div className="form-group"><label>Instagram</label><input value={form.author?.socialLinks?.instagram || ''} onChange={e => set('author', { ...form.author, socialLinks: { ...form.author.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/..." /></div>
          <div className="form-group"><label>LinkedIn</label><input value={form.author?.socialLinks?.linkedin || ''} onChange={e => set('author', { ...form.author, socialLinks: { ...form.author.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/..." /></div>

          <h3 className="section-title">Media</h3>
          <div className="form-group full"><label>Featured Image</label><ImageUpload value={form.featuredImage} onChange={v => set('featuredImage', v)} folder="blogs" /></div>

          <div className="form-group full">
            <label>Description Paragraphs</label>
            {form.description.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <textarea value={p} onChange={e => updateDesc(i, e.target.value)} rows={2} style={{ flex: 1 }} placeholder={`Paragraph ${i + 1}`} />
                <button type="button" className="btn-icon btn-delete" onClick={() => removeDesc(i)}><FiX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addDesc}><FiPlus /> Add Paragraph</button>
          </div>

          <div className="form-group full">
            <label>Gallery Images</label>
            {(form.galleryImages || []).map((img, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}><ImageUpload value={img} onChange={v => { const a = [...form.galleryImages]; a[idx] = v; set('galleryImages', a); }} folder="blogs" /></div>
                <button type="button" className="btn-icon btn-delete" onClick={() => set('galleryImages', form.galleryImages.filter((_, i) => i !== idx))}><FiX /></button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => set('galleryImages', [...(form.galleryImages || []), ''])}><FiPlus /> Add Image</button>
          </div>

          <div className="form-group full"><label>Full Content (HTML supported)</label><textarea value={form.content} onChange={e => set('content', e.target.value)} rows={6} placeholder="Full blog content..." /></div>

          <div className="form-group">
            <label>Published</label>
            <select value={String(form.isPublished)} onChange={e => set('isPublished', e.target.value === 'true')}>
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
      {!loading && data.length === 0 && <p className="empty">No blogs yet.</p>}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <div className="table-scroll-wrap">
            <table className="data-table">
              <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.map(item => (
                  <tr key={item._id}>
                    <td>{item.featuredImage ? <img src={getFullUrl(item.featuredImage)} alt="blog" style={{ height: 40, width: 60, objectFit: 'cover', borderRadius: 4 }} /> : '—'}</td>
                    <td>{item.title}</td>
                    <td>{item.category || '—'}</td>
                    <td>{item.author?.name || item.author || '—'}</td>
                    <td><span className={`status-badge ${item.isPublished ? 'status-success' : 'status-failed'}`}>{item.isPublished ? 'Published' : 'Draft'}</span></td>
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

export default Blogs;
