import { useState, useEffect } from 'react';
import api, { getFullUrl } from '../../api/client';
import { FiSearch, FiDownload, FiX } from 'react-icons/fi';

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const avColor = (s = '') => AV_COLORS[s.charCodeAt(0) % AV_COLORS.length];

const AllDonations = () => {
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [type, setType]         = useState('');
  const [page, setPage]         = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    api.get('/donations?limit=500')
      .then(r => setData(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(d => {
    const matchSearch = !search ||
      d.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.donorEmail?.toLowerCase().includes(search.toLowerCase()) ||
      d.donorPhone?.includes(search) ||
      d.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !status || d.paymentStatus === status;
    const matchType   = !type   || d.donationType  === type;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const exportCSV = () => {
    const rows = [['Name','Email','Phone','City','PAN','Amount','Type','Purpose','Status','Payment ID','Date']];
    filtered.forEach(d => rows.push([
      d.donorName, d.donorEmail, d.donorPhone, d.donorCity||'', d.donorPAN||'',
      d.amount, d.donationType, d.purpose||'General', d.paymentStatus,
      d.razorpayPaymentId||'', new Date(d.createdAt).toLocaleDateString('en-IN')
    ]));
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'donations.csv';
    a.click();
  };

  const clearFilters = () => { setSearch(''); setStatus(''); setType(''); setPage(1); };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">All Donations</h1>
          <p className="dm-subtitle">{filtered.length} records {filtered.length !== data.length && `(filtered from ${data.length})`}</p>
        </div>
        <button className="dm-btn-outline" onClick={exportCSV}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="dm-filters">
        <div className="dm-search-bar">
          <FiSearch className="dm-search-icon" />
          <input
            className="dm-search-input"
            placeholder="Search donor, email, phone, purpose..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="dm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select className="dm-select" value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="once">One-time</option>
          <option value="monthly">Monthly</option>
        </select>
        {(search || status || type) && (
          <button className="dm-btn-sm dm-btn-clear" onClick={clearFilters}>
            <FiX size={12} /> Clear
          </button>
        )}
      </div>

      <div className="dm-card">
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Docs</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="dm-empty">No donations match your filters.</td></tr>
              )}
              {paginated.map(d => (
                <tr key={d._id || d.donationId}>
                  <td>
                    <div className="dm-donor-cell">
                      <div className="dm-av" style={{ background: avColor(d.donorName||'A') }}>
                        {(d.donorName||'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="dm-donor-name">{d.donorName}</div>
                        <div className="dm-donor-email">{d.donorEmail || d.donorPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="dm-amount">₹{(d.amount||0).toLocaleString('en-IN')}</td>
                  <td className="dm-dim">{d.purpose || 'General'}</td>
                  <td className="dm-dim">{d.donationType === 'monthly' ? 'Monthly' : 'One-time'}</td>
                  <td><span className={`dm-status dm-status-${d.paymentStatus}`}>{d.paymentStatus}</span></td>
                  <td className="dm-dim dm-mono">{d.razorpayPaymentId ? d.razorpayPaymentId.slice(-10) : '—'}</td>
                  <td className="dm-dim">{new Date(d.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</td>
                  <td>
                    <div style={{ display:'flex', gap:'0.4rem' }}>
                      {d.receiptUrl && (
                        <a href={getFullUrl(d.receiptUrl)} target="_blank" rel="noopener noreferrer" className="dm-doc-btn" title="Receipt">
                          <FiDownload size={12}/> R
                        </a>
                      )}
                      {d.certificateUrl && (
                        <a href={getFullUrl(d.certificateUrl)} target="_blank" rel="noopener noreferrer" className="dm-doc-btn dm-doc-btn-green" title="80G Certificate">
                          <FiDownload size={12}/> 80G
                        </a>
                      )}
                      {!d.receiptUrl && !d.certificateUrl && <span className="dm-dim">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="dm-pagination">
            <button className="dm-page-btn" disabled={page === 1} onClick={() => setPage(p => p-1)}>‹ Prev</button>
            <span className="dm-page-info">Page {page} of {totalPages}</span>
            <button className="dm-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllDonations;
