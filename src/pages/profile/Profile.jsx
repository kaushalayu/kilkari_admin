import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getFullUrl } from '../../api/client';
import { FiSave, FiUser, FiLock, FiUploadCloud, FiX, FiShieldOff } from 'react-icons/fi';

const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [imgError, setImgError] = useState(false);
  const formRef = useRef(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/upload?folder=avatars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.fileUrl) {
        setForm(prev => ({ ...prev, avatar: res.data.data.fileUrl }));
      }
    } catch {
      setMsg({ type: 'error', text: 'Failed to upload avatar.' });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setForm(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const body = { name: form.name, phone: form.phone, avatar: form.avatar };
    if (passwords.newPassword) {
      body.currentPassword = passwords.currentPassword;
      body.newPassword = passwords.newPassword;
    }

    try {
      setSaving(true);
      await api.put('/auth/profile', body);
      await refreshUser();
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const canChangePassword = useMemo(() => {
    if (!user) return false;
    const rolePerms = user.rolePermissions || [];
    const userPerms = user.permissions || [];
    const allPerms = [...new Set([...rolePerms, ...userPerms])];
    return allPerms.includes('profiles:change_password') || user.role === 'admin';
  }, [user]);

  const avatarUrl = getFullUrl(form.avatar);
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2 className="page-title"><FiUser /> My Profile</h2>
        <button className="btn btn-primary" onClick={() => formRef.current?.requestSubmit()} disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>
      )}

      <form ref={formRef} className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-avatar-section">
          <h3 className="section-title"><FiUser /> Avatar</h3>
          <div className="profile-avatar-wrapper">
            {form.avatar ? (
              <img src={avatarUrl} alt="Avatar" className="profile-avatar"
                onError={() => setImgError(true)}
                style={{ display: imgError ? 'none' : 'block' }}
              />
            ) : null}
            <div className="profile-avatar-placeholder" style={{ display: form.avatar && !imgError ? 'none' : 'flex' }}>
              {initials}
            </div>
            <div className="profile-avatar-actions">
              <label className="image-upload-btn">
                <FiUploadCloud /> {uploading ? 'Uploading...' : 'Upload Avatar'}
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
              {form.avatar && (
                <button type="button" className="btn-icon btn-delete" onClick={removeAvatar}><FiX /></button>
              )}
            </div>
          </div>
        </div>

        <h3 className="section-title"><FiUser /> Personal Information</h3>

        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={user?.email || ''} disabled placeholder="Your email" />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number" />
        </div>

        <div className="form-group">
          <label>Role</label>
          <input value={user?.role || ''} disabled />
        </div>

        {canChangePassword ? (
          <>
            <h3 className="section-title"><FiLock /> Change Password</h3>
            <p className="form-hint">Leave blank to keep current password.</p>

            <div className="form-group">
              <label>Current Password</label>
              <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" autoComplete="current-password" />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="Enter new password (min 6 chars)" autoComplete="new-password" />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="Confirm new password" autoComplete="new-password" />
            </div>
          </>
        ) : (
          <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 'var(--radius)', color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShieldOff size={16} />
            You do not have permission to change your password.
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
