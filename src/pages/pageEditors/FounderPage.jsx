import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import ImageUpload from '../../components/ImageUpload';

const SLUG = 'founder-message';

const FounderPage = () => {
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
            slug: SLUG, title: 'Founder Message', breadcrumbTitle: 'Founder',
            content: { tag: '', title: '', titleGradient: '', paragraphs: [], mission: '', vision: '', stats: [] },
            founderData: { name: '', photo: '', designation: '', message: '', quote: '' }
          });
          setData(res.data.data);
        } catch { setMsg('Failed to create founder page.'); }
      })
      .finally(() => setLoading(false));
  }, []);

  const setContent = (key, val) => setData(p => ({ ...p, content: { ...p.content, [key]: val } }));
  const setFounderData = (key, val) => setData(p => ({ ...p, founderData: { ...p.founderData, [key]: val } }));

  const updatePara = (i, v) => { const a = [...(data.content?.paragraphs || [])]; a[i] = v; setContent('paragraphs', a); };
  const addPara = () => setContent('paragraphs', [...(data.content?.paragraphs || []), '']);
  const removePara = (i) => setContent('paragraphs', (data.content?.paragraphs || []).filter((_, x) => x !== i));

  const updateStat = (i, k, v) => { const a = [...(data.content?.stats || [])]; a[i] = { ...a[i], [k]: v }; setContent('stats', a); };
  const addStat = () => setContent('stats', [...(data.content?.stats || []), { value: '', label: '' }]);
  const removeStat = (i) => setContent('stats', (data.content?.stats || []).filter((_, x) => x !== i));

  const handleSave = async () => {
    setSaving(true);
    try { await api.put(`/pages/${SLUG}`, data); setMsg('Saved!'); }
    catch { setMsg('Save failed.'); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!data) return <div className="alert alert-error">{msg || 'Page not found.'}</div>;

  const c = data.content || {};
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Founder Page Editor</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save'}</button>
      </div>
      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
      <div className="site-settings-form">
        <h3 className="section-title">Section Labels</h3>
        <div className="form-group"><label>Tag Text</label><input value={c.tag || ''} onChange={e => setContent('tag', e.target.value)} placeholder="Founder Message" /></div>
        <div className="form-group"><label>Title</label><input value={c.title || ''} onChange={e => setContent('title', e.target.value)} placeholder="A Vision That Builds" /></div>
        <div className="form-group"><label>Title Gradient Part</label><input value={c.titleGradient || ''} onChange={e => setContent('titleGradient', e.target.value)} placeholder="A Better Tomorrow" /></div>

        <h3 className="section-title">Founder Photo</h3>
        <div className="form-group full">
          <label>Founder Image (Left Side)</label>
          <ImageUpload value={data.founderData?.photo || ''} onChange={v => setFounderData('photo', v)} folder="founder" />
        </div>

        <h3 className="section-title">Message Paragraphs</h3>
        {(c.paragraphs || []).map((p, i) => (
          <div key={i} className="form-group full" style={{ display: 'flex', gap: 8 }}>
            <textarea value={p} onChange={e => updatePara(i, e.target.value)} rows={3} style={{ flex: 1 }} />
            <button type="button" className="btn-icon btn-delete" onClick={() => removePara(i)}><FiTrash2 /></button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addPara} style={{ marginBottom: 16 }}><FiPlus /> Add Paragraph</button>

        <h3 className="section-title">Mission & Vision Text</h3>
        <div className="form-group full"><label>Mission Text</label><textarea value={c.mission || ''} onChange={e => setContent('mission', e.target.value)} rows={3} placeholder="Mission statement..." /></div>
        <div className="form-group full"><label>Vision Text</label><textarea value={c.vision || ''} onChange={e => setContent('vision', e.target.value)} rows={3} placeholder="Vision statement..." /></div>

        <h3 className="section-title">Founder Details</h3>
        <div className="form-group"><label>Founder Name</label><input value={data.founderData?.name || ''} onChange={e => setFounderData('name', e.target.value)} placeholder="Founder Name" /></div>
        <div className="form-group"><label>Designation</label><input value={data.founderData?.designation || ''} onChange={e => setFounderData('designation', e.target.value)} placeholder="Founder, Kilkari Care Foundation" /></div>
        <div className="form-group full"><label>Founder Quote/Message</label><textarea value={data.founderData?.message || ''} onChange={e => setFounderData('message', e.target.value)} rows={4} placeholder="Founder's message..." /></div>
        <div className="form-group full"><label>Quote Text (small text)</label><input value={data.founderData?.quote || ''} onChange={e => setFounderData('quote', e.target.value)} placeholder="With gratitude" /></div>

        <h3 className="section-title">Impact Stats</h3>
        {(c.stats || []).map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="e.g. 5000+" style={{ flex: 1 }} />
            <input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="e.g. PEOPLES IMPACTED" style={{ flex: 2 }} />
            <button type="button" className="btn-icon btn-delete" onClick={() => removeStat(i)}><FiTrash2 /></button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addStat}><FiPlus /> Add Stat</button>
      </div>
    </div>
  );
};

export default FounderPage;
