import { useState, useEffect } from 'react';
import api, { getFullUrl } from '../../api/client';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiDownload } from 'react-icons/fi';

const Donations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations').then(res => setData(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const totalAmount = data.reduce((sum, d) => sum + (d.amount || 0), 0);
  const successCount = data.filter(d => d.paymentStatus === 'success').length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Donations</h2>
      </div>
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
          <div className="stat-info"><h3>₹{totalAmount.toLocaleString()}</h3><p>Total Amount</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}><FiCalendar /></div>
          <div className="stat-info"><h3>{data.length}</h3><p>Total Donations</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiCheckCircle /></div>
          <div className="stat-info"><h3>{successCount}</h3><p>Successful</p></div>
        </div>
      </div>
      {loading && <p className="loading">Loading...</p>}
      {!loading && data.length === 0 && <p className="empty">No donations yet.</p>}
      {!loading && data.length > 0 && (
        <div className="table-container">
          <div className="table-scroll-wrap">
            <table className="data-table">
                <thead>
                  <tr><th>Donor</th><th>Phone</th><th>Email</th><th>Amount</th><th>Type</th><th>Purpose</th><th>Status</th><th>Receipt</th><th>Date</th></tr>
                </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d._id}>
                    <td>{d.donorName}</td>
                    <td>{d.donorPhone}</td>
                    <td>{d.donorEmail}</td>
                    <td><strong>₹{d.amount?.toLocaleString()}</strong></td>
                    <td>{d.donationType === 'once' ? 'One Time' : 'Monthly'}</td>
                    <td>{d.purpose || '—'}</td>
                    <td><span className={`status-badge status-${d.paymentStatus}`}>{d.paymentStatus}</span></td>
                    <td>
                      {d.receiptUrl && <a href={getFullUrl(d.receiptUrl)} target="_blank" rel="noopener noreferrer" title="Download Receipt"><FiDownload /></a>}
                      {d.certificateUrl && <a href={getFullUrl(d.certificateUrl)} target="_blank" rel="noopener noreferrer" title="Download 80G Certificate" style={{ marginLeft: '0.4rem' }}><FiDownload /></a>}
                      {!d.receiptUrl && !d.certificateUrl && <span style={{ color: 'var(--text-light)' }}>—</span>}
                    </td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donations;
