import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';

const SLUG = 'about-us';

const emptyHighlight = { icon: '', title: '', description: '' };

const AboutPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/pages/${SLUG}`)
      .then(res => setData(res.data.data))
      .catch(async () => {
        try {
          const res = await api.post('/pages', {
            slug: SLUG, title: 'About Us', breadcrumbTitle: 'About Us',
            content: { heading: '', paragraphs: [], images: [], highlights: [] }
          });
          setData(res.data.data);
        } catch { setMsg('Failed to create about page.'); }
      })
      .finally(() => setLoading(false));
  }, []);

  const setContent = (key, value) => {
    setData(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));
  };

  // ── Paragraphs ──────────────────────────────────────────────
  const updateParagraph = (idx, val) => {
    const updated = [...(data.content?.paragraphs || [])];
    updated[idx] = val;
    setContent('paragraphs', updated);
  };
  const addParagraph = () => setContent('paragraphs', [...(data.content?.paragraphs || []), '']);
  const removeParagraph = (idx) => {
    const updated = (data.content?.paragraphs || []).filter((_, i) => i !== idx);
    setContent('paragraphs', updated);
  };

  // ── Images ───────────────────────────────────────────────────
  const updateImage = (idx, val) => {
    const updated = [...(data.content?.images || [])];
    updated[idx] = val;
    setContent('images', updated);
  };
  const addImage = () => setContent('images', [...(data.content?.images || []), '']);
  const removeImage = (idx) => {
    const updated = (data.content?.images || []).filter((_, i) => i !== idx);
    setContent('images', updated);
  };

  // ── Highlights ───────────────────────────────────────────────
  const updateHighlight = (idx, key, val) => {
    const updated = [...(data.content?.highlights || [])];
    updated[idx] = { ...updated[idx], [key]: val };
    setContent('highlights', updated);
  };
  const addHighlight = () => setContent('highlights', [...(data.content?.highlights || []), { ...emptyHighlight }]);
  const removeHighlight = (idx) => {
    const updated = (data.content?.highlights || []).filter((_, i) => i !== idx);
    setContent('highlights', updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/pages/${SLUG}`, data);
      setMsg('About page saved successfully!');
    } catch {
      setMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (loading) return <p className="loading">Loading About Page...</p>;
  if (!data) return <div className="alert alert-error">{msg || 'Failed to load About Page.'}</div>;

  const content = data.content || {};

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">About Page Editor</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {msg && (
        <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {msg}
        </div>
      )}

      <div className="site-settings-form">

        {/* ── Basic Info ── */}
        <h3 className="section-title">Basic Info</h3>
        <div className="form-group">
          <label>Page Title</label>
          <input value={data.title || ''} onChange={e => setData(p => ({ ...p, title: e.target.value }))} placeholder="About Us" />
        </div>
        <div className="form-group">
          <label>Breadcrumb Title</label>
          <input value={data.breadcrumbTitle || ''} onChange={e => setData(p => ({ ...p, breadcrumbTitle: e.target.value }))} placeholder="About Us" />
        </div>

        {/* ── Section Heading ── */}
        <h3 className="section-title">Section Heading (Right side text)</h3>
        <div className="form-group full">
          <label>Heading</label>
          <input value={content.heading || ''} onChange={e => setContent('heading', e.target.value)} placeholder="e.g. We Are Kilkari Care Foundation" />
        </div>

        {/* ── Paragraphs ── */}
        <h3 className="section-title">Paragraphs (Right side text)</h3>
        {(content.paragraphs || []).map((p, idx) => (
          <div key={idx} className="form-group full" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <textarea
              value={p}
              onChange={e => updateParagraph(idx, e.target.value)}
              rows={3}
              placeholder={`Paragraph ${idx + 1}`}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-icon btn-delete" onClick={() => removeParagraph(idx)} title="Remove">
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addParagraph} style={{ marginBottom: '16px' }}>
          <FiPlus /> Add Paragraph
        </button>

        {/* ── Images (4 images grid on left) ── */}
        <h3 className="section-title">Images (Left side — 4 image grid)</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          Website pe left side mein 4 images ka grid dikhta hai. Ideally 4 images upload karein.
        </p>
        {(content.images || []).map((img, idx) => (
          <div key={idx} className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label>Image {idx + 1}</label>
              <ImageUpload
                value={img}
                onChange={val => updateImage(idx, val)}
                folder="about"
                placeholder={`Upload Image ${idx + 1}`}
              />
            </div>
            <button type="button" className="btn-icon btn-delete" onClick={() => removeImage(idx)} title="Remove" style={{ marginTop: '22px' }}>
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addImage} style={{ marginBottom: '16px' }}>
          <FiPlus /> Add Image
        </button>

        {/* ── Highlights / Feature Items ── */}
        <h3 className="section-title">Highlights / Feature Items (Right side icons)</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          Icon ke liye Bootstrap Icons class use karein, e.g. <code>bi bi-check-circle-fill</code>
        </p>
        {(content.highlights || []).map((h, idx) => (
          <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <strong style={{ color: 'var(--text)' }}>Highlight {idx + 1}</strong>
              <button type="button" className="btn-icon btn-delete" onClick={() => removeHighlight(idx)} title="Remove">
                <FiTrash2 />
              </button>
            </div>
            <div className="form-group">
              <label>Icon Class</label>
              <input value={h.icon || ''} onChange={e => updateHighlight(idx, 'icon', e.target.value)} placeholder="bi bi-check-circle-fill" />
            </div>
            <div className="form-group">
              <label>Title</label>
              <input value={h.title || ''} onChange={e => updateHighlight(idx, 'title', e.target.value)} placeholder="e.g. Quality Education" />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea value={h.description || ''} onChange={e => updateHighlight(idx, 'description', e.target.value)} rows={2} placeholder="Short description..." />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addHighlight} style={{ marginBottom: '16px' }}>
          <FiPlus /> Add Highlight
        </button>

      </div>
    </div>
  );
};

export default AboutPage;
