import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiShield, FiPlus, FiEdit2, FiTrash2, FiX, FiSave,
  FiCheck, FiUsers, FiInfo
} from 'react-icons/fi';

const groupPermissions = (keys) => {
  const groups = {};
  keys.forEach(key => {
    const [resource] = key.split(':');
    if (!groups[resource]) groups[resource] = [];
    groups[resource].push(key);
  });
  return groups;
};

const EMPTY_ROLE = { name: '', label: '', description: '', permissions: [], priority: 0, isDefault: false };

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permKeys, setPermKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(EMPTY_ROLE);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleUsers, setRoleUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/roles'),
      api.get('/roles/keys')
    ]).then(([rolesRes, keysRes]) => {
      setRoles(rolesRes.data.data || []);
      setPermKeys(keysRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const openCreate = () => {
    setForm(EMPTY_ROLE);
    setEditingRole(null);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      name: r.name,
      label: r.label,
      description: r.description || '',
      permissions: [...(r.permissions || [])],
      priority: r.priority || 0,
      isDefault: r.isDefault || false
    });
    setEditingRole(r);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setForm(EMPTY_ROLE);
  };

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const togglePermission = (key) => {
    const perms = form.permissions || [];
    if (perms.includes(key)) {
      handleChange('permissions', perms.filter(p => p !== key));
    } else {
      handleChange('permissions', [...perms, key]);
    }
  };

  const toggleAllInGroup = (groupKeys) => {
    const perms = form.permissions || [];
    const allSelected = groupKeys.every(k => perms.includes(k));
    if (allSelected) {
      handleChange('permissions', perms.filter(p => !groupKeys.includes(p)));
    } else {
      const merged = [...new Set([...perms, ...groupKeys])];
      handleChange('permissions', merged);
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.label?.trim()) return showMsg('error', 'Name and label are required');
    setSaving(true);
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, form);
        showMsg('success', 'Role updated!');
      } else {
        await api.post('/roles', form);
        showMsg('success', 'Role created!');
      }
      closeForm();
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete role "${r.label}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/roles/${r._id}`);
      showMsg('success', 'Role deleted');
      fetchData();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to delete role');
    }
  };

  const viewUsers = async (r) => {
    try {
      const res = await api.get(`/roles/${r._id}/users`);
      setRoleUsers(res.data.data || []);
      setSelectedRole(r);
      setShowUsers(true);
    } catch (err) {
      showMsg('error', 'Failed to fetch role users');
    }
  };

  const permGroups = groupPermissions(permKeys);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Create and manage roles with granular permissions for your team.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Role
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <p className="loading">Loading roles...</p>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Type</th>
                  <th>Users</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-dim">No roles found</td></tr>
                )}
                {roles.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: r.isSystem ? '#dbeafe' : '#d1fae5', color: r.isSystem ? '#1e40af' : '#065f46' }}>
                          <FiShield size={14} />
                        </div>
                        <div>
                          <div className="user-name">{r.label}</div>
                          <div className="user-email">{r.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-dim" style={{ maxWidth: 250 }}>
                      {r.description || '—'}
                    </td>
                    <td>
                      <span className="text-sm">{r.permissions?.length || 0} permission(s)</span>
                    </td>
                    <td>
                      {r.isSystem ? (
                        <span className="role-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>System</span>
                      ) : (
                        <span className="role-badge" style={{ background: '#d1fae5', color: '#065f46' }}>Custom</span>
                      )}
                      {r.isDefault && (
                        <span className="role-badge" style={{ background: '#fef3c7', color: '#92400e', marginLeft: 4 }}>Default</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => viewUsers(r)} title="View users">
                        <FiUsers size={13} />
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(r)} title="Edit">
                          <FiEdit2 />
                        </button>
                        {!r.isSystem && (
                          <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(r)} title="Delete">
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRole ? `Edit: ${editingRole.label}` : 'Add New Role'}</h2>
              <button className="modal-close" onClick={closeForm}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role Name *</label>
                  <input className="form-control" value={form.name} onChange={e => handleChange('name', e.target.value.replace(/\s+/g, '_').toLowerCase())} placeholder="e.g. content_manager" disabled={editingRole?.isSystem} />
                  <small className="form-hint">Unique identifier (lowercase, no spaces)</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Label *</label>
                  <input className="form-control" value={form.label} onChange={e => handleChange('label', e.target.value)} placeholder="e.g. Content Manager" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={e => handleChange('description', e.target.value)} rows={2} placeholder="What can this role do?" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input className="form-control" type="number" value={form.priority} onChange={e => handleChange('priority', parseInt(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Role</label>
                  <select className="form-control" value={String(form.isDefault)} onChange={e => handleChange('isDefault', e.target.value === 'true')}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <small className="form-hint">New users will be assigned this role by default</small>
                </div>
              </div>

              <div className="form-section-title">
                <FiShield /> Permissions
                <span className="perm-count">{form.permissions?.length || 0} selected</span>
              </div>
              <div className="perm-groups">
                {Object.entries(permGroups).map(([resource, keys]) => {
                  const allSelected = keys.every(k => (form.permissions || []).includes(k));
                  return (
                    <div key={resource} className="perm-group">
                      <div className="perm-group-header">
                        <span className="perm-resource">{resource}</span>
                        <button
                          className={`btn btn-xs ${allSelected ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => toggleAllInGroup(keys)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="perm-keys">
                        {keys.map(key => {
                          const action = key.split(':')[1];
                          const selected = (form.permissions || []).includes(key);
                          return (
                            <button
                              key={key}
                              className={`perm-key-btn ${selected ? 'selected' : ''}`}
                              onClick={() => togglePermission(key)}
                            >
                              {selected && <FiCheck size={10} />}
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeForm}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsers && selectedRole && (
        <div className="modal-overlay" onClick={() => setShowUsers(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiUsers /> Users with role: {selectedRole.label}</h2>
              <button className="modal-close" onClick={() => setShowUsers(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              {roleUsers.length === 0 ? (
                <p className="text-dim">No users assigned to this role.</p>
              ) : (
                roleUsers.map(u => (
                  <div key={u._id} className="user-cell" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                    <span className="role-badge" style={{ background: u.isActive ? '#d1fae5' : '#fef2f2', color: u.isActive ? '#065f46' : '#dc2626', marginLeft: 'auto' }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUsers(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
