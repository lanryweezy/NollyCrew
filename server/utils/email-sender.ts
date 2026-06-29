import { logger } from './logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Email provider configuration
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'NollyCrew <noreply@nollycrew.com>';

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from = EMAIL_FROM } = options;

  // Try SendGrid first
  if (SENDGRID_API_KEY) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from.replace(/.*</, '').replace(/>/, ''), name: 'NollyCrew' },
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      });

      if (response.ok) {
        logger.info(`Email sent to ${to} via SendGrid`);
        return true;
      } else {
        const error = await response.text();
        logger.error(`SendGrid error: ${error}`);
      }
    } catch (error) {
      logger.error(`SendGrid failed: ${(error as Error).message}`);
    }
  }

  // Try SMTP if configured
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      // Dynamic import for nodemailer (optional dependency)
      const nodemailer = await import('nodemailer' as string).catch(() => null);
      if (nodemailer) {
        const transporter = nodemailer.default.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || '587'),
          secure: SMTP_PORT === '465',
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transporter.sendMail({ from, to, subject, html });
        logger.info(`Email sent to ${to} via SMTP`);
        return true;
      }
    } catch (error) {
      logger.error(`SMTP failed: ${(error as Error).message}`);
    }
  }

  // Fallback: log the email (development mode)
  logger.info(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
  logger.info(`[EMAIL CONTENT] Email template generated but no email provider configured. Set SENDGRID_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS.`);
  
  // Store email for later sending
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const emailDir = path.join(process.cwd(), 'logs', 'emails');
    await fs.mkdir(emailDir, { recursive: true });
    const filename = `${Date.now()}-${to.replace(/[^a-z0-9]/gi, '_')}.html`;
    await fs.writeFile(path.join(emailDir, filename), html);
    logger.info(`Email saved to logs/emails/${filename}`);
  } catch {}

  return false;
}

export function isEmailConfigured(): boolean {
  return !!(SENDGRID_API_KEY || (SMTP_HOST && SMTP_USER && SMTP_PASS));
}
