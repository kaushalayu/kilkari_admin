import CrudPage from '../../components/CrudPage';

const JoinNow = () => (
  <CrudPage
    title="Join Now Form"
    endpoint="join-now"
    fields={[
      { key: 'heading', label: 'Heading' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'buttonText', label: 'Button Text' },
    ]}
  />
);

export default JoinNow;
