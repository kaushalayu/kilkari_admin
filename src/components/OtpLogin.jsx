import { useState } from 'react';
import api from '../api/client';

const OtpLogin = ({ portalType, label, sendEndpoint, verifyEndpoint, footerText, footerLink, footerLabel, onLogin }) => {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('contact');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post(sendEndpoint, { [contact.includes('@') ? 'email' : (portalType === 'donor' ? 'mobile' : 'phone')]: contact });
      setStep('otp');
      setMsg('OTP sent to your registered ' + (contact.includes('@') ? 'email' : 'mobile'));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const field = contact.includes('@') ? 'email' : (portalType === 'donor' ? 'mobile' : 'phone');
      const { data } = await api.post(verifyEndpoint, { [field]: contact, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('tokenExpiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
      onLogin(data.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="portal-login">
      <div className="portal-login-box">
        <div className="portal-login-logo">
          <div className="sidebar-logo-placeholder"><span>KC</span></div>
          <h2>Kilkari Care Foundation</h2>
          <p>{label} Portal</p>
        </div>
        {step === 'contact' ? (
          <form onSubmit={sendOtp}>
            <div className="portal-login-field">
              <label>{contact.includes('@') ? 'Email' : 'Mobile Number'}</label>
              <input className="form-control" type="text" value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder={contact.includes('@') ? 'Enter registered email' : `Enter registered ${portalType === 'donor' ? 'mobile' : 'phone'}`}
                required />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem', cursor: 'pointer' }}
              onClick={() => setContact('')}>
              {contact.includes('@') ? 'Use mobile instead' : 'Use email instead'}
            </p>
            {msg && <p className="portal-login-msg">{msg}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <p className="portal-login-footer">{footerText} <a href={footerLink}>{footerLabel}</a></p>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div className="portal-login-field">
              <label>Enter OTP sent to {contact.slice(-4)}</label>
              <input className="form-control" type="text" value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit OTP" maxLength={6} required />
            </div>
            {msg && <p className="portal-login-msg">{msg}</p>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => { setStep('contact'); setOtp(''); }}>
              Change {contact.includes('@') ? 'Email' : 'Mobile Number'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OtpLogin;