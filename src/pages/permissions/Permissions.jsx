import { useState, useEffect, useMemo } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FiShield, FiUsers, FiEdit2, FiTrash2,
  FiToggleLeft, FiToggleRight, FiX, FiSave, FiSend,
  FiCheck, FiPlus, FiCopy, FiRefreshCw, FiSearch,
  FiUserPlus, FiLock, FiInfo
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

const roleColor = (name) => {
  const m = {
    admin:        { bg: '#fef3c7', color: '#92400e' },
    center_admin: { bg: '#e0f2fe', color: '#0369a1' },
    editor:       { bg: '#d1fae5', color: '#065f46' },
    volunteer:    { bg: '#ede9fe', color: '#5b21b6' },
    team:         { bg: '#fce7f3', color: '#9d174d' },
  };
  return m[name] || { bg: '#f3f4f6', color: '#374151' };
};

const EMPTY_ROLE = { name: '', label: '', description: '', permissions: [], priority: 0, isDefault: false };

/* ═══════════════════════════════════════════════════════════
   PERMISSION MANAGEMENT — SINGLE PAGE
   ═══════════════════════════════════════════════════════════ */
const Permissions = () => {
  const { user: currentUser } = useAuth();
  const isAdminUser = currentUser?.role === 'admin';

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [permKeys, setPermKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Role form ── */
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [savingRole, setSavingRole] = useState(false);

  /* ── Expanded role ── */
  const [expandedRole, setExpandedRole] = useState(null);

  /* ── User Registration ── */
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', role: '' });
  const [regSaving, setRegSaving] = useState(false);
  const [regResult, setRegResult] = useState(null);

  /* ── User search/filter ── */
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  /* ── Password reset ── */
  const [resetting, setResetting] = useState(null);
  const [showPwd, setShowPwd] = useState(null);

  /* ── Messages ── */
  const [msg, setMsg] = useState('');

  const permGroups = useMemo(() => groupPermissions(permKeys), [permKeys]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/roles'),
      api.get('/permissions/users'),
      api.get('/roles/keys')
    ]).then(([rRes, uRes, kRes]) => {
      setRoles(rRes.data.data || []);
      setUsers(uRes.data.data || []);
      setPermKeys(kRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (text, isError = false) => {
    setMsg(isError ? `error:${text}` : text);
    setTimeout(() => setMsg(''), 3500);
  };

  /* ── Role CRUD ── */
  const openNewRole = () => {
    setRoleForm(EMPTY_ROLE);
    setEditRole(null);
    setShowRoleForm(true);
  };

  const openEditRole = (r) => {
    setRoleForm({
      name: r.name, label: r.label, description: r.description || '',
      permissions: [...(r.permissions || [])], priority: r.priority || 0, isDefault: r.isDefault || false
    });
    setEditRole(r);
    setShowRoleForm(true);
  };

  const closeRoleForm = () => {
    setShowRoleForm(false);
    setEditRole(null);
    setRoleForm(EMPTY_ROLE);
  };

  const toggleRolePerm = (key) => {
    const p = roleForm.permissions || [];
    setRoleForm(f => ({ ...f, permissions: p.includes(key) ? p.filter(x => x !== key) : [...p, key] }));
  };

  const toggleRoleGroup = (keys) => {
    const p = roleForm.permissions || [];
    const all = keys.every(k => p.includes(k));
    setRoleForm(f => ({ ...f, permissions: all ? p.filter(x => !keys.includes(x)) : [...new Set([...p, ...keys])] }));
  };

  const saveRole = async () => {
    if (!roleForm.name?.trim() || !roleForm.label?.trim()) return showMsg('Name and label required', true);
    setSavingRole(true);
    try {
      if (editRole) {
        await api.put(`/roles/${editRole._id}`, roleForm);
        showMsg('Role updated!');
      } else {
        await api.post('/roles', roleForm);
        showMsg('Role created!');
      }
      closeRoleForm();
      fetchAll();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
    finally { setSavingRole(false); }
  };

  const deleteRole = async (r) => {
    if (!window.confirm(`Delete role "${r.label}"?`)) return;
    try { await api.delete(`/roles/${r._id}`); fetchAll(); }
    catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const toggleRolePermInline = (rId, rolePerms, key) => {
    const updated = rolePerms.includes(key) ? rolePerms.filter(p => p !== key) : [...rolePerms, key];
    api.put(`/roles/${rId}`, { permissions: updated }).then(fetchAll).catch(e => showMsg(e.response?.data?.message || 'Failed', true));
  };

  const toggleRoleGroupInline = (rId, rolePerms, keys) => {
    const all = keys.every(k => rolePerms.includes(k));
    const updated = all ? rolePerms.filter(p => !keys.includes(p)) : [...new Set([...rolePerms, ...keys])];
    api.put(`/roles/${rId}`, { permissions: updated }).then(fetchAll).catch(e => showMsg(e.response?.data?.message || 'Failed', true));
  };

  /* ── User Override Permissions ── */
  const [expandedUser, setExpandedUser] = useState(null);
  const [changingRole, setChangingRole] = useState(null);
  const [savingUserPerms, setSavingUserPerms] = useState(null);

  const handleUserExpand = (u) => {
    setExpandedUser(expandedUser === u._id ? null : u._id);
  };

  const changeUserRole = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      await api.put(`/permissions/users/${userId}/role`, { role: newRole });
      showMsg('Role updated!');
      fetchAll();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
    finally { setChangingRole(null); }
  };

  /* ── User Registration ── */
  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!regForm.name?.trim() || !regForm.email?.trim()) return showMsg('Name and email required', true);
    setRegSaving(true);
    setRegResult(null);
    try {
      const { data } = await api.post('/auth/register-with-email', regForm);
      setRegResult(data.data);
      showMsg(data.message || 'User created!');
      setRegForm({ name: '', email: '', phone: '', role: regForm.role });
      fetchAll();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
    finally { setRegSaving(false); }
  };

  const copyText = (t) => { navigator.clipboard.writeText(t); showMsg('Copied!'); };

  /* ── User Actions ── */
  const toggleUserActive = async (u) => {
    try { await api.put(`/permissions/users/${u._id}/toggle-active`); fetchAll(); }
    catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete "${u.name}"?`)) return;
    try { await api.delete(`/permissions/users/${u._id}`); fetchAll(); }
    catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const resetUserPwd = async (u) => {
    if (!window.confirm(`Reset password for "${u.name}"?`)) return;
    setResetting(u._id);
    try {
      const res = await api.put(`/permissions/users/${u._id}/reset-password`);
      setShowPwd({ email: u.email, password: res.data.data?.password });
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
    finally { setResetting(null); }
  };

  const filteredUsers = users.filter(u => {
    const ms = !userSearch || (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const mr = !userRoleFilter || u.role === userRoleFilter;
    return ms && mr;
  });

  const nonAdminRoles = roles.filter(r => r.name !== 'admin');
  useEffect(() => {
    if (!regForm.role && nonAdminRoles.length > 0) {
      const def = nonAdminRoles.find(r => r.isDefault) || nonAdminRoles[0];
      setRegForm(f => ({ ...f, role: def.name }));
    }
  }, [roles]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FiLock /> Permission Management</h1>
          <p className="page-subtitle">Create roles, manage permissions, register users — all in one place.</p>
        </div>
      </div>

      {msg && (
        <div className={`alert ${msg.startsWith('error:') ? 'alert-error' : 'alert-success'}`}>
          {msg.replace('error:', '')}
        </div>
      )}

      {showPwd && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Password for {showPwd.email}:</strong> <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>{showPwd.password}</code></span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="btn btn-sm btn-outline" onClick={() => { copyText(showPwd.password); }}><FiCopy /> Copy</button>
            <button className="btn btn-sm btn-outline" onClick={() => setShowPwd(null)}><FiX /></button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SECTION 1: ROLE REGISTRATION
          ════════════════════════════════════════════════════ */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <h3 className="card-title"><FiShield /> Role Registration</h3>
          <button className="btn btn-sm btn-primary" onClick={openNewRole}><FiPlus /> New Role</button>
        </div>

        {/* Role list with inline permission toggles */}
        {loading ? <p className="loading">Loading...</p> : (
          <div style={{ padding: '1rem' }}>
            {roles.length === 0 ? (
              <p className="text-dim text-center">No roles yet. Create your first role.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {roles.map(r => {
                  const expanded = expandedRole === r._id;
                  const rc = roleColor(r.name);
                  return (
                    <div key={r._id} style={{
                      border: expanded ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      background: 'var(--bg-card)'
                    }}>
                      {/* Role header */}
                      <div
                        style={{
                          padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', cursor: 'pointer',
                          background: expanded ? 'var(--bg)' : 'transparent'
                        }}
                        onClick={() => setExpandedRole(expanded ? null : r._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                          <span className="role-badge" style={{ background: rc.bg, color: rc.color, fontSize: '0.78rem' }}>
                            {r.label}
                          </span>
                          <span className="text-sm text-dim">{r.permissions?.length || 0} perm</span>
                          {r.isSystem && <span className="badge badge-warning">System</span>}
                          {r.isDefault && <span className="badge badge-success">Default</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                          {isAdminUser && (
                            <>
                              <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); openEditRole(r); }} title="Edit">
                                <FiEdit2 size={12} />
                              </button>
                              {!r.isSystem && (
                                <button className="btn btn-sm btn-danger-outline" onClick={e => { e.stopPropagation(); deleteRole(r); }} title="Delete">
                                  <FiTrash2 size={12} />
                                </button>
                              )}
                            </>
                          )}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--text-dim)' }}>
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded permissions */}
                      {expanded && (
                        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border)' }}>
                          <p className="text-sm text-dim" style={{ margin: '0.65rem 0' }}>{r.description || 'No description'}</p>
                          <div className="form-section-title" style={{ margin: '0.5rem 0 0.5rem' }}>
                            <FiLock size={12} /> Permissions
                          </div>
                          <div className="perm-groups">
                            {Object.entries(permGroups).map(([resource, keys]) => {
                              const rp = r.permissions || [];
                              const allSelected = keys.every(k => rp.includes(k));
                              return (
                                <div key={resource} className="perm-group" style={{ padding: '0.5rem 0.6rem' }}>
                                  <div className="perm-group-header" style={{ marginBottom: '0.3rem' }}>
                                    <span className="perm-resource" style={{ fontSize: '0.65rem' }}>{resource}</span>
                                    {isAdminUser && (
                                      <button className={`btn btn-xs ${allSelected ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => toggleRoleGroupInline(r._id, rp, keys)}>
                                        {allSelected ? 'All' : 'Select All'}
                                      </button>
                                    )}
                                  </div>
                                  <div className="perm-keys">
                                    {keys.map(key => {
                                      const action = key.split(':')[1];
                                      const on = rp.includes(key);
                                      return (
                                        <button key={key}
                                          className={`perm-key-btn ${on ? 'selected' : ''}`}
                                          onClick={() => isAdminUser && toggleRolePermInline(r._id, rp, key)}
                                          style={!isAdminUser ? { cursor: 'default' } : {}}
                                        >
                                          {on && <FiCheck size={10} />} {action}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          SECTION 2: USER REGISTRATION + USER LIST
          ════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* User Registration Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiUserPlus /> Register User</h3>
          </div>
          <div className="card-body">
            <form onSubmit={submitRegistration}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={regForm.role} onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}>
                  {nonAdminRoles.map(r => (
                    <option key={r.name} value={r.name}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-hint" style={{ marginBottom: '0.6rem', fontSize: '0.72rem' }}>
                <FiSend size={11} /> Password auto-generated & sent via email.
              </div>
              <button type="submit" className="btn btn-primary" disabled={regSaving} style={{ width: '100%' }}>
                <FiSend /> {regSaving ? 'Creating...' : 'Create & Send Email'}
              </button>

              {regResult && (
                <div style={{ marginTop: '0.75rem', background: '#f0fdf4', padding: '0.65rem', borderRadius: 'var(--radius)', fontSize: '0.78rem' }}>
                  <div className="user-cell" style={{ marginBottom: '0.4rem' }}>
                    <div className="user-avatar-sm" style={{ width: 24, height: 24, fontSize: '0.6rem' }}>{regResult.name?.[0]}</div>
                    <span style={{ fontWeight: 600 }}>{regResult.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ background: '#dbeafe', padding: '0.15rem 0.4rem', borderRadius: 3, fontSize: '0.75rem' }}>{regResult.password}</code>
                    <button className="btn btn-xs btn-outline" onClick={() => copyText(regResult.password)}><FiCopy /> Copy</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="card">
          <div className="card-header" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <h3 className="card-title" style={{ width: '100%' }}><FiUsers /> Users ({users.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div className="search-box" style={{ flex: 1 }}>
                <FiSearch className="search-icon" />
                <input className="form-control" placeholder="Search..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <select className="form-control form-control-sm" style={{ width: 140 }} value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r.name} value={r.name}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ minWidth: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center text-dim">No users</td></tr>}
                {filteredUsers.map(u => {
                  const isSelf = currentUser?._id === u._id;
                  const rc = roleColor(u.role);
                  const expanded = expandedUser === u._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell" style={{ cursor: 'pointer' }} onClick={() => handleUserExpand(u)}>
                          <div className="user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                          <div>
                            <div className="user-name">{u.name} {isSelf && <span className="badge-you">You</span>}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="role-badge" style={{ background: rc.bg, color: rc.color, fontSize: '0.7rem' }}>{u.roleLabel || u.role}</span></td>
                      <td>
                        <button className={`toggle-btn ${u.isActive ? 'active' : 'inactive'}`}
                          onClick={() => !isSelf && u.role !== 'admin' && toggleUserActive(u)}
                          disabled={isSelf || u.role === 'admin'}>
                          {u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                          <span style={{ fontSize: '0.7rem' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td>
                        <div className="action-btns">
                          {isAdminUser && !isSelf && u.role !== 'admin' && (
                            <>
                              <button className="btn btn-sm btn-outline" onClick={() => resetUserPwd(u)} disabled={resetting === u._id} title="Reset Password">
                                <FiRefreshCw size={12} />
                              </button>
                              <button className="btn btn-sm btn-danger-outline" onClick={() => deleteUser(u)} title="Delete">
                                <FiTrash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', color: 'var(--text-dim)', cursor: 'pointer' }}
                          onClick={() => handleUserExpand(u)}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {expandedUser && (() => {
                const u = users.find(x => x._id === expandedUser);
                if (!u || u.role === 'admin') return null;
                const userPerms = u.permissions || [];
                const rolePerms = u.rolePermissions || [];
                const isSaving = savingUserPerms === u._id;
                return (
                  <tbody key="expanded-row">
                    <tr><td colSpan={5} style={{ padding: '0.75rem 1rem', background: 'var(--bg)' }}>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>Role:</span>
                          <select className="form-control form-control-sm" style={{ width: 160 }}
                            value={u.role}
                            onChange={e => changeUserRole(u._id, e.target.value)}
                            disabled={changingRole === u._id}>
                            {roles.map(r => <option key={r.name} value={r.name}>{r.label}</option>)}
                          </select>
                          {changingRole === u._id && <span className="loading-sm" />}
                        </div>
                        <div className="form-section-title" style={{ margin: '0.5rem 0' }}>
                          <FiLock size={12} /> Permission Overrides
                          <span className="text-dim" style={{ fontWeight: 400, fontSize: '0.72rem', marginLeft: '0.5rem' }}>
                            (extra permissions beyond role)
                          </span>
                        </div>
                        <div className="perm-groups" style={{ maxHeight: 300, overflowY: 'auto' }}>
                          {Object.entries(permGroups).map(([resource, keys]) => {
                            const allRole = keys.every(k => rolePerms.includes(k));
                            return (
                              <div key={resource} className="perm-group" style={{ padding: '0.4rem 0.5rem', opacity: allRole ? 0.6 : 1 }}>
                                <div className="perm-group-header" style={{ marginBottom: '0.2rem' }}>
                                  <span className="perm-resource" style={{ fontSize: '0.6rem' }}>{resource}</span>
                                  {allRole && <span className="badge badge-success" style={{ fontSize: '0.55rem' }}>from role</span>}
                                </div>
                                <div className="perm-keys">
                                  {keys.map(key => {
                                    const act = key.split(':')[1];
                                    const fromRole = rolePerms.includes(key);
                                    const overridden = userPerms.includes(key) && !fromRole;
                                    const removed = !userPerms.includes(key) && fromRole;
                                    return (
                                      <button key={key}
                                        className={`perm-key-btn ${overridden ? 'selected' : ''} ${removed ? 'perm-removed' : ''}`}
                                        onClick={() => toggleUserPerm(u._id, userPerms, key)}
                                        disabled={isSaving}
                                        title={fromRole ? (removed ? 'Click to restore (from role)' : 'From role — click to remove') : 'Click to add'}
                                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', textDecoration: removed ? 'line-through' : 'none' }}
                                      >
                                        {overridden && <FiCheck size={9} />}
                                        {removed && <FiX size={9} />}
                                        {act}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td></tr>
                  </tbody>
                );
              })()}
            </table>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MODAL: Create / Edit Role
          ════════════════════════════════════════════════════ */}
      {showRoleForm && (
        <div className="modal-overlay" onClick={closeRoleForm}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editRole ? `Edit: ${editRole.label}` : 'New Role'}</h2>
              <button className="modal-close" onClick={closeRoleForm}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={roleForm.name}
                    onChange={e => setRoleForm(f => ({ ...f, name: e.target.value.replace(/\s+/g, '_').toLowerCase() }))}
                    placeholder="content_manager" disabled={editRole?.isSystem} />
                </div>
                <div className="form-group">
                  <label className="form-label">Label *</label>
                  <input className="form-control" value={roleForm.label} onChange={e => setRoleForm(f => ({ ...f, label: e.target.value }))} placeholder="Content Manager" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={roleForm.description} onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What can this role do?" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <input className="form-control" type="number" value={roleForm.priority} onChange={e => setRoleForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Role</label>
                  <select className="form-control" value={String(roleForm.isDefault)} onChange={e => setRoleForm(f => ({ ...f, isDefault: e.target.value === 'true' }))}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-section-title">
                <FiLock /> Permissions <span className="perm-count">{roleForm.permissions?.length || 0}</span>
              </div>
              <div className="perm-groups">
                {Object.entries(permGroups).map(([resource, keys]) => {
                  const allSelected = keys.every(k => (roleForm.permissions || []).includes(k));
                  return (
                    <div key={resource} className="perm-group">
                      <div className="perm-group-header">
                        <span className="perm-resource">{resource}</span>
                        <button className={`btn btn-xs ${allSelected ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleRoleGroup(keys)}>
                          {allSelected ? 'All' : 'Select All'}
                        </button>
                      </div>
                      <div className="perm-keys">
                        {keys.map(key => {
                          const action = key.split(':')[1];
                          const selected = (roleForm.permissions || []).includes(key);
                          return (
                            <button key={key} className={`perm-key-btn ${selected ? 'selected' : ''}`} onClick={() => toggleRolePerm(key)}>
                              {selected && <FiCheck size={10} />} {action}
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
              <button className="btn btn-outline" onClick={closeRoleForm}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRole} disabled={savingRole}>
                <FiSave /> {savingRole ? 'Saving...' : editRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
