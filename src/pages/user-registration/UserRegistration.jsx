import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiUserPlus, FiSend, FiCheck, FiCopy, FiMail,
  FiShield, FiUsers, FiBriefcase, FiUserCheck
} from 'react-icons/fi';

const ROLE_DESCRIPTIONS = [
  { icon: FiUsers, title: 'Volunteer', desc: 'Can view content and their profile.' },
  { icon: FiBriefcase, title: 'Team', desc: 'Basic view-only access to content.' },
  { icon: FiUserCheck, title: 'Editor', desc: 'Can create and edit content.' },
  { icon: FiShield, title: 'Center Admin', desc: 'Manages a collection center.' },
];

const UserRegistration = () => {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get('/roles').then(res => {
      const data = res.data.data || [];
      setRoles(data.filter(r => r.name !== 'admin'));
      const defaultRole = data.find(r => r.isDefault) || data[0];
      if (defaultRole) setForm(prev => ({ ...prev, role: defaultRole.name }));
    }).catch(() => {});
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.email?.trim()) {
      return showMsg('error', 'Name and email are required');
    }
    setSaving(true);
    setResult(null);
    try {
      const { data } = await api.post('/auth/register-with-email', form);
      setResult(data.data);
      showMsg('success', data.message || 'User created! Password sent to email.');
      setForm({ name: '', email: '', phone: '', role: form.role });
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showMsg('success', 'Copied to clipboard!');
  };

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title"><FiUserPlus /> User Registration</h1>
          <p className="dm-subtitle">Register new users with auto-generated passwords sent via email.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`dm-alert ${msg.type === 'success' ? 'dm-alert-success' : 'dm-alert-error'}`}>
          {msg.text}
        </div>
      )}

      <div className="dm-grid-2">
        <div className="dm-card">
          <div className="dm-card-header">
            <h3 className="dm-card-title"><FiUserPlus /> New User</h3>
          </div>
          <div className="dm-card-body">
            <form onSubmit={handleSubmit}>
              <div className="dm-form-group">
                <label className="dm-form-label">Full Name *</label>
                <input className="dm-form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Email *</label>
                <input className="dm-form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="john@example.com" required />
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Phone</label>
                <input className="dm-form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="dm-form-group">
                <label className="dm-form-label">Role</label>
                <select className="dm-form-input" value={form.role} onChange={e => handleChange('role', e.target.value)}>
                  {roles.map(r => (
                    <option key={r.name} value={r.name}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiMail size={12} /> Password will be auto-generated and sent to the user's email.
              </div>
              <div className="form-actions" style={{ marginTop: '1rem', border: 'none', padding: 0 }}>
                <button type="submit" className="dm-btn-primary" disabled={saving}>
                  <FiSend size={13} /> {saving ? 'Creating...' : 'Create User & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          {result ? (
            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title" style={{ color: '#059669' }}><FiCheck /> User Created</h3>
              </div>
              <div className="dm-card-body">
                <div className="user-cell">
                  <div className="user-avatar-sm">{result.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="user-name">{result.name}</div>
                    <div className="user-email">{result.email}</div>
                  </div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong>Password:</strong>
                    <button className="btn btn-sm btn-outline" onClick={() => copyToClipboard(result.password)}>
                      <FiCopy size={12} /> Copy
                    </button>
                  </div>
                  <code style={{ background: '#dbeafe', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {result.password}
                  </code>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
                  <FiMail size={12} style={{ marginRight: 4 }} />
                  An email with login credentials has been sent.
                </div>
              </div>
            </div>
          ) : (
            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title"><FiShield /> Registration Notes</h3>
              </div>
              <div className="dm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                {ROLE_DESCRIPTIONS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <r.icon size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span><strong>{r.title}</strong> — {r.desc}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  Password is auto-generated and sent to the user's email. User can change password after login (if permitted by role).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
