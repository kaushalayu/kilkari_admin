import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiUsers, FiPhone, FiSearch, FiDownload, FiRefreshCw,
  FiTarget, FiTrendingUp, FiCalendar
} from 'react-icons/fi';

const FundraiserDashboard = () => {
  const [user, setUser] = useState(null);
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setUser(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.assignedDonors?.length) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      api.get('/donors', { params: { limit: 50 } }),
      api.get('/reports/donations', { params: { range: '1_month' } }),
      api.get('/campaigns')
    ]).then(([d, dn, c]) => {
      setDonors(d.data.data || []);
      setDonations(dn.data.data?.donations || []);
      setCampaigns(c.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const todayTotal = donations
    .filter(d => new Date(d.date || d.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Fundraiser Dashboard</h1>
          <p className="dm-subtitle">{user?.name || 'Fundraiser'}</p>
        </div>
      </div>

      {msg && <div className={`dm-alert ${msg.includes('fail') ? 'dm-alert-error' : 'dm-alert-success'}`}>{msg}</div>}

      <div className="dm-tabs" style={{ marginBottom: '1rem' }}>
        {['dashboard', 'donors', 'campaigns', 'performance'].map(t => (
          <button key={t} className={`dm-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'dashboard' && <FiTrendingUp size={13} />}
            {t === 'donors' && <FiUsers size={13} />}
            {t === 'campaigns' && <FiTarget size={13} />}
            {t === 'performance' && <FiCalendar size={13} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading...</div>}

      {!loading && tab === 'dashboard' && (
        <>
          <div className="dm-stats">
            <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
              <div className="dm-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiDollarSign /></div>
              <div className="dm-stat-value">₹{todayTotal.toLocaleString('en-IN')}</div>
              <div className="dm-stat-label">Today's Collection</div>
            </div>
            <div className="dm-stat-card" style={{ '--sc': '#2563eb' }}>
              <div className="dm-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiUsers /></div>
              <div className="dm-stat-value">{donors.length}</div>
              <div className="dm-stat-label">Assigned Donors</div>
            </div>
            <div className="dm-stat-card" style={{ '--sc': '#d97706' }}>
              <div className="dm-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiPhone /></div>
              <div className="dm-stat-value">{donations.length}</div>
              <div className="dm-stat-label">This Month</div>
            </div>
            <div className="dm-stat-card" style={{ '--sc': '#7c3aed' }}>
              <div className="dm-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiTarget /></div>
              <div className="dm-stat-value">{campaigns.filter(c => c.status === 'active').length}</div>
              <div className="dm-stat-label">Active Campaigns</div>
            </div>
          </div>

          <div className="dm-card">
            <div className="dm-card-header">
              <span className="dm-card-title"><FiTrendingUp /> Recent Donations</span>
              <Link to="/donations/offline" className="dm-btn-primary" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}>
                + Add Donation
              </Link>
            </div>
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead><tr><th>Donor</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead>
                <tbody>
                  {donations.slice(0, 10).map((d, i) => (
                    <tr key={d._id || i}>
                      <td>{d.donorName || '—'}</td>
                      <td className="dm-amount">₹{(d.amount || 0).toLocaleString('en-IN')}</td>
                      <td><span className="dm-status dm-status-success">{d.paymentMode || 'online'}</span></td>
                      <td className="dm-dim">{new Date(d.date || d.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && <tr><td colSpan={4} className="dm-empty">No donations this month</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && tab === 'donors' && (
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiUsers /> My Donors</span>
            <span className="dm-count-badge">{donors.length} total</span>
          </div>
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Total</th><th>Last Donation</th></tr></thead>
              <tbody>
                {donors.length === 0 && <tr><td colSpan={5} className="dm-empty">No assigned donors</td></tr>}
                {donors.map(d => (
                  <tr key={d._id}>
                    <td className="dm-dim dm-mono" style={{ fontSize: '0.7rem' }}>{d.donorId}</td>
                    <td><strong>{d.donorName}</strong></td>
                    <td>{d.mobile}</td>
                    <td className="dm-amount">₹{(d.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="dm-dim">{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'campaigns' && (
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiTarget /> Campaigns</span>
            <Link to="/crowd-funding" className="dm-card-link">View All <FiTrendingUp size={12} /></Link>
          </div>
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead><tr><th>Campaign</th><th>Target</th><th>Raised</th><th>Progress</th><th>Status</th><th>End Date</th></tr></thead>
              <tbody>
                {campaigns.length === 0 && <tr><td colSpan={6} className="dm-empty">No campaigns yet</td></tr>}
                {campaigns.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.title}</strong></td>
                    <td className="dm-amount">₹{Number(c.goalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="dm-amount">₹{Number(c.raisedAmount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${c.progress || 0}%`, height: '100%', background: '#2563eb', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.progress || 0}%</span>
                      </div>
                    </td>
                    <td><span className={`dm-status ${c.status === 'active' ? 'dm-status-success' : c.status === 'completed' ? 'dm-status-pending' : 'dm-status-inactive'}`}>{c.status}</span></td>
                    <td className="dm-dim">{c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'performance' && (
        <div className="dm-card">
          <div className="dm-card-header"><span className="dm-card-title"><FiCalendar /> My Performance</span></div>
          <div className="dm-card-body">
            <div className="dm-stats">
              <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
                <div className="dm-stat-label">Today</div>
                <div className="dm-stat-value">₹{todayTotal.toLocaleString('en-IN')}</div>
              </div>
              <div className="dm-stat-card" style={{ '--sc': '#2563eb' }}>
                <div className="dm-stat-label">This Month</div>
                <div className="dm-stat-value">{donations.length} donations</div>
              </div>
              <div className="dm-stat-card" style={{ '--sc': '#7c3aed' }}>
                <div className="dm-stat-label">Assigned Donors</div>
                <div className="dm-stat-value">{donors.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundraiserDashboard;
