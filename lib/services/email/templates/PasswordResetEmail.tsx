import * as React from 'react';
import { Html, Head, Body, Container, Text, Link, Preview } from '@react-email/components';

interface PasswordResetEmailProps {
  link: string;
}

export const PasswordResetEmail = ({ link }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Reset Password</Text>
        <Text style={paragraph}>Click the link below to reset your password:</Text>
        <Link href={link} style={button}>Reset Password</Link>
      </Container>
    </Body>
  </Html>
);

const main = { fontFamily: 'sans-serif', backgroundColor: '#ffffff' };
const container = { margin: '0 auto', padding: '20px 0 48px' };
const heading = { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' };
const paragraph = { fontSize: '16px', lineHeight: '26px', marginBottom: '24px' };
const button = { backgroundColor: '#000000', color: '#ffffff', padding: '12px 24px', borderRadius: '4px', textDecoration: 'none', fontSize: '16px' };