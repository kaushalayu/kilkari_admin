import CrudPage from '../../components/CrudPage';
import { getFullUrl } from '../../api/client';

const Gallery = () => (
  <CrudPage
    title="Gallery"
    endpoint="gallery"
    fields={[
      { key: 'title', label: 'Title', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['image', 'video'], required: true },
      {
        key: 'mediaUrl',
        label: 'Image / Video File',
        type: 'image',
        required: true,
        render: (val, item) => {
          if (!val) return '—';
          if (item.type === 'video') {
            return val.includes('youtube.com') || val.includes('youtu.be') || val.includes('vimeo.com')
              ? <a href={getFullUrl(val)} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>▶ Watch</a>
              : <video src={getFullUrl(val)} style={{height: '40px', borderRadius: '4px'}} muted />;
          }
          return <img src={getFullUrl(val)} alt="img" style={{height: '40px', borderRadius: '4px'}} />;
        }
      },
      { key: 'thumbnail', label: 'Thumbnail (for video)', type: 'image' },
      { key: 'category', label: 'Category', placeholder: 'e.g. Education, Health, Events' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ]}
  />
);

export default Gallery;
