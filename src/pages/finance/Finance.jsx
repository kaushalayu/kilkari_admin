import { useState, useEffect } from 'react';
import api from '../../api/client';
import { FiPlus, FiSearch, FiRefreshCw, FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiTrash2, FiEdit2, FiEye, FiX } from 'react-icons/fi';

const emptyForm = { type: 'income', category: '', amount: '', description: '', date: '', paymentMode: 'cash', fcraRelated: false, fcraReference: '', receiptNumber: '', donorName: '', notes: '' };

const Finance = () => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('table');
  const [selected, setSelected] = useState(null);

  const fetchData = async (p) => {
    setLoading(true);
    try {
      const params = { page: p || page, limit: 25, search };
      if (tab !== 'all') params.type = tab;
      const { data: res } = await api.get('/transactions', { params });
      setData(res.data || []);
      setSummary(res.summary);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch { setMsg('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); setPage(1); }, [tab, search]);
  useEffect(() => { if (page > 1) fetchData(page); }, [page]);

  const reset = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/transactions/${editId}`, form);
      else await api.post('/transactions', form);
      setMsg(editId ? 'Updated!' : 'Created!');
      reset(); fetchData(page);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await api.delete(`/transactions/${id}`); setMsg('Deleted!'); fetchData(page); }
    catch { setMsg('Delete failed'); }
  };

  const handleEdit = (t) => {
    setForm({
      ...emptyForm,
      type: t.type, category: t.category || '', amount: t.amount || '',
      description: t.description || '', date: t.date ? t.date.split('T')[0] : '',
      paymentMode: t.paymentMode || 'cash', fcraRelated: t.fcraRelated || false,
      fcraReference: t.fcraReference || '', receiptNumber: t.receiptNumber || '',
      donorName: t.donorName || '', notes: t.notes || ''
    });
    setEditId(t._id);
    setShowForm(true);
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title"><FiDollarSign /> Finance Ledger</h1>
          <p className="dm-subtitle">{total} transactions</p>
        </div>
        <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>
          <FiPlus size={13} /> Add Transaction
        </button>
      </div>

      {msg && <div className={`dm-alert ${msg.includes('Failed') || msg.includes('fail') ? 'dm-alert-error' : 'dm-alert-success'}`}>{msg}</div>}

      {summary && (
        <div className="dm-stats dm-stats-3">
          <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
            <div className="dm-stat-top">
              <div className="dm-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><FiTrendingUp /></div>
            </div>
            <div className="dm-stat-value" style={{ color: '#059669' }}>₹{summary.income.toLocaleString('en-IN')}</div>
            <div className="dm-stat-label">Total Income</div>
          </div>
          <div className="dm-stat-card" style={{ '--sc': '#dc2626' }}>
            <div className="dm-stat-top">
              <div className="dm-stat-icon" style={{ background: '#fce7f3', color: '#dc2626' }}><FiTrendingDown /></div>
            </div>
            <div className="dm-stat-value" style={{ color: '#dc2626' }}>₹{summary.expense.toLocaleString('en-IN')}</div>
            <div className="dm-stat-label">Total Expense</div>
          </div>
          <div className="dm-stat-card" style={{ '--sc': summary.balance >= 0 ? '#2563eb' : '#d97706' }}>
            <div className="dm-stat-top">
              <div className="dm-stat-icon" style={{ background: summary.balance >= 0 ? '#dbeafe' : '#fef3c7', color: summary.balance >= 0 ? '#2563eb' : '#d97706' }}><FiDollarSign /></div>
            </div>
            <div className="dm-stat-value" style={{ color: summary.balance >= 0 ? '#2563eb' : '#d97706' }}>₹{summary.balance.toLocaleString('en-IN')}</div>
            <div className="dm-stat-label">Balance</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dm-modal-overlay" onClick={() => reset()}>
          <div className="dm-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h2 className="dm-modal-name">{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="dm-modal-close" onClick={reset}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="dm-modal-body">
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Type *</label>
                    <select className="dm-form-input" value={form.type} onChange={e => set('type', e.target.value)}>
                      <option value="income">Income</option><option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Category *</label>
                    <input className="dm-form-input" value={form.category} onChange={e => set('category', e.target.value)} required placeholder="e.g. Donation, Salary, Rent" />
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Amount *</label>
                    <input className="dm-form-input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Payment Mode</label>
                    <select className="dm-form-input" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
                      <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="upi">UPI</option><option value="card">Card</option><option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Date</label>
                    <input className="dm-form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label">Donor/Payer</label>
                    <input className="dm-form-input" value={form.donorName} onChange={e => set('donorName', e.target.value)} />
                  </div>
                </div>
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Description</label>
                  <textarea className="dm-form-input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
                </div>
                <div className="dm-form-row">
                  <div className="dm-form-group">
                    <label className="dm-form-label">Receipt Number</label>
                    <input className="dm-form-input" value={form.receiptNumber} onChange={e => set('receiptNumber', e.target.value)} />
                  </div>
                  <div className="dm-form-group">
                    <label className="dm-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'none' }}>
                      <input type="checkbox" checked={form.fcraRelated} onChange={e => set('fcraRelated', e.target.checked)} /> FCRA Related
                    </label>
                  </div>
                </div>
                {form.fcraRelated && (
                  <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="dm-form-label">FCRA Reference</label>
                    <input className="dm-form-input" value={form.fcraReference} onChange={e => set('fcraReference', e.target.value)} />
                  </div>
                )}
                <div className="dm-form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="dm-form-label">Notes</label>
                  <textarea className="dm-form-input" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
                </div>
              </div>
              <div className="dm-modal-footer">
                <button type="button" className="dm-btn-outline" onClick={reset}>Cancel</button>
                <button type="submit" className="dm-btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dm-filters">
        <div className="dm-status-tabs">
          <button className={`dm-status-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
          <button className={`dm-status-tab ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}><FiTrendingUp size={13} /> Income</button>
          <button className={`dm-status-tab ${tab === 'expense' ? 'active' : ''}`} onClick={() => setTab('expense')}><FiTrendingDown size={13} /> Expense</button>
        </div>
        <div className="dm-search-bar" style={{ maxWidth: 250 }}>
          <FiSearch className="dm-search-icon" />
          <input className="dm-search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="dm-btn-outline" onClick={() => fetchData(page)}><FiRefreshCw size={13} /></button>
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
              <div className="dm-empty-icon">💰</div>
              <h3>No transactions found</h3>
              <p>Add your first transaction to start tracking finances.</p>
              <button className="dm-btn-primary" onClick={() => { reset(); setShowForm(true); }}>+ Add Transaction</button>
            </div>
          ) : (
            <div className="donor-cards-grid">
              {data.map(t => (
                <div key={t._id} className="donor-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(t)}>
                  <div className="donor-card-accent" style={{ background: t.type === 'income' ? 'linear-gradient(90deg, #059669, #34d399)' : 'linear-gradient(90deg, #dc2626, #f87171)' }} />
                  <div className="donor-card-top">
                    <div className="donor-card-av" style={{ background: t.type === 'income' ? '#059669' : '#dc2626' }}>
                      {t.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <div className="donor-card-identity">
                      <div className="donor-card-name">{t.category}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.description || '—'}</span>
                    </div>
                    <div className="donor-card-total">
                      <div className="donor-card-total-val" style={{ color: t.type === 'income' ? '#059669' : '#dc2626' }}>
                        ₹{t.amount?.toLocaleString('en-IN')}
                      </div>
                      <div className="donor-card-total-label">{t.paymentMode}</div>
                    </div>
                  </div>
                  <div className="donor-card-rows">
                    <div className="donor-card-row">
                      <div className="donor-card-row-body">
                        <span className="donor-card-row-label">ID · Date</span>
                        <span className="donor-card-row-value">{t.transactionId} · {new Date(t.date).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    {t.fcraRelated && <div className="donor-card-row">
                      <div className="donor-card-row-body">
                        <span className="donor-card-row-label">FCRA</span>
                        <span className="donor-card-row-value">{t.fcraReference || 'Yes'}</span>
                      </div>
                    </div>}
                  </div>
                  <div className="donor-card-footer">
                    <span className={`status-badge ${t.type === 'income' ? 'status-success' : 'status-failed'}`}>{t.type}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(t)}><FiEdit2 /></button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(t._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
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
                    <th>ID</th><th>Type</th><th>Category</th><th>Amount</th><th className="hide-mobile">Payment</th><th className="hide-mobile">Date</th><th className="hide-mobile">FCRA</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && <tr><td colSpan={8} className="dm-empty">No transactions found</td></tr>}
                  {data.map(t => (
                    <tr key={t._id}>
                      <td className="dm-dim dm-mono" style={{ fontSize: '0.7rem' }}>{t.transactionId}</td>
                      <td><span className={`dm-status ${t.type === 'income' ? 'dm-status-success' : 'dm-status-failed'}`}>{t.type}</span></td>
                      <td>{t.category}</td>
                      <td className="dm-amount" style={{ color: t.type === 'income' ? '#059669' : '#dc2626' }}>₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="hide-mobile dm-dim">{t.paymentMode}</td>
                      <td className="hide-mobile dm-dim">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td className="hide-mobile">{t.fcraRelated ? <span className="dm-status dm-status-pending">FCRA</span> : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="dm-btn-sm" onClick={() => setSelected(t)} title="View"><FiEye size={11} /></button>
                          <button className="dm-btn-sm" onClick={() => handleEdit(t)}><FiEdit2 size={11} /></button>
                          <button className="dm-btn-sm dm-btn-clear" onClick={() => handleDelete(t._id)}><FiTrash2 size={11} /></button>
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
          <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <div className="dm-av dm-av-lg" style={{ background: selected.type === 'income' ? '#059669' : '#dc2626' }}>
                {selected.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
              </div>
              <div style={{ flex: 1 }}>
                <h2 className="dm-modal-name">{selected.category}</h2>
                <p className="dm-modal-sub"><strong>{selected.transactionId}</strong> · {selected.type} · {new Date(selected.date).toLocaleDateString('en-IN')}</p>
              </div>
              <button className="dm-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="dm-modal-info">
              <div className="dm-info-row"><FiDollarSign /> Amount: <strong>₹{selected.amount?.toLocaleString('en-IN')}</strong> · Mode: {selected.paymentMode}</div>
              <div className="dm-info-row"><FiTrendingUp /> Donor/Payer: {selected.donorName || '—'} · Receipt: {selected.receiptNumber || '—'}</div>
              <div className="dm-info-row"><FiDollarSign /> FCRA: {selected.fcraRelated ? (selected.fcraReference || 'Yes') : 'No'}</div>
              {selected.description && <div className="dm-info-row" style={{ fontSize: '0.78rem', color: '#64748b' }}>Description: {selected.description}</div>}
              {selected.notes && <div className="dm-info-row" style={{ fontSize: '0.78rem', color: '#64748b' }}>Notes: {selected.notes}</div>}
            </div>
            <div className="dm-modal-footer">
              <button className="dm-btn-outline" onClick={() => { setSelected(null); handleEdit(selected); }}>Edit</button>
              <button className="dm-btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
