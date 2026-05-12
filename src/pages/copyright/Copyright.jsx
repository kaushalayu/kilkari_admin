import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiPlus, FiTrash2, FiEdit3 } from 'react-icons/fi';

const Copyright = () => {
  const [data, setData] = useState({
    text: 'All Rights Copyright © {year} Reserved By {company}',
    year: '',
    companyName: 'Kilkari Care Foundation',
    designedBy: 'Axsem Softwares',
    designedByUrl: 'https://axsemsoftwares.com/',
    showDesignedBy: true,
    links: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/copyright')
      .then(res => { if (res.data.data) setData(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const addLink = () => setData(prev => ({ ...prev, links: [...(prev.links || []), { label: '', url: '' }] }));
  const removeLink = (i) => setData(prev => ({ ...prev, links: prev.links.filter((_, x) => x !== i) }));
  const updateLink = (i, key, value) => {
    const links = [...(data.links || [])];
    links[i] = { ...links[i], [key]: value };
    setData(prev => ({ ...prev, links }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/copyright', data);
      setMsg({ type: 'success', text: 'Copyright settings saved!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const previewText = () => {
    const year = data.year || new Date().getFullYear();
    return (data.text || '')
      .replace('{year}', year)
      .replace('{company}', data.companyName || '');
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Copyright Settings</h1>
          <p className="page-subtitle">Manage the footer copyright text shown across the admin panel and website.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`}>
          {msg.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Copyright Text */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiEdit3 /> Copyright Text</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Copyright Text</label>
              <input
                className="form-control"
                value={data.text || ''}
                onChange={e => handleChange('text', e.target.value)}
                placeholder="All Rights Copyright © {year} Reserved By {company}"
              />
              <small className="form-hint">
                Use <code>{'{year}'}</code> for auto year and <code>{'{company}'}</code> for company name.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  className="form-control"
                  value={data.companyName || ''}
                  onChange={e => handleChange('companyName', e.target.value)}
                  placeholder="Kilkari Care Foundation"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Year (leave blank for auto)</label>
                <input
                  className="form-control"
                  value={data.year || ''}
                  onChange={e => handleChange('year', e.target.value)}
                  placeholder={String(new Date().getFullYear())}
                />
              </div>
            </div>

            <div className="preview-box">
              <span className="preview-label">Preview:</span>
              <span className="preview-text">{previewText()}</span>
            </div>
          </div>
        </div>

        {/* Designed By */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Designed By</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={data.showDesignedBy ?? true}
                  onChange={e => handleChange('showDesignedBy', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Show "Designed By" credit
              </label>
            </div>
            {data.showDesignedBy && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designer / Agency Name</label>
                  <input
                    className="form-control"
                    value={data.designedBy || ''}
                    onChange={e => handleChange('designedBy', e.target.value)}
                    placeholder="Axsem Softwares"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input
                    className="form-control"
                    value={data.designedByUrl || ''}
                    onChange={e => handleChange('designedByUrl', e.target.value)}
                    placeholder="https://axsemsoftwares.com/"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Footer Links</h3>
            <button className="btn btn-sm btn-outline" onClick={addLink}>
              <FiPlus /> Add Link
            </button>
          </div>
          <div className="card-body">
            {(!data.links || data.links.length === 0) && (
              <p className="empty-state-sm">No footer links added yet.</p>
            )}
            {(data.links || []).map((link, i) => (
              <div key={i} className="form-row form-row-with-delete">
                <div className="form-group">
                  <label className="form-label">Label</label>
                  <input
                    className="form-control"
                    value={link.label || ''}
                    onChange={e => updateLink(i, 'label', e.target.value)}
                    placeholder="Privacy Policy"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL</label>
                  <input
                    className="form-control"
                    value={link.url || ''}
                    onChange={e => updateLink(i, 'url', e.target.value)}
                    placeholder="/privacy-policy"
                  />
                </div>
                <button className="btn btn-sm btn-danger-outline btn-icon-only" onClick={() => removeLink(i)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
