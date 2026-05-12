import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiPlus, FiEdit2, FiTrash2, FiStar, FiCopy, FiX, FiSave, FiCheck
} from 'react-icons/fi';

const TYPE_LABELS = {
  donation_receipt: 'Donation Receipt',
  '80g_certificate': '80G Certificate',
  volunteer_id: 'Volunteer ID Card',
  custom: 'Custom'
};

const EMPTY_TEMPLATE = {
  name: '',
  type: 'donation_receipt',
  isDefault: false,
  isActive: true,
  logo: '',
  primaryColor: '#2563eb',
  accentColor: '#1d4ed8',
  fontFamily: 'Helvetica',
  headerTitle: '',
  headerSubtitle: '',
  headerTagline: '',
  showLogo: true,
  documentTitle: '',
  footerLine1: '',
  footerLine2: '',
  footerLine3: '',
  registrationText: '',
  certificationText: '',
  showDonorPAN: true,
  showDonorAddress: true,
  showDonorCity: true,
  showPaymentId: true,
  showPurpose: true,
  showDonationType: true,
  customNote: ''
};

const PdfTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchTemplates = () => {
    setLoading(true);
    const params = filterType ? `?type=${filterType}` : '';
    api.get(`/pdf-templates${params}`)
      .then(res => setTemplates(res.data.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(); }, [filterType]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_TEMPLATE);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setForm({ ...t });
    setEditingId(t._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_TEMPLATE);
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) return showMsg('error', 'Template name is required');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/pdf-templates/${editingId}`, form);
        showMsg('success', 'Template updated!');
      } else {
        await api.post('/pdf-templates', form);
        showMsg('success', 'Template created!');
      }
      closeForm();
      fetchTemplates();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/pdf-templates/${id}/set-default`);
      showMsg('success', 'Default template updated!');
      fetchTemplates();
    } catch {
      showMsg('error', 'Failed to set default');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/pdf-templates/${id}`);
      showMsg('success', 'Template deleted');
      fetchTemplates();
    } catch {
      showMsg('error', 'Failed to delete template');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">PDF & Receipt Templates</h1>
          <p className="page-subtitle">Create and manage templates for donation receipts, 80G certificates, and more.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> New Template
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter */}
      <div className="filter-bar">
        <select className="form-control form-control-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Template List */}
      {loading ? (
        <p className="loading">Loading templates...</p>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <FiCopy size={40} />
          <p>No templates yet. Create your first template.</p>
          <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Create Template</button>
        </div>
      ) : (
        <div className="template-grid">
          {templates.map(t => (
            <div key={t._id} className={`template-card ${!t.isActive ? 'template-inactive' : ''}`}>
              <div className="template-card-header">
                <div className="template-type-badge" style={{ background: t.primaryColor + '22', color: t.primaryColor }}>
                  {TYPE_LABELS[t.type] || t.type}
                </div>
                {t.isDefault && (
                  <span className="badge badge-success"><FiStar size={10} /> Default</span>
                )}
                {!t.isActive && <span className="badge badge-warning">Inactive</span>}
              </div>
              <h3 className="template-name">{t.name}</h3>
              <p className="template-meta">{t.headerTitle || '—'}</p>
              <div className="template-colors">
                <span className="color-dot" style={{ background: t.primaryColor }} title={t.primaryColor} />
                <span className="color-dot" style={{ background: t.accentColor }} title={t.accentColor} />
                <span className="template-font">{t.fontFamily}</span>
              </div>
              <div className="template-actions">
                {!t.isDefault && (
                  <button className="btn btn-sm btn-outline" onClick={() => handleSetDefault(t._id)} title="Set as default">
                    <FiStar /> Set Default
                  </button>
                )}
                <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}>
                  <FiEdit2 /> Edit
                </button>
                <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(t._id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Template' : 'New Template'}</h2>
              <button className="modal-close" onClick={closeForm}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Template Name *</label>
                  <input className="form-control" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Standard Receipt 2025" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select className="form-control" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section-title">Branding</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-input-row">
                    <input type="color" className="color-picker" value={form.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                    <input className="form-control" value={form.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div className="color-input-row">
                    <input type="color" className="color-picker" value={form.accentColor} onChange={e => handleChange('accentColor', e.target.value)} />
                    <input className="form-control" value={form.accentColor} onChange={e => handleChange('accentColor', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Font Family</label>
                  <select className="form-control" value={form.fontFamily} onChange={e => handleChange('fontFamily', e.target.value)}>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times-Roman">Times Roman</option>
                    <option value="Courier">Courier</option>
                  </select>
                </div>
              </div>

              <div className="form-section-title">Header</div>
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input className="form-control" value={form.headerTitle} onChange={e => handleChange('headerTitle', e.target.value)} placeholder="Kilkari Care Foundation" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address / Subtitle</label>
                  <input className="form-control" value={form.headerSubtitle} onChange={e => handleChange('headerSubtitle', e.target.value)} placeholder="S-522 School Block Shakarpur..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline / Certification</label>
                  <input className="form-control" value={form.headerTagline} onChange={e => handleChange('headerTagline', e.target.value)} placeholder="80G & 12A Certified" />
                </div>
              </div>

              <div className="form-section-title">Document</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Document Title</label>
                  <input className="form-control" value={form.documentTitle} onChange={e => handleChange('documentTitle', e.target.value)} placeholder="DONATION RECEIPT" />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Text</label>
                  <input className="form-control" value={form.registrationText} onChange={e => handleChange('registrationText', e.target.value)} placeholder="Reg. No: 1823/2017" />
                </div>
              </div>

              <div className="form-section-title">Footer Lines</div>
              <div className="form-group">
                <input className="form-control" value={form.footerLine1} onChange={e => handleChange('footerLine1', e.target.value)} placeholder="Footer line 1" />
              </div>
              <div className="form-group">
                <input className="form-control" value={form.footerLine2} onChange={e => handleChange('footerLine2', e.target.value)} placeholder="Footer line 2" />
              </div>
              <div className="form-group">
                <input className="form-control" value={form.footerLine3} onChange={e => handleChange('footerLine3', e.target.value)} placeholder="Footer line 3" />
              </div>

              <div className="form-section-title">Fields to Show</div>
              <div className="checkbox-grid">
                {[
                  ['showDonorPAN', 'Donor PAN'],
                  ['showDonorAddress', 'Donor Address'],
                  ['showDonorCity', 'Donor City'],
                  ['showPaymentId', 'Payment ID'],
                  ['showPurpose', 'Purpose'],
                  ['showDonationType', 'Donation Type'],
                  ['showLogo', 'Show Logo'],
                ].map(([key, label]) => (
                  <label key={key} className="checkbox-label">
                    <input type="checkbox" checked={form[key] ?? true} onChange={e => handleChange(key, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="form-section-title">Custom Note</div>
              <div className="form-group">
                <textarea className="form-control" rows={3} value={form.customNote} onChange={e => handleChange('customNote', e.target.value)} placeholder="Optional note printed at the bottom of the document..." />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isDefault} onChange={e => handleChange('isDefault', e.target.checked)} />
                  Set as default template for this type
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} />
                  Active
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfTemplates;
