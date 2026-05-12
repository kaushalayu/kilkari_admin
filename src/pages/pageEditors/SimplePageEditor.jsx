import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

/**
 * Generic simple page editor for pages that only need heading + paragraphs + highlights
 * Used for: Contact, Donate, Join Us
 */
const SimplePageEditor = ({ slug, title }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/pages/${slug}`)
      .then(res => setData(res.data.data))
      .catch(async () => {
        try {
          const res = await api.post('/pages', { slug, title, content: { heading: '', paragraphs: [], highlights: [] } });
          setData(res.data.data);
        } catch {
          setMsg(`Failed to create "${slug}" page.`);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const setContent = (key, val) => setData(p => ({ ...p, content: { ...p.content, [key]: val } }));

  const updatePara = (i, v) => { const a = [...(data.content?.paragraphs || [])]; a[i] = v; setContent('paragraphs', a); };
  const addPara = () => setContent('paragraphs', [...(data.content?.paragraphs || []), '']);
  const removePara = (i) => setContent('paragraphs', (data.content?.paragraphs || []).filter((_, x) => x !== i));

  const updateHL = (i, k, v) => { const a = [...(data.content?.highlights || [])]; a[i] = { ...a[i], [k]: v }; setContent('highlights', a); };
  const addHL = () => setContent('highlights', [...(data.content?.highlights || []), { icon: '', title: '', description: '' }]);
  const removeHL = (i) => setContent('highlights', (data.content?.highlights || []).filter((_, x) => x !== i));

  const handleSave = async () => {
    setSaving(true);
    try { await api.put(`/pages/${slug}`, data); setMsg('Saved successfully!'); }
    catch { setMsg('Save failed.'); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!data) return <div className="alert alert-error">{msg || 'Page not found.'}</div>;

  const c = data.content || {};
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{title} Editor</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save'}</button>
      </div>
      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
      <div className="site-settings-form">
        <h3 className="section-title">Heading</h3>
        <div className="form-group full"><label>Section Heading</label><input value={c.heading || ''} onChange={e => setContent('heading', e.target.value)} placeholder="Section heading..." /></div>

        <h3 className="section-title">Paragraphs / Description</h3>
        {(c.paragraphs || []).map((p, i) => (
          <div key={i} className="form-group full" style={{ display: 'flex', gap: 8 }}>
            <textarea value={p} onChange={e => updatePara(i, e.target.value)} rows={3} style={{ flex: 1 }} placeholder={`Paragraph ${i + 1}`} />
            <button type="button" className="btn-icon btn-delete" onClick={() => removePara(i)}><FiTrash2 /></button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addPara} style={{ marginBottom: 16 }}><FiPlus /> Add Paragraph</button>

        <h3 className="section-title">Highlights / Feature Cards</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Icon: Bootstrap Icons class e.g. <code>bi bi-heart-fill</code></p>
        {(c.highlights || []).map((h, i) => (
          <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.82rem' }}>Card {i + 1}</strong>
              <button type="button" className="btn-icon btn-delete" onClick={() => removeHL(i)}><FiTrash2 /></button>
            </div>
            <div className="form-group"><label>Icon</label><input value={h.icon || ''} onChange={e => updateHL(i, 'icon', e.target.value)} placeholder="bi bi-heart-fill" /></div>
            <div className="form-group"><label>Title</label><input value={h.title || ''} onChange={e => updateHL(i, 'title', e.target.value)} /></div>
            <div className="form-group full"><label>Description</label><textarea value={h.description || ''} onChange={e => updateHL(i, 'description', e.target.value)} rows={2} /></div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addHL}><FiPlus /> Add Card</button>
      </div>
    </div>
  );
};

export default SimplePageEditor;
