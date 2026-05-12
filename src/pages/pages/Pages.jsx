import CrudPage from '../../components/CrudPage';

const Pages = () => (
  <CrudPage
    title="Pages"
    endpoint="pages"
    useSlug={true}
    fields={[
      { key: 'slug', label: 'Slug', required: true },
      { key: 'title', label: 'Title', required: true },
      { key: 'breadcrumbTitle', label: 'Breadcrumb Title' },
    ]}
  />
);

export default Pages;
