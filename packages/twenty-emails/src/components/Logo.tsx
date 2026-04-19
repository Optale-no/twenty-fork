import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="https://crm.optale.no/optale-favicon.svg"
      alt="Optale CRM logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
