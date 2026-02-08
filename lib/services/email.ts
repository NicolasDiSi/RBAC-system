import nodemailer from 'nodemailer';
import { createElement } from 'react';
import { render } from '@react-email/render';
import { VerificationEmail } from './email/templates/VerificationEmail';
import { PasswordResetEmail } from './email/templates/PasswordResetEmail';
import { PasswordChangedEmail } from './email/templates/PasswordChangedEmail';
import { getRedisClient } from './redis';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// --- Interfaces ---

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<void>;
}

// --- Adapters ---

class NodemailerProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (process.env.EMAIL_PROVIDER === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || process.env.SMTP_USER,
          pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
    await this.transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }
}

class ConsoleProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<void> {
    console.log(`[Email Dev] To: ${payload.to} | Subject: ${payload.subject}`);
  }
}

// --- Factory ---

function getEmailProvider(): EmailProvider {
  // Simple config check to switch providers
  const hasConfig = process.env.SMTP_HOST || process.env.EMAIL_PROVIDER;
  if (process.env.NODE_ENV === 'development' && !hasConfig) {
    return new ConsoleProvider();
  }
  return new NodemailerProvider();
}

// --- Queue Producer ---

const QUEUE_KEY = 'email_queue';

async function enqueueEmail(type: 'verification' | 'password_reset' | 'password_changed', data: { email: string; token?: string }) {
  const redis = await getRedisClient();
  const job = { type, data, timestamp: Date.now() };
  
  try {
    await redis.rpush(QUEUE_KEY, JSON.stringify(job));
  } catch (error) {
    console.error('Redis queue error, falling back to sync send:', error);
    // Fallback to sync send if queue is down
    await processEmailJob(job);
  }
}

// --- Worker Logic (Internal or External) ---

async function processEmailJob(job: { type: string, data: any }) {
  const provider = getEmailProvider();
  const { type, data } = job;
  let subject = '', html = '';

  if (type === 'verification') {
    const link = `${baseUrl}/api/auth/verify-token?token=${data.token}`;
    subject = 'Verify your email address';
    html = await render(createElement(VerificationEmail, { link }));
  } else if (type === 'password_reset') {
    const link = `${baseUrl}/auth/reset-password?token=${data.token}`;
    subject = 'Reset your password';
    html = await render(createElement(PasswordResetEmail, { link }));
  } else if (type === 'password_changed') {
    subject = 'Your password has been changed';
    html = await render(createElement(PasswordChangedEmail, { email: data.email }));
  }

  await provider.sendEmail({ to: data.email, subject, html });
}

// --- Public API ---

export async function sendVerificationEmail(email: string, token: string) {
  await enqueueEmail('verification', { email, token });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  await enqueueEmail('password_reset', { email, token });
}

export async function sendPasswordChangedEmail(email: string) {
  await enqueueEmail('password_changed', { email });
}