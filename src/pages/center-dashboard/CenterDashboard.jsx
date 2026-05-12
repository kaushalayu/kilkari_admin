import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  FiDollarSign, FiUsers, FiMapPin, FiBarChart2,
  FiTrendingUp, FiClock, FiCalendar, FiEye
} from 'react-icons/fi';

const CenterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalDonations: 0, totalAmount: 0, centers: 0, offlineDonations: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/donations?limit=5'),
      api.get('/centers'),
      api.get('/offline-donations')
    ]).then(([donRes, cenRes, offRes]) => {
      const donations = donRes.data.data || [];
      const centersData = cenRes.data.data || [];
      const offlineData = offRes.data.data || [];

      setRecentDonations(donations.slice(0, 5));
      setCenters(centersData);

      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      setStats({
        totalDonations: donations.length,
        totalAmount,
        centers: centersData.length,
        offlineDonations: offlineData.length
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-hero" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 45%, #0284c7 100%)' }}>
        <div className="dash-hero-dots" />
        <div className="dash-hero-left">
          <p className="dash-hero-greeting">Center Administration</p>
          <h1 className="dash-hero-name">
            Welcome, <span>{user?.name?.split(' ')[0] || 'Admin'}</span>
          </h1>
          <div className="dash-hero-role-row">
            <span className="dash-hero-role-badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              Center Admin
            </span>
            <span className="dash-hero-email">{user?.email}</span>
          </div>
          <p className="dash-hero-sub">Manage your collection center, view donations, and generate reports.</p>
        </div>
        <div className="dash-hero-right">
          <div className="dash-hero-org">
            <div className="dash-hero-org-dot" />
            <span>Center Panel</span>
          </div>
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card" style={{ '--sc': '#059669' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiDollarSign /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.totalDonations}</div>
            <div className="dash-stat-label">Total Donations</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#2563eb' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiTrendingUp /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">₹{stats.totalAmount.toLocaleString('en-IN')}</div>
            <div className="dash-stat-label">Total Collection</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#7c3aed' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiMapPin /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.centers}</div>
            <div className="dash-stat-label">Centers</div>
          </div>
        </div>
        <div className="dash-stat-card" style={{ '--sc': '#d97706' }}>
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiBarChart2 /></div>
          </div>
          <div className="dash-stat-bottom">
            <div className="dash-stat-value">{stats.offlineDonations}</div>
            <div className="dash-stat-label">Offline Donations</div>
          </div>
        </div>
      </div>

      <div className="dash-qa-section">
        <h3 className="dash-qa-title">Quick Actions</h3>
        <div className="dash-qa-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <Link to="/donations" className="dash-qa-btn" style={{ '--qa-color': '#059669', '--qa-bg': '#d1fae5' }}>
            <div className="dash-qa-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiEye /></div>
            View Donations
          </Link>
          <Link to="/donations/offline" className="dash-qa-btn" style={{ '--qa-color': '#2563eb', '--qa-bg': '#dbeafe' }}>
            <div className="dash-qa-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiDollarSign /></div>
            Add Offline
          </Link>
          <Link to="/donations/centers" className="dash-qa-btn" style={{ '--qa-color': '#7c3aed', '--qa-bg': '#ede9fe' }}>
            <div className="dash-qa-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><FiMapPin /></div>
            Centers
          </Link>
          <Link to="/profile" className="dash-qa-btn" style={{ '--qa-color': '#d97706', '--qa-bg': '#fef3c7' }}>
            <div className="dash-qa-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiUsers /></div>
            My Profile
          </Link>
        </div>
      </div>

      <div className="dash-main-grid">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><FiClock /> Recent Donations</h3>
            <Link to="/donations/all" className="dash-panel-link">View All</Link>
          </div>
          <div className="dash-table-wrap">
            {loading ? (
              <p className="loading">Loading...</p>
            ) : recentDonations.length === 0 ? (
              <p className="dash-empty">No donations yet</p>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div className="dash-donor-cell">
                          <div className="dash-donor-av" style={{ background: '#dbeafe', color: '#1e40af' }}>
                            {d.donorName?.[0] || '?'}
                          </div>
                          <div>
                            <div className="dash-donor-name">{d.donorName || 'Anonymous'}</div>
                            <div className="dash-donor-email">{d.donorEmail || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="dash-amount">₹{(d.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="dash-purpose">{d.purpose || '—'}</td>
                      <td>
                        <span className={`dash-status ${d.paymentStatus === 'paid' || d.paymentStatus === 'completed' ? 'success' : d.paymentStatus === 'pending' ? 'pending' : 'failed'}`}>
                          {d.paymentStatus || 'unknown'}
                        </span>
                      </td>
                      <td className="dash-date">{d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3 className="dash-panel-title"><FiMapPin /> Collection Centers</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : centers.length === 0 ? (
              <p className="dash-empty">No centers found</p>
            ) : (
              centers.map(c => (
                <div key={c._id} className="dash-msg-item" style={{ cursor: 'default' }}>
                  <div className="dash-msg-av" style={{ background: 'linear-gradient(135deg, #0369a1, #0284c7)' }}>
                    <FiMapPin size={16} />
                  </div>
                  <div className="dash-msg-body">
                    <div className="dash-msg-row">
                      <span className="dash-msg-name">{c.name}</span>
                    </div>
                    <div className="dash-msg-text">
                      {c.city}, {c.state} — {c.contactPerson}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDashboard;
