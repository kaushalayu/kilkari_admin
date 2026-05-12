import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getFullUrl } from '../../api/client';
import {
  FiDollarSign, FiUsers, FiTrendingUp, FiCheckCircle,
  FiClock, FiArrowRight, FiCalendar,
  FiRepeat, FiActivity
} from 'react-icons/fi';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const avColor = (s = '') => AV_COLORS[s.charCodeAt(0) % AV_COLORS.length];

const StatCard = ({ label, value, icon: Icon, color, bg, sub }) => (
  <div className="dm-stat-card" style={{ '--sc': color }}>
    <div className="dm-stat-top">
      <div className="dm-stat-icon" style={{ background: bg, color }}><Icon /></div>
    </div>
    <div className="dm-stat-value">{value}</div>
    <div className="dm-stat-label">{label}</div>
    {sub && <div className="dm-stat-sub">{sub}</div>}
  </div>
);

const DonationDashboard = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations?limit=100')
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const success  = data.filter(d => d.paymentStatus === 'success');
  const pending  = data.filter(d => d.paymentStatus === 'pending');
  const failed   = data.filter(d => d.paymentStatus === 'failed');
  const monthly  = data.filter(d => d.donationType === 'monthly');
  const total    = success.reduce((s, d) => s + (d.amount || 0), 0);
  const avgAmt   = success.length ? Math.round(total / success.length) : 0;

  // Purpose breakdown
  const purposeMap = {};
  success.forEach(d => {
    const p = d.purpose || 'General';
    purposeMap[p] = (purposeMap[p] || 0) + (d.amount || 0);
  });
  const purposes = Object.entries(purposeMap).sort((a,b) => b[1]-a[1]).slice(0,5);
  const maxPurpose = purposes[0]?.[1] || 1;

  // Recent 5
  const recent = [...data].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  // Monthly trend (last 6 months)
  const monthlyTrend = (() => {
    const map = {};
    success.forEach(d => {
      const dt = new Date(d.createdAt);
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + (d.amount || 0);
    });
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - i);
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      months.push({ label: dt.toLocaleDateString('en-IN',{month:'short'}), amount: map[key] || 0 });
    }
    return months;
  })();
  const maxTrend = Math.max(...monthlyTrend.map(m => m.amount), 1);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Donation Dashboard</h1>
          <p className="dm-subtitle">Overview of all donation activity</p>
        </div>
        <Link to="/donations/all" className="dm-btn-primary">
          <FiDollarSign /> View All Donations
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="dm-stats">
        <StatCard label="Total Collected"   value={`₹${total.toLocaleString('en-IN')}`} icon={FiDollarSign}   color="#059669" bg="#ecfdf5" sub={`${success.length} successful`} />
        <StatCard label="Total Donors"      value={data.length}                          icon={FiUsers}        color="#2563eb" bg="#eff6ff" sub="all time" />
        <StatCard label="Avg. Donation"     value={`₹${avgAmt.toLocaleString('en-IN')}`} icon={FiTrendingUp}  color="#7c3aed" bg="#f5f3ff" sub="per transaction" />
        <StatCard label="Successful"        value={success.length}                       icon={FiCheckCircle}  color="#059669" bg="#ecfdf5" />
        <StatCard label="Pending"           value={pending.length}                       icon={FiClock}        color="#d97706" bg="#fffbeb" />
        <StatCard label="Monthly Recurring" value={monthly.length}                       icon={FiRepeat}       color="#0891b2" bg="#ecfeff" />
      </div>

      <div className="dm-grid-2">
        {/* Monthly Trend */}
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiActivity /> Monthly Trend (Last 6 Months)</span>
          </div>
          <div className="dm-trend-chart">
            {monthlyTrend.map((m, i) => (
              <div key={i} className="dm-trend-col">
                <div className="dm-trend-bar-wrap">
                  <div
                    className="dm-trend-bar"
                    style={{ height: `${Math.round((m.amount / maxTrend) * 100)}%` }}
                    title={`₹${m.amount.toLocaleString('en-IN')}`}
                  />
                </div>
                <div className="dm-trend-label">{m.label}</div>
                <div className="dm-trend-val">
                  {m.amount > 0 ? `₹${(m.amount/1000).toFixed(1)}k` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose Breakdown */}
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiDollarSign /> Top Donation Purposes</span>
          </div>
          <div className="dm-purpose-list">
            {purposes.length === 0 && <p className="dm-empty">No data yet.</p>}
            {purposes.map(([purpose, amount], i) => (
              <div key={i} className="dm-purpose-item">
                <div className="dm-purpose-label">{purpose}</div>
                <div className="dm-purpose-bar-wrap">
                  <div
                    className="dm-purpose-bar"
                    style={{ width: `${Math.round((amount/maxPurpose)*100)}%` }}
                  />
                </div>
                <div className="dm-purpose-val">₹{amount.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="dm-card">
        <div className="dm-card-header">
          <span className="dm-card-title"><FiCalendar /> Recent Donations</span>
          <Link to="/donations/all" className="dm-card-link">View All <FiArrowRight size={12}/></Link>
        </div>
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead><tr><th>Donor</th><th>Amount</th><th>Purpose</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map((d,i) => (
                <tr key={i}>
                  <td>
                    <div className="dm-donor-cell">
                      <div className="dm-av" style={{ background: avColor(d.donorName||'A') }}>
                        {(d.donorName||'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="dm-donor-name">{d.donorName}</div>
                        <div className="dm-donor-email">{d.donorEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="dm-amount">₹{(d.amount||0).toLocaleString('en-IN')}</td>
                  <td className="dm-dim">{d.purpose||'General'}</td>
                  <td className="dm-dim">{d.donationType==='monthly'?'Monthly':'One-time'}</td>
                  <td><span className={`dm-status dm-status-${d.paymentStatus}`}>{d.paymentStatus}</span></td>
                  <td className="dm-dim">{new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={6} className="dm-empty">No donations yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonationDashboard;
