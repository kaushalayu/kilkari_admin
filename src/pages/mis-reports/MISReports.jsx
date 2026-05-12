import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiBarChart2, FiDownload, FiRefreshCw, FiDollarSign, FiUsers, FiTrendingUp, FiGrid, FiPieChart, FiCalendar, FiChevronDown, FiAward } from 'react-icons/fi';

const PAYMENT_MODE_LABELS = {
  razorpay: 'Razorpay', phonepay: 'PhonePe', qr: 'QR Code',
  cash: 'Cash', cheque: 'Cheque', bank_transfer: 'Bank Transfer',
  dd: 'Demand Draft', upi: 'UPI', other: 'Other'
};

const COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2','#db2777','#ca8a04'];

const RANGES = [
  { value: '1_month', label: '1 Month' },
  { value: '2_months', label: '2 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '1_financial_year', label: 'This FY' },
  { value: 'last_financial_year', label: 'Last FY' },
];

const BarChart = ({ data, color = '#2563eb', height = 200 }) => {
  if (!data || data.length === 0) return null;
  const values = data.map(d => d.total);
  const max = Math.max(...values, 1);
  return (
    <div className="dm-trend-chart" style={{ height, padding: '1rem 1rem 0.5rem' }}>
      {data.map((d, i) => (
        <div key={i} className="dm-trend-col">
          <div className="dm-trend-val" style={{ fontSize: '0.6rem' }}>₹{d.total >= 1000 ? (d.total/1000).toFixed(1)+'k' : d.total}</div>
          <div className="dm-trend-bar-wrap" style={{ background: '#f1f5f9' }}>
            <div className="dm-trend-bar" style={{ height: `${(d.total / max) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}dd)`, minHeight: 4 }} />
          </div>
          <div className="dm-trend-label" style={{ fontSize: '0.55rem', textAlign: 'center' }}>
            {new Date(d._id.year, d._id.month - 1).toLocaleDateString('en-IN', { month: 'short' })}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon, value, label, color, bg }) => (
  <div className="dm-stat-card" style={{ '--sc': color }}>
    <div className="dm-stat-top">
      <div className="dm-stat-icon" style={{ background: bg, color }}>{icon}</div>
    </div>
    <div className="dm-stat-value" style={{ color }}>{value}</div>
    <div className="dm-stat-label">{label}</div>
  </div>
);

const MISReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('6_months');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/reports/mis', { params: { range } });
      setData(res.data);
    } catch { setMsg('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [range]);

  const exportCSV = async () => {
    try {
      const res = await api.get('/reports/export', { params: { range, format: 'csv' }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `mis-report-${Date.now()}.csv`; a.click();
    } catch { setMsg('Export failed'); }
  };

  const totalCollection = (data?.summary?.totalOffline || 0) + (data?.summary?.totalOnline || 0);
  const totalDonations = data?.summary?.totalDonations || 0;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title"><FiBarChart2 /> MIS Reports</h1>
          <p className="dm-subtitle">Donation analytics, trends & insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="dm-btn-outline" onClick={exportCSV}><FiDownload size={13} /> Export CSV</button>
          <button className="dm-btn-outline" onClick={fetchData}><FiRefreshCw size={13} /></button>
        </div>
      </div>

      {msg && <div className={`dm-alert ${msg.includes('Failed') ? 'dm-alert-error' : 'dm-alert-success'}`}>{msg}</div>}

      <div className="dm-filters">
        <div className="dm-date-range-tabs">
          {RANGES.map(r => (
            <button key={r.value} className={`dm-range-tab ${range === r.value ? 'active' : ''}`} onClick={() => setRange(r.value)}>{r.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading report...</div>
      ) : !data ? (
        <div className="dm-empty-state">
          <div className="dm-empty-icon">📊</div>
          <h3>No data available</h3>
          <p>Try selecting a different time range.</p>
        </div>
      ) : (
        <>
          <div className="dm-stats dm-stats-4">
            <StatCard icon={<FiDollarSign />} value={`₹${totalCollection.toLocaleString('en-IN')}`} label="Total Collection" color="#2563eb" bg="#dbeafe" />
            <StatCard icon={<FiTrendingUp />} value={`₹${(data.summary?.totalOnline || 0).toLocaleString('en-IN')}`} label="Online Donations" color="#059669" bg="#d1fae5" />
            <StatCard icon={<FiUsers />} value={`₹${(data.summary?.totalOffline || 0).toLocaleString('en-IN')}`} label="Offline Collections" color="#d97706" bg="#fef3c7" />
            <StatCard icon={<FiBarChart2 />} value={totalDonations} label="Total Transactions" color="#7c3aed" bg="#ede9fe" />
          </div>

          <div className="dm-card">
            <div className="dm-card-header">
              <h3 className="dm-card-title"><FiBarChart2 /> Monthly Donation Trends</h3>
              {data.monthlyTrends && data.monthlyTrends.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {data.monthlyTrends[0] && new Date(data.monthlyTrends[0]._id.year, data.monthlyTrends[0]._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  {' — '}
                  {data.monthlyTrends[data.monthlyTrends.length - 1] && new Date(data.monthlyTrends[data.monthlyTrends.length - 1]._id.year, data.monthlyTrends[data.monthlyTrends.length - 1]._id.month - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            {(data.monthlyTrends || []).length === 0 ? (
              <div className="dm-card-body"><p className="text-dim">No trend data available for this period</p></div>
            ) : (
              <BarChart data={data.monthlyTrends} color="#2563eb" height={200} />
            )}
          </div>

          <div className="dm-grid-2">
            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title"><FiGrid /> Payment Mode Breakup</h3>
              </div>
              <div className="dm-card-body">
                {Object.entries(data.paymentModeBreakup || {}).length === 0 ? (
                  <p className="text-dim">No payment data available</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(data.paymentModeBreakup || {}).map(([mode, val], i) => {
                      const pct = totalCollection > 0 ? ((val.total / totalCollection) * 100).toFixed(1) : 0;
                      return (
                        <div key={mode}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 500 }}>{PAYMENT_MODE_LABELS[mode] || mode}</span>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{val.total.toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{val.count} transactions · {pct}%</div>
                            </div>
                          </div>
                          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, transition: 'width 0.5s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="dm-card">
              <div className="dm-card-header">
                <h3 className="dm-card-title"><FiAward /> Top Donors</h3>
              </div>
              <div className="dm-card-body">
                {(data.topDonors || []).length === 0 ? (
                  <p className="text-dim">No donor data available</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(data.topDonors || []).slice(0, 10).map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: i < 3 ? ['#fef3c7','#e0f2fe','#d1fae5'][i] : '#f1f5f9',
                          color: i < 3 ? ['#92400e','#1e40af','#065f46'][i] : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                          border: i === 0 ? '2px solid #fbbf24' : 'none'
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{d.donorName}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{d.city || '—'} · {d.totalDonations || 0} donations</div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{d.totalAmount?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MISReports;
