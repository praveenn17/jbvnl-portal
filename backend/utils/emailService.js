/**
 * Email Service — JBVNL Portal
 * ----------------------------
 * Sends transactional emails using nodemailer.
 *
 * Required .env variables:
 *   SMTP_HOST   — e.g. smtp.gmail.com
 *   SMTP_PORT   — e.g. 587
 *   SMTP_USER   — your email address
 *   SMTP_PASS   — your email password or app password
 *   SMTP_FROM   — "JBVNL Portal <noreply@jbvnl.in>"
 *
 * In development (NODE_ENV !== 'production'), OTP is also printed to
 * the console so you can test without real SMTP credentials.
 */

const nodemailer = require('nodemailer');

/**
 * Create a nodemailer transporter.
 * If SMTP_HOST is not set, we fall back to a no-op transporter that just
 * logs the email so the app doesn't crash in environments without SMTP.
 */
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] WARNING: SMTP credentials missing in .env — emails will NOT be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for port 465, false for others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an OTP email to the specified address.
 *
 * @param {string} toEmail   - Recipient email address
 * @param {string} otp       - Plain-text 6-digit OTP (NOT stored — only used here)
 * @returns {Promise<boolean>} true if sent (or dev mode), false on error
 */
async function sendOtpEmail(toEmail, otp) {
  const isDev = process.env.NODE_ENV !== 'production';

  // In development, always log OTP to console for easy testing
  if (isDev) {
    console.warn('');
    console.warn('╔══════════════════════════════════════════╗');
    console.warn('║         [DEV] OTP FOR TESTING            ║');
    console.warn(`║  Email : ${toEmail.padEnd(32)}║`);
    console.warn(`║  OTP   : ${otp.padEnd(32)}║`);
    console.warn('║  (Not shown in production)               ║');
    console.warn('╚══════════════════════════════════════════╝');
    console.warn('');
  }

  const transporter = createTransporter();

  // If no transporter, dev can still use console-logged OTP
  if (!transporter) {
    if (isDev) {
      console.warn('[EMAIL] No SMTP — OTP logged to console above for dev testing.');
      return true; // Return true in dev so registration flow continues
    }
    console.error('[EMAIL] SMTP not configured. Cannot send OTP in production.');
    return false;
  }

  const from = process.env.SMTP_FROM || `JBVNL Portal <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from,
    to: toEmail,
    subject: 'Your JBVNL Portal Verification Code',
    text: `Your JBVNL Portal verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a3a5c; font-size: 22px; margin: 0;">JBVNL Portal</h1>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Jharkhand Bijli Vitran Nigam Limited</p>
        </div>
        <div style="background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1a3a5c; font-size: 18px; margin-top: 0;">Email Verification</h2>
          <p style="color: #444; font-size: 15px;">Please use the following code to verify your email address:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #f0f4ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px 32px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a3a5c; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="color: #666; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 16px;">
            If you did not request this code, please ignore this email.
          </p>
        </div>
        <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 16px;">
          &copy; JBVNL Portal — Do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.warn(`[EMAIL] OTP sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send OTP email:', err.message);
    return false;
  }
}

module.exports = { sendOtpEmail };
