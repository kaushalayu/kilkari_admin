import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { FiX, FiFileText, FiSend, FiPrinter, FiEye, FiRefreshCw } from 'react-icons/fi';

const ReceiptGenerator = ({ donation, type, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const iframeRef = useRef(null);

  const [form, setForm] = useState({
    donorName: donation?.donorName || donation?.donor?.donorName || '',
    amount: donation?.amount || '',
    cause: donation?.purpose || donation?.cause || 'General',
    receiptDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setLoading(true);
    api.get('/pdf-templates?type=donation_receipt')
      .then(res => {
        const list = res.data.data || [];
        setTemplates(list);
        const def = list.find(t => t.isDefault) || list[0];
        if (def) setSelectedTemplate(def._id);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handlePreview = async () => {
    if (!selectedTemplate) return showMsg('error', 'Select a template first');
    setGenerating(true);
    setPreviewHtml(null);
    try {
      const res = await api.post('/receipts/generate', {
        donationId: donation._id,
        type: type || 'offline',
        templateId: selectedTemplate,
        receiptDate: form.receiptDate,
        overrides: {
          donorName: form.donorName,
          amount: form.amount,
          cause: form.cause,
        }
      });
      setPreviewHtml(res.data.data.html);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to generate receipt');
    }
    setGenerating(false);
  };

  const handlePrint = () => {
    if (!previewHtml) { handlePreview(); return; }
    const win = window.open('', '_blank');
    win.document.write(previewHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleEmail = async () => {
    if (!previewHtml) { handlePreview(); return; }
    if (!emailTo.trim()) return showMsg('error', 'Enter recipient email');
    setSending(true);
    try {
      await api.post('/receipts/send-email', {
        donationId: donation._id,
        type: type || 'offline',
        templateId: selectedTemplate,
        receiptDate: form.receiptDate,
        to: emailTo,
        overrides: {
          donorName: form.donorName,
          amount: form.amount,
          cause: form.cause,
        }
      });
      showMsg('success', 'Receipt emailed successfully!');
      setShowEmailInput(false);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to send email');
    }
    setSending(false);
  };

  const selectedTemplateData = templates.find(t => t._id === selectedTemplate);

  return (
    <div className="dm-modal-overlay" onClick={onClose}>
      <div className="dm-modal dm-modal-lg" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="dm-modal-header">
          <div>
            <h2 className="dm-modal-name">Generate Receipt</h2>
            <div className="dm-modal-sub">Donation: {donation?.donationId || donation?._id?.slice(-8)}</div>
          </div>
          <button className="dm-modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div className="dm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {msg.text && <div className={`dm-alert dm-alert-${msg.type}`}>{msg.text}</div>}

          {/* Donation ID (read-only) */}
          <div className="rg-id-bar">
            <span className="rg-id-label">Donation ID</span>
            <span className="rg-id-value">{donation?.donationId || donation?._id || '—'}</span>
          </div>

          {/* Editable fields */}
          <div className="rg-form-grid">
            <div className="dm-form-group">
              <label className="dm-form-label">Donor Name</label>
              <input className="dm-form-input" value={form.donorName}
                onChange={e => handleChange('donorName', e.target.value)} />
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Amount (₹)</label>
              <input type="number" className="dm-form-input" value={form.amount}
                onChange={e => handleChange('amount', e.target.value)} min="1" />
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Cause / Purpose</label>
              <input className="dm-form-input" value={form.cause}
                onChange={e => handleChange('cause', e.target.value)} />
            </div>
            <div className="dm-form-group">
              <label className="dm-form-label">Receipt Date</label>
              <input type="date" className="dm-form-input" value={form.receiptDate}
                onChange={e => handleChange('receiptDate', e.target.value)} />
            </div>
          </div>

          {/* Template selector */}
          <div className="dm-form-group">
            <label className="dm-form-label">Receipt Template</label>
            <div className="rg-template-select-row">
              <select className="dm-form-input" value={selectedTemplate}
                onChange={e => { setSelectedTemplate(e.target.value); setPreviewHtml(null); }}>
                {loading ? <option value="">Loading templates...</option> :
                  templates.length === 0 ? <option value="">No templates available</option> :
                  templates.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
              </select>
              {selectedTemplateData && (
                <div className="rg-template-indicator">
                  <span className="rg-template-dot" style={{ background: selectedTemplateData.primaryColor }} />
                  <span className="rg-template-dot" style={{ background: selectedTemplateData.accentColor }} />
                  <span className="rg-template-font-preview" style={{ fontFamily: selectedTemplateData.fontFamily }}>
                    {selectedTemplateData.fontFamily === 'Times-Roman' ? 'T' : selectedTemplateData.fontFamily === 'Courier' ? 'C' : 'A'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Template quick info */}
          {selectedTemplateData && (
            <div className="rg-template-info">
              <div><strong>Title:</strong> {selectedTemplateData.documentTitle || '—'}</div>
              <div><strong>Header:</strong> {selectedTemplateData.headerTitle || '—'}</div>
              {selectedTemplateData.customNote && <div><strong>Note:</strong> {selectedTemplateData.customNote}</div>}
            </div>
          )}

          {/* Action buttons */}
          <div className="rg-actions">
            <button className="dm-btn-primary" onClick={handlePreview} disabled={generating}>
              <FiEye /> {generating ? 'Generating...' : previewHtml ? 'Refresh Preview' : 'Generate Preview'}
            </button>
            <button className="dm-btn-outline" onClick={handlePrint} disabled={!previewHtml && generating}>
              <FiPrinter /> Print
            </button>
            <button className="dm-btn-outline" onClick={() => setShowEmailInput(!showEmailInput)}
              disabled={!previewHtml && generating}>
              <FiSend /> Email
            </button>
          </div>

          {/* Email input */}
          {showEmailInput && (
            <div className="rg-email-row">
              <input className="dm-form-input" type="email" placeholder="recipient@example.com"
                value={emailTo} onChange={e => setEmailTo(e.target.value)} />
              <button className="dm-btn-primary" onClick={handleEmail} disabled={sending}>
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          )}

          {/* Preview */}
          {generating && <div className="loading">Generating receipt preview...</div>}
          {previewHtml && (
            <div className="rg-preview-wrap">
              <div className="rg-preview-header">
                <FiFileText /> Preview
              </div>
              <iframe ref={iframeRef} srcDoc={previewHtml}
                className="rg-preview-iframe"
                title="Receipt Preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
