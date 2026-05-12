import { useState } from 'react';
import api, { getFullUrl } from '../api/client';
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi';

const FileUpload = ({ value, onChange, folder = 'documents', placeholder = 'Upload File', accept = '*' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      setUploading(true);
      setError('');
      const res = await api.post(`/upload?folder=${encodeURIComponent(folder)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.fileUrl) {
        onChange(res.data.data.fileUrl);
      }
    } catch (err) {
      console.error('Upload error', err);
      setError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const fileUrl = getFullUrl(value);

  if (value) {
    return (
      <div className="file-upload-wrapper" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'var(--bg)', borderRadius: 'var(--radius)', color: 'var(--text-dim)' }}>
            <FiFile size={16} />
          </div>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', textDecoration: 'none' }}>View File</a>
          <button type="button" className="btn-icon btn-delete" onClick={() => onChange('')} aria-label="Remove file">
            <FiX />
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="file-upload-wrapper" style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="image-upload-btn">
          <FiUploadCloud /> {uploading ? 'Uploading...' : placeholder}
          <input type="file" style={{ display: 'none' }} accept={accept} onChange={handleFileChange} disabled={uploading} />
        </label>
        <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>or paste URL</span>
        <input type="text" onChange={(e) => onChange(e.target.value)} placeholder="https://..." style={{ flex: 1, minWidth: '120px', padding: '0.5rem 0.65rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.82rem', background: 'var(--bg)', color: 'var(--text)' }} />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
