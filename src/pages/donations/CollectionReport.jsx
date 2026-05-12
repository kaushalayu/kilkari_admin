import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiDownload, FiCalendar, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CollectionReport = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState(new Date().getFullYear());
  const [view, setView]       = useState('monthly'); // monthly | quarterly

  useEffect(() => {
    api.get('/donations?limit=1000')
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const success = data.filter(d => d.paymentStatus === 'success');

  // Available years from data
  const years = [...new Set(success.map(d => new Date(d.createdAt).getFullYear()))].sort((a,b) => b - a);

  // Monthly breakdown for selected year
  const monthly = MONTHS.map((label, mi) => {
    const items = success.filter(d => {
      const dt = new Date(d.createdAt);
      return dt.getFullYear() === year && dt.getMonth() === mi;
    });
    return {
      label,
      count:     items.length,
      amount:    items.reduce((s, d) => s + (d.amount || 0), 0),
      oneTime:   items.filter(d => d.donationType !== 'monthly').reduce((s, d) => s + (d.amount || 0), 0),
      recurring: items.filter(d => d.donationType === 'monthly').reduce((s, d) => s + (d.amount || 0), 0),
    };
  });

  // Quarterly rollup
  const quarterly = [0, 1, 2, 3].map(q => {
    const slice = monthly.slice(q * 3, q * 3 + 3);
    return {
      label:     `Q${q + 1} (${slice[0].label}–${slice[2].label})`,
      count:     slice.reduce((s, m) => s + m.count, 0),
      amount:    slice.reduce((s, m) => s + m.amount, 0),
      oneTime:   slice.reduce((s, m) => s + m.oneTime, 0),
      recurring: slice.reduce((s, m) => s + m.recurring, 0),
    };
  });

  const rows      = view === 'monthly' ? monthly : quarterly;
  const yearTotal = monthly.reduce((s, m) => s + m.amount, 0);
  const yearCount = monthly.reduce((s, m) => s + m.count, 0);
  const maxBar    = Math.max(...rows.map(r => r.amount), 1);

  const exportCSV = () => {
    const headers = ['Period', 'Donations', 'Total Amount', 'One-time', 'Recurring'];
    const csvRows = [headers, ...rows.map(r => [r.label, r.count, r.amount, r.oneTime, r.recurring])];
    const csv = csvRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `collection-report-${year}.csv`;
    a.click();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Collection Report</h1>
          <p className="dm-subtitle">Year-wise donation collection breakdown</p>
        </div>
        <button className="dm-btn-outline" onClick={exportCSV}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="dm-filters">
        <select
          className="dm-select"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
        >
          {years.length === 0
            ? <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            : years.map(y => <option key={y} value={y}>{y}</option>)
          }
        </select>
        <div className="dm-toggle-group">
          <button className={`dm-toggle-btn ${view === 'monthly'   ? 'active' : ''}`} onClick={() => setView('monthly')}>Monthly</button>
          <button className={`dm-toggle-btn ${view === 'quarterly' ? 'active' : ''}`} onClick={() => setView('quarterly')}>Quarterly</button>
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="dm-stats dm-stats-3">
        <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}><FiDollarSign /></div>
          </div>
          <div className="dm-stat-value">₹{yearTotal.toLocaleString('en-IN')}</div>
          <div className="dm-stat-label">Total Collected in {year}</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#2563eb' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><FiCalendar /></div>
          </div>
          <div className="dm-stat-value">{yearCount}</div>
          <div className="dm-stat-label">Total Donations in {year}</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#7c3aed' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><FiTrendingUp /></div>
          </div>
          <div className="dm-stat-value">
            ₹{yearCount ? Math.round(yearTotal / yearCount).toLocaleString('en-IN') : 0}
          </div>
          <div className="dm-stat-label">Average per Donation</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="dm-card">
        <div className="dm-card-header">
          <span className="dm-card-title"><FiTrendingUp /> Collection Chart — {year}</span>
        </div>
        <div className="dm-bar-chart">
          {rows.map((r, i) => (
            <div key={i} className="dm-bar-col">
              <div className="dm-bar-wrap">
                <div className="dm-bar-inner">
                  <div
                    className="dm-bar-fill dm-bar-recurring"
                    style={{ height: `${Math.round((r.recurring / maxBar) * 100)}%` }}
                    title={`Recurring: ₹${r.recurring.toLocaleString('en-IN')}`}
                  />
                  <div
                    className="dm-bar-fill dm-bar-onetime"
                    style={{ height: `${Math.round((r.oneTime / maxBar) * 100)}%` }}
                    title={`One-time: ₹${r.oneTime.toLocaleString('en-IN')}`}
                  />
                </div>
              </div>
              <div className="dm-bar-label">{r.label}</div>
              <div className="dm-bar-val">{r.amount > 0 ? `₹${(r.amount / 1000).toFixed(1)}k` : '—'}</div>
            </div>
          ))}
        </div>
        <div className="dm-chart-legend">
          <span className="dm-legend-dot" style={{ background: '#2563eb' }} /> One-time
          <span className="dm-legend-dot" style={{ background: '#7c3aed', marginLeft: '1rem' }} /> Recurring
        </div>
      </div>

      {/* Detailed Table */}
      <div className="dm-card">
        <div className="dm-card-header">
          <span className="dm-card-title"><FiCalendar /> Detailed Breakdown</span>
        </div>
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Donations</th>
                <th>One-time</th>
                <th>Recurring</th>
                <th>Total Amount</th>
                <th>% of Year</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.amount === 0 ? 'dm-row-empty' : ''}>
                  <td className="dm-donor-name">{r.label}</td>
                  <td className="dm-dim">{r.count}</td>
                  <td className="dm-dim">₹{r.oneTime.toLocaleString('en-IN')}</td>
                  <td className="dm-dim">₹{r.recurring.toLocaleString('en-IN')}</td>
                  <td className="dm-amount">₹{r.amount.toLocaleString('en-IN')}</td>
                  <td>
                    <div className="dm-pct-bar-wrap">
                      <div
                        className="dm-pct-bar"
                        style={{ width: `${yearTotal ? Math.round((r.amount / yearTotal) * 100) : 0}%` }}
                      />
                      <span className="dm-pct-label">
                        {yearTotal ? Math.round((r.amount / yearTotal) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="dm-total-row">
                <td><strong>Total</strong></td>
                <td><strong>{yearCount}</strong></td>
                <td><strong>₹{monthly.reduce((s, m) => s + m.oneTime, 0).toLocaleString('en-IN')}</strong></td>
                <td><strong>₹{monthly.reduce((s, m) => s + m.recurring, 0).toLocaleString('en-IN')}</strong></td>
                <td className="dm-amount"><strong>₹{yearTotal.toLocaleString('en-IN')}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollectionReport;
