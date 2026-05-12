import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers, FiBriefcase, FiDownload, FiBarChart2 } from 'react-icons/fi';

const BoardDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [report, setReport] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/board/financial-overview', { params: { year } }),
      api.get('/board/annual-report', { params: { year } }),
      api.get('/board/projects')
    ]).then(([o, r, p]) => {
      setOverview(o.data.data);
      setReport(r.data.data);
      setProjects(p.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [year]);

  const downloadReport = async () => {
    try {
      const res = await api.get('/reports/export', { params: { range: '1_financial_year', format: 'csv' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `annual-report-${year}.csv`; a.click();
    } catch {}
  };

  if (loading) return <div className="loading-screen"><div className="loading">Loading board data...</div></div>;

  return (
    <div className="board-dashboard">
      <div className="page-header">
        <h2 className="page-title">Board Dashboard</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select className="form-control" style={{ width: 100 }} value={year} onChange={e => setYear(e.target.value)}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-outline" onClick={downloadReport}><FiDownload /> Report</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['overview', 'projects', 'fcra'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <>
          <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total Donations', value: `₹${(overview.totalDonations || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: '#2563eb', bg: '#dbeafe' },
              { label: 'Total Income', value: `₹${(overview.totalIncome || 0).toLocaleString('en-IN')}`, icon: FiTrendingUp, color: '#059669', bg: '#d1fae5' },
              { label: 'Total Expense', value: `₹${(overview.totalExpense || 0).toLocaleString('en-IN')}`, icon: FiTrendingDown, color: '#dc2626', bg: '#fce7f3' },
              { label: 'Net Balance', value: `₹${(overview.netBalance || 0).toLocaleString('en-IN')}`, icon: FiBarChart2, color: overview.netBalance >= 0 ? '#059669' : '#dc2626', bg: '#fef3c7' },
              { label: 'New Donors', value: overview.totalDonors || 0, icon: FiUsers, color: '#7c3aed', bg: '#ede9fe' },
              { label: 'Active Projects', value: overview.budgetAllocated > 0 ? 'Active' : '0', icon: FiBriefcase, color: '#0891b2', bg: '#e0f2fe' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {report && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header"><h3 className="card-title">Annual Summary - FY {year}</h3></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div><strong>Online Donations</strong><br />₹{report.summary.totalOnline.toLocaleString('en-IN')}</div>
                  <div><strong>Offline Donations</strong><br />₹{report.summary.totalOffline.toLocaleString('en-IN')}</div>
                  <div><strong>Total Expenses</strong><br />₹{report.summary.totalExpenses.toLocaleString('en-IN')}</div>
                  <div><strong>Net Surplus</strong><br /><span style={{ color: report.summary.netSurplus >= 0 ? '#059669' : '#dc2626' }}>₹{report.summary.netSurplus.toLocaleString('en-IN')}</span></div>
                  <div><strong>New Donors</strong><br />{report.summary.newDonors}</div>
                  <div><strong>Events Conducted</strong><br />{report.summary.totalEvents}</div>
                </div>
              </div>
            </div>
          )}

          {overview.monthlyTrends?.length > 0 && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header"><h3 className="card-title">Monthly Donation Trends</h3></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end', minHeight: 120, padding: '1rem 0' }}>
                  {overview.monthlyTrends.map((m, i) => {
                    const max = Math.max(...overview.monthlyTrends.map(x => x.total));
                    const h = max > 0 ? (m.total / max) * 100 : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>₹{(m.total / 1000).toFixed(0)}k</span>
                        <div style={{ width: '100%', background: '#dbeafe', borderRadius: '4px 4px 0 0', height: `${h}%`, minHeight: 8, transition: 'height 0.3s' }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-light)' }}>{['J','F','M','A','M','J','J','A','S','O','N','D'][m._id.month - 1]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'projects' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Project</th><th>Budget</th><th>Spent</th><th>Status</th><th>Milestones</th></tr></thead>
            <tbody>
              {projects.length === 0 && <tr><td colSpan={5} className="text-center text-dim">No projects</td></tr>}
              {projects.map(p => (
                <tr key={p._id}>
                  <td><strong>{p.title}</strong></td>
                  <td>₹{(p.budget || 0).toLocaleString('en-IN')}</td>
                  <td>₹{(p.budgetSpent || 0).toLocaleString('en-IN')}</td>
                  <td><span className={`status-badge ${p.status === 'active' ? 'status-success' : p.status === 'completed' ? 'status-failed' : 'status-pending'}`}>{p.status}</span></td>
                  <td>{(p.milestones || []).filter(m => m.status === 'completed').length}/{p.milestones?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fcra' && (
        <div className="card">
          <div className="card-header"><h3 className="card-title">FCRA Report - FY {year}</h3></div>
          <div className="card-body">
            <p className="text-dim">FCRA-related transactions and reports are available for compliance review. Download the detailed report from the MIS Reports section.</p>
          </div>
        </div>
      )}

      <div className="board-footer-notice" style={{ marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: '#92400e' }}>
        <strong>Read-Only Access:</strong> You are viewing board-level data. No modifications can be made from this dashboard.
      </div>
    </div>
  );
};

export default BoardDashboard;
