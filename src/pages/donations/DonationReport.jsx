import { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FiDollarSign, FiUsers, FiTrendingUp, FiDownload,
  FiSearch, FiChevronLeft, FiChevronRight, FiSmartphone, FiCreditCard,
  FiEye, FiEdit2, FiPrinter, FiSend, FiSave, FiX, FiCheckCircle, FiClock,
  FiAlertCircle, FiMail, FiPhone, FiMapPin, FiFileText, FiUser
} from 'react-icons/fi';
import ReceiptGenerator from '../../components/ReceiptGenerator';

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '2_days_ago', label: '2 Days Ago' },
  { value: '5_days_ago', label: '5 Days Ago' },
  { value: '1_month', label: 'Last 1 Month' },
  { value: '2_months', label: 'Last 2 Months' },
  { value: '6_months', label: 'Last 6 Months' },
  { value: '1_financial_year', label: 'This Financial Year' },
  { value: 'last_financial_year', label: 'Last Financial Year' },
  { value: 'custom', label: 'Custom Range' },
];

const STATUS_TABS = [
  { value: '', label: 'All', icon: FiCheckCircle },
  { value: 'pending', label: 'Pending', icon: FiClock },
  { value: 'success', label: 'Settled', icon: FiCheckCircle },
  { value: 'failed', label: 'Failed', icon: FiAlertCircle },
];

const AV_COLORS = ['#2563eb','#7c3aed','#059669','#dc2626','#d97706','#0891b2'];
const avColor = (s = '') => AV_COLORS[s.charCodeAt(0) % AV_COLORS.length];

const PAYMENT_MODE_COLORS = {
  'Razorpay': '#2563eb', 'PhonePe': '#7c3aed', 'QR Code': '#059669',
  'Cash': '#16a34a', 'Cheque': '#ca8a04', 'Bank Transfer': '#0891b2',
  'Demand Draft': '#dc2626', 'UPI': '#6366f1', 'Other': '#6b7280'
};

const PAYMENT_MODE_LABELS = {
  razorpay: 'Razorpay', phonepay: 'PhonePe', qr: 'QR Code',
  cash: 'Cash', cheque: 'Cheque', bank_transfer: 'Bank Transfer',
  dd: 'Demand Draft', upi: 'UPI', gpay: 'Google Pay', paytm: 'Paytm',
  neft: 'NEFT', rtgs: 'RTGS', other: 'Other'
};

const escHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

/* ── Donation Detail Modal ── */
const DonationDetail = ({ donation, onClose, onRefresh, onGenerateReceipt }) => {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSendEmail = async () => {
    setSending(true);
    setMsg('');
    try {
      const endpoint = donation.source === 'online'
        ? `/donations/${donation._id}/send-email`
        : `/offline-donations/${donation._id}/send-email`;
      await api.post(endpoint);
      setMsg('Email sent successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send email');
    }
    setSending(false);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    const isOnline = donation.source === 'online';
    printWin.document.write(`<!DOCTYPE html><html><head><title>Donation Receipt</title>
      <style>body{font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem}
      h1{color:#2563eb;font-size:1.4rem}.info{display:flex;flex-direction:column;gap:0.5rem;margin:1rem 0}
      .row{display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid #e2e8f0}
      .label{font-weight:600;color:#64748b}.value{font-weight:500}
      .footer{margin-top:2rem;color:#94a3b8;font-size:0.85rem;text-align:center}
    </style></head><body>
      <h1>Kilkari Care Foundation</h1>
      <p style="color:#64748b">Donation Receipt</p>
      <div class="info">
        <div class="row"><span class="label">Receipt No.</span><span class="value">${escHtml(donation.receiptNumber || donation.donationId || donation._id)}</span></div>
        <div class="row"><span class="label">Donor Name</span><span class="value">${escHtml(donation.donorName)}</span></div>
        <div class="row"><span class="label">Email</span><span class="value">${escHtml(donation.donorEmail)}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">${escHtml(donation.donorPhone)}</span></div>
        <div class="row"><span class="label">Amount</span><span class="value">₹${Number(donation.amount || 0).toLocaleString('en-IN')}</span></div>
        <div class="row"><span class="label">Purpose</span><span class="value">${escHtml(donation.purpose) || 'General'}</span></div>
        <div class="row"><span class="label">Payment Mode</span><span class="value">${PAYMENT_MODE_LABELS[donation.paymentMode] || 'Razorpay'}</span></div>
        <div class="row"><span class="label">Payment Status</span><span class="value">${donation.paymentStatus === 'success' || donation.source === 'offline' ? 'Paid' : escHtml(donation.paymentStatus)}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${new Date(donation.date || donation.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        ${isOnline ? `<div class="row"><span class="label">Transaction ID</span><span class="value">${escHtml(donation.transactionId)}</span></div>` : ''}
      </div>
      <div class="footer">This is a computer-generated receipt.</div>
    </body></html>`);
    printWin.document.close();
    printWin.print();
  };

  const statusColor = donation.paymentStatus === 'success' || donation.source === 'offline' ? '#059669'
    : donation.paymentStatus === 'pending' ? '#d97706' : '#dc2626';
  const statusLabel = donation.paymentStatus === 'success' || donation.source === 'offline' ? 'Settled'
    : donation.paymentStatus;

  return (
    <div className="dm-modal-overlay" onClick={onClose}>
      <div className="dm-modal dm-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <div>
            <h2 className="dm-modal-name">Donation Details</h2>
            <p className="dm-modal-sub">
              {donation.donationId || donation._id}
              {donation.receiptNumber && <span style={{ marginLeft: '0.5rem', color: '#7c3aed' }}>· #{donation.receiptNumber}</span>}
            </p>
          </div>
          <button className="dm-modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="dm-modal-body">
          {/* Status Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className={`dm-status dm-status-${donation.paymentStatus === 'success' || donation.source === 'offline' ? 'success' : donation.paymentStatus}`}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.8rem' }}>
              {statusLabel}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: '99px', background: donation.source === 'offline' ? '#fffbeb' : '#eff6ff',
              color: donation.source === 'offline' ? '#d97706' : '#2563eb'
            }}>
              {donation.source === 'offline' ? 'Offline' : 'Online'}
            </span>
          </div>

          <div className="dm-info-grid">
            <div className="dm-info-card">
              <div className="dm-info-card-title">Donor Information</div>
              <div className="dm-info-row"><FiUser size={14} /> {donation.donorName}</div>
              {donation.donorEmail && <div className="dm-info-row"><FiMail size={14} /> {donation.donorEmail}</div>}
              {donation.donorPhone && <div className="dm-info-row"><FiPhone size={14} /> {donation.donorPhone}</div>}
              {donation.donorCity && <div className="dm-info-row"><FiMapPin size={14} /> {donation.donorCity}</div>}
            </div>
            <div className="dm-info-card">
              <div className="dm-info-card-title">Payment Information</div>
              <div className="dm-info-value">
                <span className="dm-info-label">Amount</span>
                <span className="dm-amount" style={{ fontSize: '1.1rem' }}>₹{Number(donation.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="dm-info-value">
                <span className="dm-info-label">Mode</span>
                <span>{PAYMENT_MODE_LABELS[donation.paymentMode] || (donation.source === 'online' ? 'Razorpay' : '—')}</span>
              </div>
              {donation.paymentGateway && <div className="dm-info-value">
                <span className="dm-info-label">Gateway</span><span>{donation.paymentGateway}</span>
              </div>}
              {donation.transactionId && <div className="dm-info-value">
                <span className="dm-info-label">Transaction</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{donation.transactionId}</span>
              </div>}
              {donation.walletDetails && <div className="dm-info-value">
                <span className="dm-info-label">Ref</span><span>{donation.walletDetails}</span>
              </div>}
              <div className="dm-info-value">
                <span className="dm-info-label">Purpose</span><span>{donation.purpose || 'General'}</span>
              </div>
              <div className="dm-info-value">
                <span className="dm-info-label">Date</span>
                <span>{new Date(donation.date || donation.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {donation.center?.name && <div className="dm-info-value">
                <span className="dm-info-label">Center</span><span>{donation.center.name}</span>
              </div>}
              {donation.pan && <div className="dm-info-value">
                <span className="dm-info-label">PAN</span><span>{donation.pan}</span>
              </div>}
              {donation.receiptNumber && <div className="dm-info-value">
                <span className="dm-info-label">Receipt No.</span><span className="dm-mono">{donation.receiptNumber}</span>
              </div>}
              {donation.settlementStatus && <div className="dm-info-value">
                <span className="dm-info-label">Settlement</span>
                <span className={`dm-status dm-status-${donation.settlementStatus === 'settled' ? 'success' : donation.settlementStatus === 'rejected' ? 'error' : 'pending'}`}
                  style={{ fontSize: '0.65rem' }}>{donation.settlementStatus}</span>
              </div>}
              {donation.isCSR && <div className="dm-info-value">
                <span className="dm-info-label">CSR</span><span>Yes {donation.cin ? `(CIN: ${donation.cin})` : ''}</span>
              </div>}
              {donation.isFCRA && <div className="dm-info-value">
                <span className="dm-info-label">FCRA</span><span>Yes {donation.fcraReference ? `(Ref: ${donation.fcraReference})` : ''}</span>
              </div>}
              {donation.remark && <div className="dm-info-value">
                <span className="dm-info-label">Remark</span><span style={{ color: 'var(--text-dim)' }}>{donation.remark}</span>
              </div>}
            </div>
          </div>

          {msg && (
            <div className={`dm-alert ${msg.includes('success') ? 'dm-alert-success' : 'dm-alert-error'}`} style={{ marginTop: '1rem' }}>
              {msg}
            </div>
          )}
        </div>

        <div className="dm-modal-footer">
          <button className="dm-btn-outline" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="dm-btn-outline" onClick={handleSendEmail} disabled={sending}>
            <FiSend /> {sending ? 'Sending...' : 'Send Email'}
          </button>
          <button className="dm-btn-outline" onClick={() => onGenerateReceipt(donation)}>
            <FiFileText /> Receipt
          </button>
          <button className="dm-btn-primary" onClick={onClose}>
            <FiCheckCircle /> Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Donation Modal ── */
const EditDonationModal = ({ donation, onClose, onSaved }) => {
  const [form, setForm] = useState({
    amount: donation.amount || '',
    purpose: donation.purpose || 'General',
    paymentMode: donation.paymentMode || 'cash',
    paymentGateway: donation.paymentGateway || '',
    transactionId: donation.transactionId || '',
    walletDetails: donation.walletDetails || '',
    remark: donation.remark || '',
    donationDate: donation.date ? donation.date.split('T')[0] : '',
    paymentStatus: donation.paymentStatus || 'success',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      const endpoint = donation.source === 'online'
        ? `/donations/${donation._id}`
        : `/offline-donations/${donation._id}`;
      await api.put(endpoint, form);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setErr(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  return (
    <div className="dm-modal-overlay" onClick={onClose}>
      <div className="dm-modal dm-modal-md" onClick={e => e.stopPropagation()}>
        <div className="dm-modal-header">
          <h2 className="dm-modal-name">Edit Donation</h2>
          <p className="dm-modal-sub">{donation.donationId || donation._id}</p>
          <button className="dm-modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="dm-modal-body">
          <div className="dm-form-row">
            <div className="dm-form-group">
              <label className="dm-form-label">Amount (₹)</label>
              <input type="number" className="dm-form-input" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Purpose</label>
              <select className="dm-form-input" value={form.purpose}
                onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}>
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Food">Food</option>
                <option value="Shelter">Shelter</option>
                <option value="Child Welfare">Child Welfare</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="dm-form-row">
            <div className="dm-form-group">
              <label className="dm-form-label">Payment Mode</label>
              <select className="dm-form-input" value={form.paymentMode}
                onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}>
                <option value="razorpay">Razorpay</option>
                <option value="phonepay">PhonePe</option>
                <option value="qr">QR Code</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="dd">Demand Draft</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Status</label>
              <select className="dm-form-input" value={form.paymentStatus}
                onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                <option value="success">Settled</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div className="dm-form-row">
            <div className="dm-form-group">
              <label className="dm-form-label">Gateway / Transaction ID</label>
              <input className="dm-form-input" value={form.transactionId}
                onChange={e => setForm(p => ({ ...p, transactionId: e.target.value }))}
                placeholder="Online transaction reference" />
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Wallet / Cheque / DD Ref</label>
              <input className="dm-form-input" value={form.walletDetails}
                onChange={e => setForm(p => ({ ...p, walletDetails: e.target.value }))}
                placeholder="Offline payment reference" />
            </div>
          </div>
          <div className="dm-form-group">
            <label className="dm-form-label">Donation Date</label>
            <input type="date" className="dm-form-input" value={form.donationDate}
              onChange={e => setForm(p => ({ ...p, donationDate: e.target.value }))} />
          </div>
          <div className="dm-form-group">
            <label className="dm-form-label">Remark</label>
            <textarea className="dm-form-input" rows={2} value={form.remark}
              onChange={e => setForm(p => ({ ...p, remark: e.target.value }))} />
          </div>
          {err && <div className="dm-alert dm-alert-error">{err}</div>}
        </div>
        <div className="dm-modal-footer">
          <button className="dm-btn-outline" onClick={onClose}>Cancel</button>
          <button className="dm-btn-primary" onClick={handleSave} disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Report Page ── */
const DonationReport = () => {
  const [range, setRange] = useState('1_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({ grandTotal: 0, grandCount: 0, onlineAmount: 0, onlineCount: 0, offlineAmount: 0, offlineCount: 0 });
  const [paymentModes, setPaymentModes] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [topRegistered, setTopRegistered] = useState([]);
  const [centerSummary, setCenterSummary] = useState([]);
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [receiptGenDonation, setReceiptGenDonation] = useState(null);

  useEffect(() => { fetchReport(); }, [range, startDate, endDate, page, statusFilter]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { range, page, limit: 50 };
      if (search) params.search = search;
      if (paymentMode) params.paymentMode = paymentMode;
      if (statusFilter) params.paymentStatus = statusFilter;
      if (range === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const [res, centerRes] = await Promise.all([
        api.get('/reports/donations', { params }),
        api.get('/reports/centers', { params: { startDate: params.startDate, endDate: params.endDate } })
      ]);
      const d = res.data.data;
      setSummary(d.summary);
      setPaymentModes(d.paymentModeBreakup || []);
      setTopDonors(d.topDonors || []);
      setTopRegistered(d.topRegisteredDonors || []);
      setDonations(d.donations || []);
      setPagination(d.pagination);
      setCenterSummary(centerRes.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSearch = () => { setPage(1); fetchReport(); };
  const handleRefresh = () => fetchReport();

  const pendingCount = donations.filter(d => d.paymentStatus === 'pending' || d.paymentStatus === 'failed').length;
  const settledCount = donations.filter(d => d.paymentStatus === 'success' || d.source === 'offline').length;

  const exportCSV = () => {
    const rows = [['Receipt No.','Source','Donor','Email','Phone','Amount','Purpose','Payment Mode','Gateway/Ref','Status','Settlement','Receipt#','CSR','FCRA','Date']];
    donations.forEach(d => {
      rows.push([
        d.donationId || d._id, d.source === 'online' ? 'Online' : 'Offline',
        d.donorName, d.donorEmail || '', d.donorPhone || '',
        d.amount, d.purpose || 'General',
        PAYMENT_MODE_LABELS[d.paymentMode] || 'Razorpay',
        d.transactionId || d.walletDetails || '',
        d.paymentStatus, d.settlementStatus || '',
        d.receiptNumber || '', d.isCSR ? 'Yes' : '', d.isFCRA ? 'Yes' : '',
        new Date(d.date || d.createdAt).toLocaleDateString('en-IN')
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c||''}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `donation-report-${range}-${Date.now()}.csv`;
    a.click();
  };

  const viewDetail = async (d) => {
    try {
      const endpoint = d.source === 'online'
        ? `/donations/${d._id}`
        : `/offline-donations/${d._id}`;
      const res = await api.get(endpoint);
      setSelectedDonation(res.data.data);
    } catch {
      setSelectedDonation(d);
    }
  };

  return (
    <div className="dm-page">
      <div className="dm-page-header">
        <div>
          <h1 className="dm-title">Donation Analytics & Report</h1>
          <p className="dm-subtitle">
            {pagination.total} donations · Total: <strong>₹{summary.grandTotal.toLocaleString('en-IN')}</strong>
            &nbsp;·&nbsp;{settledCount} settled · {pendingCount} pending
          </p>
        </div>
        <button className="dm-btn-outline" onClick={exportCSV}><FiDownload /> Export CSV</button>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="dm-status-tabs">
        {STATUS_TABS.map(tab => (
          <button key={tab.value}
            className={`dm-status-tab ${statusFilter === tab.value ? 'active' : ''}`}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Date Filters ── */}
      <div className="dm-filter-box">
        <div className="dm-filter-row">
          <div className="dm-date-range-tabs">
            {DATE_RANGES.map(r => (
              <button key={r.value}
                className={`dm-range-tab ${range === r.value ? 'active' : ''}`}
                onClick={() => { setRange(r.value); setPage(1); }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {range === 'custom' && (
          <div className="dm-filter-row">
            <label className="dm-date-label">From</label>
            <input type="date" className="dm-select" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <label className="dm-date-label">To</label>
            <input type="date" className="dm-select" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <button className="dm-btn-sm dm-btn-primary" onClick={() => setPage(1)}>Apply</button>
          </div>
        )}
        <div className="dm-filter-row" style={{ marginTop: '0.5rem' }}>
          <div className="dm-search-bar" style={{ flex: 1 }}>
            <FiSearch className="dm-search-icon" />
            <input className="dm-search-input" placeholder="Search donor name, email, phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <select className="dm-select" value={paymentMode} onChange={e => { setPaymentMode(e.target.value); setPage(1); }}>
            <option value="">All Payment Modes</option>
            {paymentModes.map(pm => <option key={pm.mode} value={pm.mode.toLowerCase()}>{pm.mode}</option>)}
          </select>
          <button className="dm-btn-primary" onClick={handleSearch}><FiSearch /> Search</button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="dm-stats dm-stats-3">
        <div className="dm-stat-card" style={{ '--sc': '#2563eb' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-label">Total Donations</div>
            <div className="dm-stat-icon" style={{ background: '#2563eb18', color: '#2563eb' }}><FiDollarSign /></div>
          </div>
          <div className="dm-stat-value">₹{summary.grandTotal.toLocaleString('en-IN')}</div>
          <div className="dm-stat-sub">{summary.grandCount} donations</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#059669' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-label">Online Payments</div>
            <div className="dm-stat-icon" style={{ background: '#05966918', color: '#059669' }}><FiSmartphone /></div>
          </div>
          <div className="dm-stat-value">₹{summary.onlineAmount.toLocaleString('en-IN')}</div>
          <div className="dm-stat-sub">{summary.onlineCount} txns · Razorpay</div>
        </div>
        <div className="dm-stat-card" style={{ '--sc': '#d97706' }}>
          <div className="dm-stat-top">
            <div className="dm-stat-label">Offline Collections</div>
            <div className="dm-stat-icon" style={{ background: '#d9770618', color: '#d97706' }}><FiCreditCard /></div>
          </div>
          <div className="dm-stat-value">₹{summary.offlineAmount.toLocaleString('en-IN')}</div>
          <div className="dm-stat-sub">{summary.offlineCount} entries · Cash/Cheque/UPI/etc</div>
        </div>
      </div>

      {/* ── Two column: Payment Breakup + Top Donors ── */}
      <div className="dm-grid-2">
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiTrendingUp /> Payment Mode Breakup</span>
          </div>
          {paymentModes.length === 0 ? (
            <div className="dm-empty">No data</div>
          ) : (
            <div className="dm-purpose-list">
              {paymentModes.sort((a, b) => b.total - a.total).map(pm => (
                <div key={pm.mode} className="dm-purpose-item">
                  <span className="dm-purpose-label">{pm.mode}</span>
                  <div className="dm-purpose-bar-wrap">
                    <div className="dm-purpose-bar"
                      style={{ width: `${(pm.total / Math.max(...paymentModes.map(p => p.total)) * 100)}%`,
                        background: PAYMENT_MODE_COLORS[pm.mode] || '#6b7280' }} />
                  </div>
                  <span className="dm-purpose-val">
                    ₹{pm.total.toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', display: 'block' }}>{pm.count} txns</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiUsers /> Top Donors (This Period)</span>
          </div>
          {topDonors.length === 0 ? (
            <div className="dm-empty">No data</div>
          ) : (
            <div className="dm-purpose-list">
              {topDonors.map((d, i) => (
                <div key={i} className="dm-purpose-item">
                  <div className="dm-av" style={{ background: avColor(d.name || 'A'), width: 26, height: 26, fontSize: '0.6rem', flexShrink: 0 }}>
                    {(d.name || 'A')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.name || 'Anonymous'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{d.count} donations</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#059669', whiteSpace: 'nowrap' }}>
                    ₹{d.total.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Center Summary ── */}
      {centerSummary.length > 0 && (
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiMapPin /> Collection Centers</span>
          </div>
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Center</th>
                  <th>City</th>
                  <th>Donations</th>
                  <th>Total</th>
                  <th>Settled</th>
                  <th>Pending</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {centerSummary.map((s, i) => (
                  <tr key={s.center?._id || i}>
                    <td><strong>{s.center?.name || 'Uncategorized'}</strong></td>
                    <td className="dm-dim">{s.center?.city || '—'}</td>
                    <td>{s.count}</td>
                    <td className="dm-amount">₹{s.total.toLocaleString('en-IN')}</td>
                    <td><span className="dm-status dm-status-success">{s.settled}</span></td>
                    <td><span className="dm-status dm-status-pending">{s.pending}</span></td>
                    <td><span className="dm-status dm-status-failed">{s.failed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Top Registered Donors ── */}
      {topRegistered.length > 0 && (
        <div className="dm-card">
          <div className="dm-card-header">
            <span className="dm-card-title"><FiUsers /> Top Registered Donors (Lifetime)</span>
          </div>
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>#</th><th>Donor ID</th><th>Name</th><th>Email</th><th>Mobile</th>
                  <th>Donations</th><th>Total Amount</th><th>Last Donation</th>
                </tr>
              </thead>
              <tbody>
                {topRegistered.map((d, i) => (
                  <tr key={d._id}>
                    <td className="dm-dim">#{i + 1}</td>
                    <td className="dm-dim dm-mono" style={{ fontSize: '0.7rem' }}>{d.donorId}</td>
                    <td><div className="dm-donor-cell">
                      <div className="dm-av" style={{ background: avColor(d.donorName), width: 26, height: 26, fontSize: '0.6rem' }}>
                        {(d.donorName || 'A')[0].toUpperCase()}</div>
                      <span className="dm-donor-name">{d.donorName}</span>
                    </div></td>
                    <td className="dm-dim">{d.email || '—'}</td>
                    <td className="dm-dim">{d.mobile || '—'}</td>
                    <td><span className="dm-count-badge">{d.totalDonations || 0}</span></td>
                    <td className="dm-amount">₹{Number(d.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="dm-dim">{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Donations Table ── */}
      <div className="dm-card">
        <div className="dm-card-header">
          <span className="dm-card-title"><FiDollarSign /> Donation Records</span>
          <span className="dm-count-badge">{pagination.total} records</span>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="dm-empty">No donations found for this period.</div>
        ) : (
          <div className="dm-table-wrap">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Source</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Receipt</th>
                  <th>Center</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Settlement</th>
                  <th>Date</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                  {donations.map((d, i) => (
                  <tr key={d._id || i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => viewDetail(d)}>
                    <td className="dm-dim dm-mono" style={{ fontSize: '0.68rem' }}>
                      {d.donationId ? d.donationId.slice(-10) : (d._id || '').slice(-8)}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        background: d.source === 'offline' ? '#fffbeb' : '#eff6ff',
                        color: d.source === 'offline' ? '#d97706' : '#2563eb',
                      }}>
                        {d.source === 'offline' ? 'Offline' : 'Online'}
                      </span>
                    </td>
                    <td>
                      <div className="dm-donor-cell">
                        <div className="dm-av" style={{ background: avColor(d.donorName || 'A'), width: 26, height: 26, fontSize: '0.6rem' }}>
                          {(d.donorName || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="dm-donor-name" style={{ fontSize: '0.78rem' }}>{d.donorName}</div>
                          <div className="dm-donor-email" style={{ fontSize: '0.62rem' }}>{d.donorEmail || d.donorPhone || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="dm-amount">₹{Number(d.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="dm-dim" style={{ fontSize: '0.72rem' }}>{d.purpose || 'General'}</td>
                    <td className="dm-dim dm-mono" style={{ fontSize: '0.65rem' }}>{d.receiptNumber || '—'}</td>
                    <td className="dm-dim" style={{ fontSize: '0.7rem' }}>{d.center?.name || '—'}</td>
                    <td>
                      <span className={`dm-status ${d.paymentStatus === 'success' || d.source === 'offline' ? 'dm-status-success' : 'dm-status-pending'}`}
                        style={{ fontSize: '0.65rem' }}>
                        {PAYMENT_MODE_LABELS[d.paymentMode] || (d.source === 'online' ? 'Razorpay' : '—')}
                      </span>
                    </td>
                    <td>
                      <span className={`dm-status dm-status-${d.paymentStatus === 'success' || d.source === 'offline' ? 'success' : d.paymentStatus}`}
                        style={{ fontSize: '0.65rem' }}>
                        {d.paymentStatus === 'success' || d.source === 'offline' ? 'Settled' : d.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {d.settlementStatus ? (
                        <span className={`dm-status dm-status-${d.settlementStatus === 'settled' ? 'success' : d.settlementStatus === 'rejected' ? 'error' : 'pending'}`}
                          style={{ fontSize: '0.6rem' }}>
                          {d.settlementStatus}
                        </span>
                      ) : <span className="dm-dim" style={{ fontSize: '0.65rem' }}>—</span>}
                    </td>
                    <td className="dm-dim" style={{ fontSize: '0.7rem' }}>
                      {new Date(d.date || d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div className="action-btns" onClick={e => e.stopPropagation()}>
                        <button className="btn-icon btn-edit" title="View Details" onClick={() => viewDetail(d)}>
                          <FiEye />
                        </button>
                        <button className="btn-icon" title="Edit"
                          style={{ background: '#fffbeb', color: '#d97706' }}
                          onClick={() => setEditingDonation(d)}>
                          <FiEdit2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="dm-pagination">
            <button className="dm-page-btn" disabled={pagination.page <= 1} onClick={() => setPage(p => p - 1)}>
              <FiChevronLeft />
            </button>
            <span className="dm-page-info">Page {pagination.page} of {pagination.totalPages} · {pagination.total} records</span>
            <button className="dm-page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedDonation && (
        <DonationDetail
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onRefresh={handleRefresh}
          onGenerateReceipt={(d) => { setSelectedDonation(null); setReceiptGenDonation(d); }}
        />
      )}

      {/* ── Edit Modal ── */}
      {editingDonation && (
        <EditDonationModal
          donation={editingDonation}
          onClose={() => setEditingDonation(null)}
          onSaved={handleRefresh}
        />
      )}

      {/* ── Receipt Generator ── */}
      {receiptGenDonation && (
        <ReceiptGenerator donation={receiptGenDonation}
          type={receiptGenDonation.source === 'online' ? 'online' : 'offline'}
          onClose={() => setReceiptGenDonation(null)} />
      )}
    </div>
  );
};

export default DonationReport;
