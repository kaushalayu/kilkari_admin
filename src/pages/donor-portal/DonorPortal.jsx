import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiUser, FiDollarSign, FiDownload, FiLogOut, FiToggleLeft, FiToggleRight, FiCalendar, FiFileText } from 'react-icons/fi';
import DonorLogin from './DonorLogin';

const DonorPortal = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [onlineDonations, setOnlineDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(res => {
        if (res.data.data?.role === 'donor') {
          setUser(res.data.data);
          setLoggedIn(true);
        }
      }).catch(() => localStorage.removeItem('token'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    Promise.all([
      api.get('/portal/donor/profile'),
      api.get('/portal/donor/donations', { params: { limit: 50 } }),
    ]).then(([p, d]) => {
      setProfile(p.data.data);
      setForm(p.data.data);
      setDonations(d.data.data?.offline || []);
      setOnlineDonations(d.data.data?.online || []);
      setTotalAmount(d.data.totalAmount || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [loggedIn]);

  const handleLogin = (data) => {
    setUser(data);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/portal/donor/profile', form);
      setProfile(data.data);
      setEditing(false);
      setMsg('Profile updated!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const downloadReceipt = async (id) => {
    try {
      const res = await api.get(`/portal/donor/receipt/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `receipt-${id}.pdf`; a.click();
    } catch (err) {
      setMsg('Failed to download receipt');
    }
  };

  const download80G = async (id) => {
    try {
      const res = await api.get(`/portal/donor/80g/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `80g-${id}.pdf`; a.click();
    } catch (err) {
      setMsg('Failed to download 80G certificate');
    }
  };

  if (!loggedIn && !loading) return <DonorLogin onLogin={handleLogin} />;

  return (
    <div className="donor-portal">
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="sidebar-logo-placeholder" style={{ width: 32, height: 32, fontSize: '0.6rem' }}><span>KC</span></div>
          <div>
            <h2>Donor Portal</h2>
            <p className="text-dim">Welcome, {profile?.donorName || user?.name}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={handleLogout}><FiLogOut /> Logout</button>
      </header>

      <div className="portal-tabs">
        {['profile', 'donations', 'receipts'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {msg && <div className={`alert ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {loading && <div className="loading">Loading...</div>}

      {!loading && tab === 'profile' && profile && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><FiUser /> My Profile</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
          </div>
          <div className="card-body">
            {editing ? (
              <form onSubmit={updateProfile} className="crud-form" style={{ maxWidth: 500 }}>
                <div className="form-group"><label>Name</label><input value={form.donorName || ''} onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))} /></div>
                <div className="form-group"><label>Email</label><input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label>Address</label><textarea value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} /></div>
                <div className="form-group"><label>City</label><input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="form-group"><label>State</label><input value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
                <div className="form-group"><label>Pincode</label><input value={form.pincode || ''} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} /></div>
                <div className="form-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div><strong>Name</strong><br />{profile.donorName}</div>
                <div><strong>Donor ID</strong><br />{profile.donorId}</div>
                <div><strong>Email</strong><br />{profile.email || '—'}</div>
                <div><strong>Mobile</strong><br />{profile.mobile}</div>
                <div><strong>Total Donations</strong><br />₹{totalAmount.toLocaleString('en-IN')}</div>
                <div><strong>City</strong><br />{profile.city || '—'}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && tab === 'donations' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Date</th><th>ID</th><th>Amount</th><th>Purpose</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {donations.length === 0 && onlineDonations.length === 0 && <tr><td colSpan={7} className="text-center text-dim">No donations yet</td></tr>}
              {[...donations, ...onlineDonations].sort((a, b) => new Date(b.donationDate || b.createdAt) - new Date(a.donationDate || a.createdAt)).map(d => (
                <tr key={d._id}>
                  <td>{new Date(d.donationDate || d.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{d.donationId || d.razorpayOrderId?.slice(-8) || '—'}</td>
                  <td style={{ fontWeight: 600 }}>₹{(d.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{d.purpose || 'General'}</td>
                  <td>{d.paymentMode || d.method || 'Online'}</td>
                  <td><span className={`status-badge ${d.paymentStatus === 'success' ? 'status-success' : 'status-pending'}`}>{d.paymentStatus}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => downloadReceipt(d._id)} title="Receipt"><FiDownload /></button>
                      <button className="btn btn-sm btn-outline" onClick={() => download80G(d._id)} title="80G"><FiFileText /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'receipts' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title"><FiFileText /> Receipt Settings</h3></div>
          <div className="card-body">
            <p className="text-dim">Download your donation receipts and 80G tax exemption certificates anytime. All past receipts are available in the "Donations" tab.</p>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Total Tax-Exempt Donations:</strong> ₹{[...donations, ...onlineDonations].filter(d => d.paymentStatus === 'success').reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}</p>
              <p className="text-dim" style={{ fontSize: '0.82rem' }}>80G certificates are available for donations where PAN was provided.</p>
            </div>
          </div>
        </div>
      )}

      <div className="board-footer-notice" style={{ marginTop: '2rem', padding: '1rem', background: '#dbeafe', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#1e40af' }}>
        <strong>Self-Service Portal:</strong> You can only view and manage your own data. For assistance, contact Kilkari support.
      </div>
    </div>
  );
};

export default DonorPortal;
