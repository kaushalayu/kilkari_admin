import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { FiTarget, FiCalendar, FiUsers, FiClock, FiShield } from 'react-icons/fi';

const CampaignPublic = () => {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donorForm, setDonorForm] = useState({ name: '', email: '', phone: '', amount: '' });
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/campaigns/${slug}`)
      .then(r => setCampaign(r.data.data))
      .catch(() => setMsg('Campaign not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!donorForm.amount || Number(donorForm.amount) < 1)
      return setMsg('Please enter a valid amount (minimum ₹1)');
    if (!donorForm.name || !donorForm.email || !donorForm.phone)
      return setMsg('Please fill in all donor details');
    setProcessing(true);
    setMsg('');
    try {
      const orderRes = await api.post(`/campaigns/${campaign._id}/create-order`, {
        amount: donorForm.amount, donorName: donorForm.name,
        donorEmail: donorForm.email, donorPhone: donorForm.phone,
      });
      const { orderId, amount, keyId } = orderRes.data.data;
      const rzp = new window.Razorpay({
        key: keyId, amount, currency: 'INR',
        name: 'Kilkari Care Foundation',
        description: `Donation: ${campaign.title}`,
        order_id: orderId,
        prefill: { name: donorForm.name, email: donorForm.email, contact: donorForm.phone },
        handler: async function(response) {
          try {
            const verifyRes = await api.post('/donations/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data.status === 'success') {
              setMsg('Thank you! Your donation was successful.');
              setDonorForm({ name: '', email: '', phone: '', amount: '' });
            }
          } catch { setMsg('Payment verification failed. Please contact support.'); }
          setProcessing(false);
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.on('payment.failed', () => { setMsg('Payment failed. Please try again.'); setProcessing(false); });
      rzp.open();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <div className="loading" style={{ padding: '3rem' }}>Loading campaign...</div>
    </div>
  );

  if (!campaign) return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Campaign Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The campaign you're looking for doesn't exist or has ended.</p>
      <Link to="https://kilkaricares.org" style={{ color: '#2563eb', fontWeight: 600 }}>← Back to Homepage</Link>
    </div>
  );

  const progress = campaign.progress || 0;
  const raised = Number(campaign.raisedAmount || 0);
  const goal = Number(campaign.goalAmount || 0);
  const donors = campaign.donorCount || 0;
  const daysLeft = campaign.daysRemaining || 0;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Banner */}
      <div style={{
        background: campaign.coverImage
          ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url(${campaign.coverImage}) center/cover`
          : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        padding: '3rem 1rem 2rem', color: '#fff', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, marginBottom: '0.5rem' }}>
            {campaign.title}
          </h1>
          {campaign.shortDescription && (
            <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: 600, margin: '0 auto 1.5rem' }}>
              {campaign.shortDescription}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{raised.toLocaleString('en-IN')}</div><div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Raised</div></div>
            <div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{donors}</div><div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Donors</div></div>
            {daysLeft > 0 && (
              <div><div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{daysLeft}</div><div style={{ fontSize: '0.78rem', opacity: 0.75 }}>Days Left</div></div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Campaign Details */}
          <div>
            {/* Progress Bar */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>
                  ₹{raised.toLocaleString('en-IN')} raised
                </span>
                <span style={{ color: '#64748b' }}>of ₹{goal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, progress)}%`, height: '100%',
                  background: progress >= 100 ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #2563eb, #3b82f6)',
                  borderRadius: 6, transition: 'width 0.8s ease'
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                {progress.toFixed(1)}% of goal achieved
              </div>
            </div>

            {/* Campaign Details */}
            {campaign.description && (
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>About This Campaign</h3>
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{campaign.description}</p>
              </div>
            )}

            {/* Campaign Info Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {campaign.cause?.name && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.78rem' }}>
                  <FiTarget size={12} /> {campaign.cause.name}
                </span>
              )}
              {campaign.endDate && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f3f4f6', color: '#374151', padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.78rem' }}>
                  <FiCalendar size={12} /> Ends {new Date(campaign.endDate).toLocaleDateString('en-IN')}
                </span>
              )}
              {daysLeft > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#92400e', padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.78rem' }}>
                  <FiClock size={12} /> {daysLeft} days left
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f0fdf4', color: '#166534', padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.78rem' }}>
                <FiUsers size={12} /> {donors} donors
              </span>
            </div>
          </div>

          {/* Right: Donation Form */}
          <div style={{ position: 'sticky', top: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
                Make a Donation
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Your support makes a difference. Every contribution counts.
              </p>

              {msg && (
                <div style={{
                  padding: '0.6rem 0.8rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: '0.82rem',
                  background: msg.includes('success') ? '#d1fae5' : msg.includes('fail') || msg.includes('error') || msg.includes('not') ? '#fee2e2' : '#fef3c7',
                  color: msg.includes('success') ? '#065f46' : '#991b1b'
                }}>
                  {msg}
                </div>
              )}

              <form onSubmit={handleDonate}>
                <div className="form-group">
                  <label className="form-label">Your Name *</label>
                  <input className="form-control" value={donorForm.name}
                    onChange={e => setDonorForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" value={donorForm.email}
                    onChange={e => setDonorForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="john@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-control" type="tel" value={donorForm.phone}
                    onChange={e => setDonorForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 9876543210" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {[500, 1000, 2500, 5000].map(a => (
                      <button key={a} type="button"
                        onClick={() => setDonorForm(p => ({ ...p, amount: String(a) }))}
                        style={{
                          padding: '0.35rem 0.8rem', borderRadius: 6, border: Number(donorForm.amount) === a ? '2px solid #2563eb' : '1px solid #d1d5db',
                          background: Number(donorForm.amount) === a ? '#eff6ff' : '#fff',
                          color: Number(donorForm.amount) === a ? '#2563eb' : '#374151',
                          fontWeight: Number(donorForm.amount) === a ? 600 : 400, fontSize: '0.82rem', cursor: 'pointer'
                        }}>
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                  <input className="form-control" type="number" value={donorForm.amount}
                    onChange={e => setDonorForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="Enter custom amount" min="1" required />
                </div>
                <button type="submit" disabled={processing}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: 8, border: 'none',
                    background: processing ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', fontSize: '1.05rem', fontWeight: 700,
                    cursor: processing ? 'not-allowed' : 'pointer',
                    boxShadow: processing ? 'none' : '0 2px 8px rgba(37,99,235,0.3)',
                    transition: 'all 0.2s'
                  }}>
                  {processing ? 'Processing...' : `Donate ₹${donorForm.amount ? Number(donorForm.amount).toLocaleString('en-IN') : '—'}`}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                <FiShield size={12} /> Secure payments by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPublic;