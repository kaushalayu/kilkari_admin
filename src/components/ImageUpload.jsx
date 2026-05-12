import { useState } from 'react';
import api, { getFullUrl } from '../api/client';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const ImageUpload = ({ value, onChange, folder = 'general', placeholder = 'Upload Image' }) => {
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
      setError('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = getFullUrl(value);

  if (value) {
    return (
      <div className="image-upload-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src={imageUrl} alt="" className="image-preview" onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='8' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E`; }} />
          <label className="image-upload-btn">
            <FiUploadCloud /> Change
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </label>
          <button type="button" className="btn-icon btn-delete" onClick={() => onChange('')} aria-label="Remove">
            <FiX />
          </button>
        </div>
        {error && <p className="image-upload-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="image-upload-wrapper">
      <label className={`image-upload-btn ${uploading ? 'disabled' : ''}`}>
        <FiUploadCloud /> {uploading ? 'Uploading...' : placeholder}
        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </label>
      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
};

export default ImageUpload;
