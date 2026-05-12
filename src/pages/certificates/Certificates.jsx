import CrudPage from '../../components/CrudPage';

const Certificates = () => (
  <CrudPage
    title="Certificates"
    endpoint="certificates"
    fields={[
      { key: 'title', label: 'Certificate Title', required: true, placeholder: 'e.g. 12A Registration Certificate' },
      { key: 'category', label: 'Category Tag', placeholder: 'e.g. 12A Certificate, 80G Certificate' },
      { key: 'image', label: 'Preview Image (webp/jpg)', type: 'image' },
      { key: 'fileUrl', label: 'PDF File', type: 'file', accept: '.pdf', required: true },
    ]}
  />
);

export default Certificates;
