import OtpLogin from '../../components/OtpLogin';

const MemberLogin = ({ onLogin }) => (
  <OtpLogin
    portalType="member"
    label="Member"
    sendEndpoint="/portal-auth/member/send-otp"
    verifyEndpoint="/portal-auth/member/verify-otp"
    footerText="Not a member yet?"
    footerLink="https://kilkaricares.org/join"
    footerLabel="Join Kilkari"
  />
);
export default MemberLogin;