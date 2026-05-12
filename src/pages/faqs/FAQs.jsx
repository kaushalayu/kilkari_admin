import CrudPage from '../../components/CrudPage';

const FAQs = () => (
  <CrudPage
    title="FAQs"
    endpoint="faqs"
    fields={[
      { key: 'question', label: 'Question', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'category', label: 'Category', placeholder: 'e.g. General, Donation' },
      { key: 'order', label: 'Display Order', type: 'number', placeholder: '1, 2, 3...' },
      { key: 'isActive', label: 'Active', type: 'boolean' },
    ]}
  />
);

export default FAQs;
