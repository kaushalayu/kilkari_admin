import CrudPage from '../../components/CrudPage';

const Partners = () => (
  <CrudPage
    title="Partners"
    endpoint="partners"
    fields={[
      { key: 'name', label: 'Partner Name', required: true },
      { key: 'logo', label: 'Logo', type: 'image', required: true },
      { key: 'organization', label: 'Organization', placeholder: 'e.g. Amar Food Products' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'website', label: 'Website URL', placeholder: 'https://example.com' },
      { key: 'category', label: 'Category', type: 'select', options: ['supporter', 'partner', 'sponsor'] },
    ]}
  />
);

export default Partners;
