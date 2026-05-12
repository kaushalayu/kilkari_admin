import OtpLogin from '../../components/OtpLogin';

const DonorLogin = ({ onLogin }) => (
  <OtpLogin
    portalType="donor"
    label="Donor"
    sendEndpoint="/portal-auth/donor/send-otp"
    verifyEndpoint="/portal-auth/donor/verify-otp"
    footerText="Don't have an account?"
    footerLink="https://kilkaricares.org/contact"
    footerLabel="Contact us"
  />
);
export default DonorLogin;