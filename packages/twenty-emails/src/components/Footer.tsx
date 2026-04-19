import { type I18n } from '@lingui/core';
import { Column, Container, Row } from '@react-email/components';
import { Link } from 'src/components/Link';
import { ShadowText } from 'src/components/ShadowText';

const footerContainerStyle = {
  marginTop: '12px',
};

type FooterProps = {
  i18n: I18n;
};

export const Footer = ({ i18n }: FooterProps) => {
  return (
    <Container style={footerContainerStyle}>
      <Row>
        <Column>
          <ShadowText>
            <Link
              href="https://optale.no/"
              value={i18n._('Website')}
              aria-label={i18n._("Visit Optale's website")}
            />
          </ShadowText>
        </Column>
        <Column>
          <ShadowText>
            <Link
              href="https://github.com/Optale-no/twenty-fork"
              value={i18n._('Source')}
              aria-label={i18n._("Optale CRM source (forked from Twenty, AGPL-3.0)")}
            />
          </ShadowText>
        </Column>
      </Row>
      <ShadowText>
        <>
          {i18n._('Optale AS · org.nr. 933 367 781')}
          <br />
          {i18n._('Bergen, Norway')}
        </>
      </ShadowText>
    </Container>
  );
};
