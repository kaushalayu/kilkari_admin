import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiDollarSign, FiUsers, FiSearch, FiPlus, FiDownload, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const DCCDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.assignedCenter) return;
    setLoading(true);
    const params = { center: user.assignedCenter };
    Promise.all([
      api.get('/reports/centers', { params }),
      api.get('/donors', { params: { limit: 20, ...params } }),
      api.get('/offline-donations', { params: { limit: 20, ...params } }),
    ]).then(([s, d, dn]) => {
      setStats(s.data.data?.[0]);
      setDonors(d.data.data || []);
      setDonations(dn.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleDonorSearch = async () => {
    if (!search) return;
    try {
      const { data } = await api.get('/donors', { params: { search } });
      setDonors(data.data || []);
    } catch { setMsg('Search failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><FiUsers /> DCC Dashboard</h2>
        {user?.assignedCenter && <span className="badge badge-info">Center: {user.assignedCenter}</span>}
      </div>

      {msg && <div className={`alert ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['dashboard', 'donors', 'donations', 'settlements'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {!loading && tab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="stat-card" style={{ background: '#dbeafe' }}>
              <FiDollarSign size={20} style={{ color: '#2563eb' }} />
              <div className="stat-value">₹{(stats?.total || 0).toLocaleString('en-IN')}</div>
              <div className="stat-label">Today's Collection</div>
            </div>
            <div className="stat-card" style={{ background: '#d1fae5' }}>
              <FiUsers size={20} style={{ color: '#059669' }} />
              <div className="stat-value">{stats?.count || 0}</div>
              <div className="stat-label">Total Donations</div>
            </div>
            <div className="stat-card" style={{ background: '#fef3c7' }}>
              <FiCalendar size={20} style={{ color: '#d97706' }} />
              <div className="stat-value">{stats?.settled || 0}</div>
              <div className="stat-label">Settled</div>
            </div>
          </div>

          <div className="table-container">
            <h3 style={{ padding: '0.75rem 1rem', margin: 0, fontSize: '0.85rem' }}>Recent Donations</h3>
            <table className="table">
              <thead><tr><th>Donor</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {donations.length === 0 && <tr><td colSpan={5} className="text-center text-dim">No donations yet</td></tr>}
                {donations.map(d => (
                  <tr key={d._id}>
                    <td>{d.donor?.donorName || '—'}</td>
                    <td>₹{(d.amount || 0).toLocaleString('en-IN')}</td>
                    <td>{d.paymentMode}</td>
                    <td>{new Date(d.donationDate).toLocaleDateString('en-IN')}</td>
                    <td><span className={`status-badge ${d.paymentStatus === 'success' ? 'status-success' : 'status-pending'}`}>{d.paymentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && tab === 'donors' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="search-box" style={{ flex: 1, maxWidth: 300 }}>
              <FiSearch className="search-icon" />
              <input className="form-control" placeholder="Search by name/mobile/ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleDonorSearch}><FiSearch /> Search</button>
            <button className="btn btn-outline" onClick={() => setTab('dashboard')}><FiRefreshCw /></button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>ID</th><th>Name</th><th>Mobile</th><th>Total</th><th>Last Donation</th></tr></thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{d.donorId}</td>
                    <td><strong>{d.donorName}</strong></td>
                    <td>{d.mobile}</td>
                    <td>₹{(d.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DCCDashboard;
