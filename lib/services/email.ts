import nodemailer from 'nodemailer';
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

  async sendEmail(payload: EmailPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
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
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return new ConsoleProvider();
  }
  return new NodemailerProvider();
}

// --- Queue Producer ---

const QUEUE_KEY = 'email_queue';

async function enqueueEmail(type: 'verification' | 'password_reset', data: { email: string; token: string }) {
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
    html = `<h1>Welcome!</h1><p>Click to verify:</p><a href="${link}">Verify Email</a>`;
  } else if (type === 'password_reset') {
    const link = `${baseUrl}/auth/reset-password?token=${data.token}`;
    subject = 'Reset your password';
    html = `<h1>Reset Password</h1><p>Click to reset:</p><a href="${link}">Reset Password</a>`;
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