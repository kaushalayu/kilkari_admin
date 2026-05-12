import CrudPage from '../../components/CrudPage';

const Counters = () => (
  <CrudPage
    title="Counters"
    endpoint="counters"
    fields={[
      { key: 'number', label: 'Number (e.g. 2800+)', required: true },
      { key: 'label', label: 'Label', required: true },
      { key: 'icon', label: 'Icon Class', placeholder: 'bi-people-fill' },
      { key: 'order', label: 'Display Order', type: 'number', placeholder: '1, 2, 3...' },
    ]}
  />
);

export default Counters;
