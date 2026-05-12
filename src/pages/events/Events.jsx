import { useState } from 'react';
import useCRUD from '@api/useCRUD';
import { FiPlus, FiX, FiSave, FiCalendar, FiEdit2, FiTrash2, FiImage, FiFile, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';
import FileUpload from '../../components/FileUpload';
import { getFullUrl } from '../../api/client';

const emptyForm = {
  title: '', heading: '', sectionTag: '', breadcrumbTitle: '',
  description: [''],
  image: '',
  date: '',
  status: 'upcoming',
  galleryImages: [],
  highlights: [],
  keypoints: { title: '', items: [''] },
  stats: [],
  sideList: [],
  whatsappNumber: '', phoneNumber: '', pdfUrl: '',
  isActive: true,
};

const Events = () => {
  const { data, loading, create, update, remove, total, fetchAll } = useCRUD('events', true);
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState(null);   // stores slug
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [activeSection, setActiveSection] = useState('basic');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openEdit = (item) => {
    setForm({
      ...emptyForm, ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      description: item.description?.length ? item.description : [''],
      galleryImages: item.galleryImages || [],
      highlights: item.highlights || [],
      keypoints: item.keypoints || { title: '', items: [''] },
      stats: item.stats || [],
      sideList: item.sideList || [],
    });
    setEditId(item.slug);   // use slug
    setShowForm(true);
    setActiveSection('basic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setActiveSection('basic'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.date) delete body.date;
      if (editId) await update(editId, body);   // editId = slug
      else await create(body);
      setMsg(editId ? 'Event updated!' : 'Event created!');
      setTimeout(() => setMsg(''), 3000);
      reset();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this event?')) return;
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

  const updateDesc = (i, v) => { const a = [...form.description]; a[i] = v; set('description', a); };
  const addDesc = () => set('description', [...form.description, '']);
  const removeDesc = (i) => set('description', form.description.filter((_, x) => x !== i));

  const updateGallery = (i, v) => { const a = [...form.galleryImages]; a[i] = v; set('galleryImages', a); };
  const addGallery = () => set('galleryImages', [...form.galleryImages, '']);
  const removeGallery = (i) => set('galleryImages', form.galleryImages.filter((_, x) => x !== i));

  const updateHL = (i, k, v) => { const a = [...form.highlights]; a[i] = { ...a[i], [k]: v }; set('highlights', a); };
  const addHL = () => set('highlights', [...form.highlights, { icon: '', title: '', description: '' }]);
  const removeHL = (i) => set('highlights', form.highlights.filter((_, x) => x !== i));

  const updateStat = (i, k, v) => { const a = [...form.stats]; a[i] = { ...a[i], [k]: v }; set('stats', a); };
  const addStat = () => set('stats', [...form.stats, { number: '', label: '' }]);
  const removeStat = (i) => set('stats', form.stats.filter((_, x) => x !== i));

  const updateSide = (i, k, v) => { const a = [...form.sideList]; a[i] = { ...a[i], [k]: v }; set('sideList', a); };
  const addSide = () => set('sideList', [...form.sideList, { icon: '', text: '' }]);
  const removeSide = (i) => set('sideList', form.sideList.filter((_, x) => x !== i));

  const updateKP = (i, v) => { const items = [...(form.keypoints?.items || [])]; items[i] = v; set('keypoints', { ...form.keypoints, items }); };
  const addKP = () => set('keypoints', { ...form.keypoints, items: [...(form.keypoints?.items || []), ''] });
  const removeKP = (i) => set('keypoints', { ...form.keypoints, items: (form.keypoints?.items || []).filter((_, x) => x !== i) });

  const toggleExpand = (id) => setExpandedItems(p => ({ ...p, [id]: !p[id] }));

  const statusBadge = (status) => {
    const map = { active: 'status-success', completed: 'status-failed', upcoming: 'status-pending' };
    return <span className={`status-badge ${map[status] || 'status-pending'}`}>{status}</span>;
  };

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'media', label: 'Media' },
    { id: 'content', label: 'Content Blocks' },
    { id: 'contact', label: 'Contact & Settings' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Events {total > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-dim)' }}>({total} total)</span>}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0.15rem 0 0' }}>Manage health camps, drives, and community events</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if (showForm) reset(); }}>
          {showForm ? <><FiX /> Close</> : <><FiPlus /> Add Event</>}
        </button>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search events by title..."
            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Search</button>
          {search && <button type="button" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={clearSearch}><FiX /> Clear</button>}
        </form>
      )}
      {search && <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>Showing results for: <strong>"{search}"</strong></p>}

      {msg && <div className={`alert ${msg.toLowerCase().includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {/* ── Form ────────────────────────────────────────────── */}
      {showForm && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {sections.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid ' + (activeSection === s.id ? 'var(--primary)' : 'var(--border)'),
                  background: activeSection === s.id ? 'var(--primary-bg)' : 'var(--bg-card)',
                  color: activeSection === s.id ? 'var(--primary)' : 'var(--text-dim)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'inherit',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <form className="crud-form" onSubmit={handleSubmit}>
            {activeSection === 'basic' && (
              <>
                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Free Health Camp Delhi" /></div>
                <div className="form-group"><label>Sub Heading *</label><input value={form.heading} onChange={e => set('heading', e.target.value)} required placeholder="Short headline for detail page" /></div>
                <div className="form-group"><label>Section Tag</label><input value={form.sectionTag} onChange={e => set('sectionTag', e.target.value)} placeholder="e.g. Health Camp" /></div>
                <div className="form-group"><label>Breadcrumb Title</label><input value={form.breadcrumbTitle} onChange={e => set('breadcrumbTitle', e.target.value)} placeholder="Custom breadcrumb text" /></div>
                <div className="form-group"><label>Event Date</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group full"><label>Description</label>
                  {form.description.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <textarea value={p} onChange={e => updateDesc(i, e.target.value)} rows={2} style={{ flex: 1 }} placeholder={`Paragraph ${i + 1}`} />
                      <button type="button" className="btn-icon btn-delete" onClick={() => removeDesc(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addDesc}><FiPlus /> Add Paragraph</button>
                </div>
              </>
            )}

            {activeSection === 'media' && (
              <>
                <div className="form-group full"><label>Cover Image</label><ImageUpload value={form.image} onChange={v => set('image', v)} folder="events" /></div>
                <div className="form-group full"><label>Gallery Images</label>
                  {form.galleryImages.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>No images added yet.</p>}
                  {form.galleryImages.map((img, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', width: '20px' }}>{i + 1}</span>
                      <div style={{ flex: 1 }}><ImageUpload value={img} onChange={v => updateGallery(i, v)} folder="events" /></div>
                      <button type="button" className="btn-icon btn-delete" onClick={() => removeGallery(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addGallery}><FiPlus /> Add Image</button>
                </div>
                <div className="form-group full"><label>PDF Document</label><FileUpload value={form.pdfUrl} onChange={v => set('pdfUrl', v)} folder="events" accept=".pdf" /></div>
              </>
            )}

            {activeSection === 'content' && (
              <>
                <div className="form-group full"><label style={{ marginBottom: '0.5rem', display: 'block' }}>Highlights <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(icon cards on detail page)</span></label>
                  {form.highlights.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>No highlights added yet.</p>}
                  {form.highlights.map((h, i) => (
                    <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>Highlight {i + 1}</span>
                        <button type="button" className="btn-icon btn-delete" onClick={() => removeHL(i)}><FiX /></button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <input value={h.icon} onChange={e => updateHL(i, 'icon', e.target.value)} placeholder="Icon class" />
                        <input value={h.title} onChange={e => updateHL(i, 'title', e.target.value)} placeholder="Title" />
                        <input value={h.description} onChange={e => updateHL(i, 'description', e.target.value)} placeholder="Description" />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addHL}><FiPlus /> Add Highlight</button>
                </div>

                <div className="form-group full"><label style={{ marginBottom: '0.5rem', display: 'block' }}>Stats <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(sidebar numbers)</span></label>
                  {form.stats.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input value={s.number} onChange={e => updateStat(i, 'number', e.target.value)} placeholder="e.g. 500+" style={{ flex: 1 }} />
                      <input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="e.g. Patients Treated" style={{ flex: 2 }} />
                      <button type="button" className="btn-icon btn-delete" onClick={() => removeStat(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addStat}><FiPlus /> Add Stat</button>
                </div>

                <div className="form-group full"><label style={{ marginBottom: '0.5rem', display: 'block' }}>Side List <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(sidebar checklist)</span></label>
                  {form.sideList.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input value={s.icon} onChange={e => updateSide(i, 'icon', e.target.value)} placeholder="Icon" style={{ flex: 1 }} />
                      <input value={s.text} onChange={e => updateSide(i, 'text', e.target.value)} placeholder="Text" style={{ flex: 3 }} />
                      <button type="button" className="btn-icon btn-delete" onClick={() => removeSide(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addSide}><FiPlus /> Add Item</button>
                </div>

                <div className="form-group"><label>Keypoints Title</label><input value={form.keypoints?.title || ''} onChange={e => set('keypoints', { ...form.keypoints, title: e.target.value })} placeholder="e.g. Key Achievements" /></div>
                <div className="form-group full"><label>Keypoints Items</label>
                  {(form.keypoints?.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input value={item} onChange={e => updateKP(i, e.target.value)} placeholder={`Point ${i + 1}`} style={{ flex: 1 }} />
                      <button type="button" className="btn-icon btn-delete" onClick={() => removeKP(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary" onClick={addKP}><FiPlus /> Add Point</button>
                </div>
              </>
            )}

            {activeSection === 'contact' && (
              <>
                <div className="form-group"><label>WhatsApp Number</label><input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="919873336611" /></div>
                <div className="form-group"><label>Phone Number</label><input value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+91-98733-36611" /></div>
                <div className="form-group"><label>Active</label>
                  <select value={String(form.isActive)} onChange={e => set('isActive', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}><FiSave /> {saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>
            </div>
          </form>
        </>
      )}

      {/* ── Event Cards List ───────────────────────────────── */}
      {loading && <div className="loading">Loading events...</div>}
      {!loading && data.length === 0 && !showForm && <p className="empty">No events yet. Click "Add Event" to create one.</p>}

      {!loading && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {data.map((item) => {
            const expanded = expandedItems[item._id];
            return (
              <div key={item._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => toggleExpand(item._id)}>
                  {item.image ? (
                    <img src={getFullUrl(item.image)} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 64, height: 48, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-light)' }}>
                      <FiCalendar style={{ width: 18, height: 18 }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0, fontSize: '0.88rem' }}>{item.title}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                      {item.sectionTag && <span>{item.sectionTag} · </span>}
                      {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                    {statusBadge(item.status)}
                    {expanded ? <FiChevronUp style={{ color: 'var(--text-light)', width: 16, height: 16 }} /> : <FiChevronDown style={{ color: 'var(--text-light)', width: 16, height: 16 }} />}
                  </div>
                </div>

                {expanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '0.85rem 1.15rem', background: 'var(--bg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.65rem', marginBottom: '0.85rem', fontSize: '0.82rem' }}>
                      <div><span style={{ color: 'var(--text-light)', fontSize: '0.72rem', display: 'block' }}>Images</span>{item.galleryImages?.length || 0}</div>
                      <div><span style={{ color: 'var(--text-light)', fontSize: '0.72rem', display: 'block' }}>Highlights</span>{item.highlights?.length || 0}</div>
                      <div><span style={{ color: 'var(--text-light)', fontSize: '0.72rem', display: 'block' }}>Stats</span>{item.stats?.length || 0}</div>
                      <div><span style={{ color: 'var(--text-light)', fontSize: '0.72rem', display: 'block' }}>Active</span>{item.isActive ? 'Yes' : 'No'}</div>
                    </div>
                    {item.description?.length > 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '0 0 0.65rem', lineHeight: 1.5 }}>
                        {item.description[0]?.substring(0, 120)}{item.description[0]?.length > 120 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-icon btn-edit" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit"><FiEdit2 /></button>
                      <button className="btn-icon btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(item); }} title="Delete"><FiTrash2 /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
