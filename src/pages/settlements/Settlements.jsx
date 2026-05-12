import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiCheck, FiX, FiClock, FiSearch, FiDollarSign, FiRefreshCw, FiEye, FiChevronLeft, FiChevronRight, FiGrid, FiList } from 'react-icons/fi';

const STATUS_META = {
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  under_review: { bg: '#dbeafe', color: '#1e40af', label: 'Under Review' },
  settled: { bg: '#d1fae5', color: '#065f46', label: 'Settled' },
  rejected: { bg: '#fce7f3', color: '#991b1b', label: 'Rejected' },
};

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];

const Settlements = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('cards');

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        api.get(`/settlements?status=${tab}&search=${search}&page=${p || page}&limit=20`),
        api.get('/settlements/summary')
      ]);
      const d = listRes.data;
      setData(d.data || []);
      setTotal(d.total || 0);
      setTotalPages(d.pages || 1);
      setSummary(summaryRes.data.data);
    } catch { setMsg('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); setPage(1); }, [tab, search]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  const handleMarkUnderReview = async (id) => {
    try {
      await api.put(`/settlements/${id}/under-review`);
      setMsg('Marked under review');
      fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/settlements/${id}/approve`);
      setMsg('Settlement approved!');
      fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await api.put(`/settlements/${id}/reject`, { rejectionReason: reason });
      setMsg('Settlement rejected.');
      fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
  };

  const tabs = [
    { key: 'pending', label: 'Pending', icon: FiClock },
    { key: 'under_review', label: 'Under Review', icon: FiEye },
    { key: 'settled', label: 'Settled', icon: FiCheck },
    { key: 'rejected', label: 'Rejected', icon: FiX },
  ];

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title"><FiDollarSign /> Settlements</h1>
          <p className="dm-subtitle">{total} settlements</p>
        </div>
        <button className="dm-btn-outline" onClick={() => fetchData(page)}><FiRefreshCw size={13} /> Refresh</button>
      </div>

      {msg && <div className={`dm-alert ${msg.includes('Failed') ? 'dm-alert-error' : 'dm-alert-success'}`}>{msg}</div>}

      {summary && (
        <div className="dm-stats">
          {tabs.map(t => {
            const s = summary[t.key] || { count: 0, total: 0 };
            const meta = STATUS_META[t.key];
            return (
              <div key={t.key} className="dm-stat-card" style={{ '--sc': meta.color, cursor: 'pointer' }} onClick={() => setTab(t.key)}>
                <div className="dm-stat-top">
                  <div className="dm-stat-icon" style={{ background: meta.bg, color: meta.color }}><t.icon /></div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: meta.color }}>{s.count}</span>
                </div>
                <div className="dm-stat-value" style={{ color: meta.color }}>₹{s.total.toLocaleString('en-IN')}</div>
                <div className="dm-stat-label">{t.label}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="dm-filters">
        <div className="dm-status-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`dm-status-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
        <div className="dm-search-bar" style={{ maxWidth: 250 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="dm-toggle-group">
          <button className={`dm-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')}><FiGrid size={13} /></button>
          <button className={`dm-toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}><FiList size={13} /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : viewMode === 'cards' ? (
        <>
          {data.length === 0 ? (
            <div className="dm-empty-state">
              <div className="dm-empty-icon">📋</div>
              <h3>No settlements found</h3>
              <p>Settlements appear here when centers request payment clearance.</p>
            </div>
          ) : (
            <div className="donor-cards-grid">
              {data.map(s => {
                const meta = STATUS_META[s.status] || STATUS_META.pending;
                return (
                  <div key={s._id} className="donor-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
                    <div className="donor-card-accent" style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)` }} />
                    <div className="donor-card-top">
                      <div className="donor-card-av" style={{ background: meta.color }}><FiDollarSign /></div>
                      <div className="donor-card-identity">
                        <div className="donor-card-name">{s.settlementId}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.center?.name || '—'}</span>
                      </div>
                      <div className="donor-card-total">
                        <div className="donor-card-total-val" style={{ color: meta.color, fontSize: '0.9rem' }}>₹{s.totalAmount?.toLocaleString('en-IN')}</div>
                        <div className="donor-card-total-label">{s.donations?.length || 0} donations</div>
                      </div>
                    </div>
                    <div className="donor-card-rows">
                      <div className="donor-card-row">
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Status · Payment Mode</span>
                          <span className="donor-card-row-value">
                            <span className={`status-badge status-${s.status === 'settled' ? 'success' : s.status === 'rejected' ? 'failed' : 'pending'}`}>{s.status}</span>
                            {' · '}{s.paymentMode}
                          </span>
                        </div>
                      </div>
                      <div className="donor-card-row">
                        <div className="donor-card-row-body">
                          <span className="donor-card-row-label">Requested By · Date</span>
                          <span className="donor-card-row-value">{s.requestedBy?.name || '—'} · {new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="donor-card-footer" onClick={e => e.stopPropagation()}>
                      <button className="dm-btn-sm" onClick={() => setSelected(s)}><FiEye size={11} /> View</button>
                      {s.status === 'pending' && (
                        <button className="dm-btn-sm" onClick={() => handleMarkUnderReview(s._id)}><FiEye size={11} /> Review</button>
                      )}
                      {(s.status === 'pending' || s.status === 'under_review') && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
                          <button className="dm-btn-sm" style={{ color: '#059669' }} onClick={() => handleApprove(s._id)}><FiCheck size={11} /> Approve</button>
                          <button className="dm-btn-sm dm-btn-clear" onClick={() => handleReject(s._id)}><FiX size={11} /> Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {totalPages > 1 && (
            <div className="dm-pagination">
              <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><FiChevronLeft /></button>
              <span className="dm-page-info">Page {page} of {totalPages}</span>
              <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="dm-card">
            <div className="dm-table-wrap">
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Settlement ID</th><th>Center</th><th className="hide-mobile">Donations</th>
                    <th>Total Amount</th><th className="hide-mobile">Payment Mode</th>
                    <th className="hide-mobile">Requested By</th><th className="hide-mobile">Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={8} className="dm-empty">No settlements found</td></tr>}
                  {data.map(s => (
                    <tr key={s._id}>
                      <td className="dm-dim dm-mono" style={{ fontSize: '0.7rem' }}>{s.settlementId}</td>
                      <td>{s.center?.name || '—'}</td>
                      <td className="hide-mobile"><span className="dm-count-badge">{s.donations?.length || 0}</span></td>
                      <td className="dm-amount">₹{s.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="hide-mobile"><span className={`dm-status ${s.status === 'settled' ? 'dm-status-success' : s.status === 'rejected' ? 'dm-status-failed' : 'dm-status-pending'}`}>{s.paymentMode}</span></td>
                      <td className="hide-mobile dm-dim">{s.requestedBy?.name || '—'}</td>
                      <td className="hide-mobile dm-dim">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="dm-btn-sm" onClick={() => setSelected(s)}><FiEye size={11} /></button>
                          {s.status === 'pending' && (
                            <button className="dm-btn-sm" onClick={() => handleMarkUnderReview(s._id)}>Review</button>
                          )}
                          {(s.status === 'pending' || s.status === 'under_review') && (
                            <>
                              <button className="dm-btn-sm" style={{ color: '#059669' }} onClick={() => handleApprove(s._id)}><FiCheck size={11} /> Appr.</button>
                              <button className="dm-btn-sm dm-btn-clear" onClick={() => handleReject(s._id)}><FiX size={11} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="dm-pagination">
                <button className="dm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><FiChevronLeft /></button>
                <span className="dm-page-info">Page {page} of {totalPages}</span>
                <button className="dm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><FiChevronRight /></button>
              </div>
            )}
          </div>
        </>
      )}

      {selected && (
        <div className="dm-modal-overlay" onClick={() => setSelected(null)}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <div className="dm-av dm-av-lg" style={{ background: (STATUS_META[selected.status] || STATUS_META.pending).color }}>
                <FiDollarSign />
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="dm-modal-name">{selected.settlementId}</h2>
                <p className="dm-modal-sub">{selected.center?.name || '—'} · {selected.center?.code || ''}</p>
              </div>
              <button className="dm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="dm-modal-info">
              <div className="dm-info-row"><FiDollarSign /> <strong>Total Amount:</strong> ₹{selected.totalAmount?.toLocaleString('en-IN')} · <span className={`status-badge status-${selected.status === 'settled' ? 'success' : selected.status === 'rejected' ? 'failed' : 'pending'}`}>{selected.status}</span></div>
              <div className="dm-info-row"><FiClock /> <strong>Requested By:</strong> {selected.requestedBy?.name || '—'} · {new Date(selected.createdAt).toLocaleDateString('en-IN')}</div>
              {selected.remarks && <div className="dm-info-row"><strong>Remarks:</strong> {selected.remarks}</div>}
              {selected.rejectionReason && <div className="dm-info-row" style={{ color: '#dc2626' }}><strong>Rejection:</strong> {selected.rejectionReason}</div>}
              {selected.adminNotes && <div className="dm-info-row"><strong>Admin Notes:</strong> {selected.adminNotes}</div>}
            </div>
            <div className="dm-modal-body" style={{ maxHeight: 250, overflowY: 'auto', borderBottom: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Donations ({selected.donations?.length || 0})</h4>
              {(!selected.donations || selected.donations.length === 0) ? (
                <p className="text-dim" style={{ fontSize: '0.78rem' }}>No donations in this settlement.</p>
              ) : (
                <div className="dm-table-wrap">
                  <table className="dm-table" style={{ fontSize: '0.78rem' }}>
                    <thead><tr><th>Donation ID</th><th>Amount</th><th>Payment Mode</th></tr></thead>
                    <tbody>
                      {(selected.donations || []).map((d, i) => (
                        <tr key={i}>
                          <td className="dm-mono">{d.donation?.donationId || '—'}</td>
                          <td className="dm-amount">₹{d.amount?.toLocaleString('en-IN')}</td>
                          <td className="dm-dim">{d.paymentMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;
