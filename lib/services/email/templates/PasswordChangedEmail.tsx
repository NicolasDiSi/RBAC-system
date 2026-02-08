import * as React from 'react';
import { Html, Head, Body, Container, Text, Preview } from '@react-email/components';

interface PasswordChangedEmailProps {
  email: string;
}

export const PasswordChangedEmail = ({ email }: PasswordChangedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your password has been changed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Password Changed</Text>
        <Text style={paragraph}>
          The password for your account ({email}) has been successfully changed.
        </Text>
        <Text style={paragraph}>
          If you did not make this change, please contact support immediately.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = { fontFamily: 'sans-serif', backgroundColor: '#ffffff' };
const container = { margin: '0 auto', padding: '20px 0 48px' };
const heading = { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' };
const paragraph = { fontSize: '16px', lineHeight: '26px', marginBottom: '24px' };