import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiSave, FiCheck, FiEyeOff, FiEye, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const FIELD_TYPES = ['text', 'textarea', 'select', 'date', 'number', 'email', 'tel'];
const FIELD_GROUPS = ['Donor Identity', 'Contact Details', 'Address', 'Donation Center', 'Donation Details', 'Other'];

const DEFAULT_NAMES = [
  'donorType','donorName','dob','nationality','country','email','mobile','whatsapp',
  'address','area','city','state','pincode','pan','adhar','amount','purpose',
  'donationType','paymentMode','walletDetails','remark','donationDate','receiptNumber',
  'donationHome','donationCenter'
];

const DonorFieldSettings = () => {
  const [fields, setFields] = useState([]);
  const [originalFields, setOriginalFields] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState({
    fieldName: '', label: '', type: 'text', group: 'Other',
    isRequired: false, isActive: true, color: '#6b7280', order: 0, options: []
  });

  useEffect(() => { fetchFields(); }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donor-field-settings');
      setFields(res.data.data);
      setOriginalFields(JSON.parse(JSON.stringify(res.data.data)));
    } catch {
      setFields([]);
    }
    setLoading(false);
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleChange = (id, key, val) => {
    setFields(p => p.map(f => f._id === id ? { ...f, [key]: val } : f));
  };

  const handleSave = async () => {
    try {
      await api.put('/donor-field-settings/bulk', { fields });
      setOriginalFields(JSON.parse(JSON.stringify(fields)));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      showMsg('success', 'Field settings saved!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Save failed');
    }
  };


  const handleAddField = async () => {
    if (!newField.fieldName.trim() || !newField.label.trim()) {
      return showMsg('error', 'Field name and label are required');
    }
    try {
      const res = await api.post('/donor-field-settings', newField);
      setFields(p => [...p, res.data.data]);
      setShowAddForm(false);
      setNewField({ fieldName: '', label: '', type: 'text', group: 'Other', isRequired: false, isActive: true, color: '#6b7280', order: fields.length + 1, options: [] });
      showMsg('success', 'Field added! Save to persist.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Add failed');
    }
  };

  const handleDeleteField = async (id, fieldName) => {
    if (DEFAULT_NAMES.includes(fieldName)) {
      return showMsg('error', `"${fieldName}" is a default field and cannot be deleted. You can hide it instead.`);
    }
    if (!window.confirm('Delete this custom field? This cannot be undone.')) return;
    try {
      await api.delete(`/donor-field-settings/${id}`);
      setFields(p => p.filter(f => f._id !== id));
      showMsg('success', 'Field deleted');
    } catch {
      showMsg('error', 'Delete failed');
    }
  };

  const hasChanges = JSON.stringify(fields) !== JSON.stringify(originalFields);

  if (loading) return <div className="dm-page"><div className="loading">Loading field settings...</div></div>;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Donor Field Settings</h1>
          <p className="dm-subtitle">Customize fields, colors, visibility, and required status in the donation form</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="dm-btn-outline" onClick={() => setShowAddForm(true)}>
            <FiPlus size={13} /> Add Field
          </button>
          <button className="dm-btn-primary" onClick={handleSave} disabled={!hasChanges}>
            {saved ? <><FiCheck size={13} /> Saved!</> : <><FiSave size={13} /> Save All</>}
          </button>
        </div>
      </div>

      {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}
      {saved && <div className="dm-alert dm-alert-success">All field settings saved!</div>}

      {/* Add Field Modal */}
      {showAddForm && (
        <div className="dm-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">Add New Field</h2>
              <button className="dm-modal-close" onClick={() => setShowAddForm(false)}><FiX /></button>
            </div>
            <div className="dm-modal-body">
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Field Name *</label>
                  <input className="dm-form-input" value={newField.fieldName}
                    onChange={e => setNewField(p => ({ ...p, fieldName: e.target.value }))}
                    placeholder="e.g. occupation" />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Label *</label>
                  <input className="dm-form-input" value={newField.label}
                    onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
                    placeholder="e.g. Occupation" />
                </div>
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Type</label>
                  <select className="dm-form-input" value={newField.type}
                    onChange={e => setNewField(p => ({ ...p, type: e.target.value }))}>
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">Group</label>
                  <select className="dm-form-input" value={newField.group}
                    onChange={e => setNewField(p => ({ ...p, group: e.target.value }))}>
                    {FIELD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="dm-form-row">
                <div className="dm-form-group">
                  <label className="dm-form-label">Color</label>
                  <input type="color" className="dfs-color-input" value={newField.color}
                    onChange={e => setNewField(p => ({ ...p, color: e.target.value }))} />
                </div>
                <div className="dm-form-group">
                  <label className="dm-form-label">
                    <input type="checkbox" checked={newField.isRequired}
                      onChange={e => setNewField(p => ({ ...p, isRequired: e.target.checked }))}
                      style={{ marginRight: '0.4rem' }} />
                    Required
                  </label>
                </div>
              </div>
              {newField.type === 'select' && (
                <div className="dm-form-group">
                  <label className="dm-form-label">Options (comma separated)</label>
                  <input className="dm-form-input" placeholder="opt1, opt2, opt3"
                    onChange={e => setNewField(p => ({ ...p, options: e.target.value.split(',').map(s => s.trim()) }))} />
                </div>
              )}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="dm-btn-primary" onClick={handleAddField}><FiPlus /> Add Field</button>
            </div>
          </div>
        </div>
      )}

      {/* Fields by Group */}
      {FIELD_GROUPS.map(group => {
        const groupFields = fields.filter(f => f.group === group);
        if (groupFields.length === 0) return null;
        return (
          <div key={group} className="dfs-card">
            <div className="dfs-card-title">{group}</div>
            <div className="dfs-fields-grid">
              {groupFields.map(field => {
                const isDefault = DEFAULT_NAMES.includes(field.fieldName);
                return (
                  <div key={field._id} className={`dfs-field-row ${!field.isActive ? 'dfs-field-inactive' : ''}`}>
                    <div className="dfs-field-preview" style={{ borderLeftColor: field.color }}>
                      <span className="dfs-field-label" style={{ color: field.color }}>
                        {field.label} {field.isRequired && <span className="dfs-required-star">*</span>}
                        {isDefault && <span className="dfs-default-badge">default</span>}
                      </span>
                      <div className="dfs-field-meta">
                        <span className="dfs-field-type">{field.type}</span>
                        <span className="dfs-field-name">({field.fieldName})</span>
                      </div>
                    </div>
                    <div className="dfs-controls">
                      {/* Required toggle */}
                      <label className={`dfs-req-toggle ${field.isRequired ? 'active' : ''}`}
                        title={field.isRequired ? 'Required' : 'Optional'}>
                        <input type="checkbox" checked={field.isRequired}
                          onChange={e => handleChange(field._id, 'isRequired', e.target.checked)} />
                        <span>Req</span>
                      </label>

                      <div className="dfs-color-pick">
                        <input type="color" className="dfs-color-input"
                          value={field.color}
                          onChange={e => handleChange(field._id, 'color', e.target.value)} />
                        <input type="text" className="dfs-hex-input"
                          value={field.color}
                          onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleChange(field._id, 'color', e.target.value); }}
                          maxLength={7} />
                      </div>
                      <button className={`dfs-toggle-btn ${field.isActive ? 'active' : ''}`}
                        onClick={() => handleChange(field._id, 'isActive', !field.isActive)}
                        title={field.isActive ? 'Click to hide' : 'Click to show'}>
                        {field.isActive ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                      </button>
                      {!isDefault && (
                        <button className="dfs-delete-btn"
                          onClick={() => handleDeleteField(field._id, field.fieldName)}
                          title="Delete this field">
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DonorFieldSettings;
