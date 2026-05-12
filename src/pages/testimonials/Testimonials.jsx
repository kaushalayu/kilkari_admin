import CrudPage from '../../components/CrudPage';

const Testimonials = () => (
  <CrudPage
    title="Testimonials"
    endpoint="testimonials"
    fields={[
      { key: 'name', label: 'Name', required: true },
      { key: 'photo', label: 'Photo', type: 'image' },
      { key: 'quote', label: 'Quote / Testimonial', type: 'textarea', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      { key: 'role', label: 'Role / Designation' },
    ]}
  />
);

export default Testimonials;
