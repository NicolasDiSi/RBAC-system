import nodemailer from 'nodemailer';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // Use 'true' for port 465, 'false' for 587 with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${baseUrl}/api/auth/verify-token?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER, // Sender address, usually the same as SMTP_USER
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome!</h1>
        <p>Please click the link below to verify your email address and activate your account.</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Reset Password</h1>
        <p>Please click the link below to reset your password.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email.');
  }
}