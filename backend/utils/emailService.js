const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] WARNING: SMTP credentials missing in .env — emails will NOT be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail(toEmail, otp) {
  const isDev = process.env.NODE_ENV !== 'production';

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

  if (!transporter) {
    if (isDev) {
      console.warn('[EMAIL] No SMTP — OTP logged to console above for dev testing.');
      return true;
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

async function sendPasswordResetEmail(toEmail, userName, resetUrl) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    console.warn('');
    console.warn('╔══════════════════════════════════════════════╗');
    console.warn('║   [DEV] PASSWORD RESET LINK GENERATED        ║');
    console.warn(`║  To   : ${toEmail.substring(0, 34).padEnd(34)}║`);
    console.warn(`║  Name : ${userName.substring(0, 34).padEnd(34)}║`);
    console.warn('╚══════════════════════════════════════════════╝');
    console.warn(`[DEV] Full reset URL: ${resetUrl}`);
    console.warn('');
  }

  const transporter = createTransporter();

  if (!transporter) {
    if (isDev) {
      console.warn('[EMAIL] No SMTP — reset URL logged to console above for dev testing.');
      return true;
    }
    console.error('[EMAIL] SMTP not configured. Cannot send password reset email in production.');
    return false;
  }

  const from = process.env.SMTP_FROM || `JBVNL Portal <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from,
    to: toEmail,
    subject: 'Reset Your JBVNL Portal Password',
    text: [
      `Hello ${userName},`,
      '',
      'You requested a password reset for your JBVNL Portal account.',
      '',
      'Click the link below to reset your password (expires in 15 minutes):',
      resetUrl,
      '',
      'If you did not request this, please ignore this email. Your password will remain unchanged.',
      '',
      '— JBVNL Portal Security Team',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f4f6fb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1a3a5c, #2563eb); border-radius: 12px; padding: 12px 24px;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0; letter-spacing: 1px;">&#9889; JBVNL Portal</h1>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0;">Jharkhand Bijli Vitran Nigam Limited</p>
        </div>

        <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <h2 style="color: #1a3a5c; font-size: 22px; margin: 0 0 8px;">Password Reset Request</h2>
          <p style="color: #374151; font-size: 15px; margin: 0 0 8px;">Hello, <strong>${userName}</strong></p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
            We received a request to reset your JBVNL Portal account password.
            Click the button below to set a new password. This link expires in
            <strong>15 minutes</strong>.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff;
                      text-decoration: none; padding: 14px 36px; border-radius: 8px;
                      font-size: 16px; font-weight: 700; letter-spacing: 0.5px;
                      box-shadow: 0 4px 12px rgba(37,99,235,0.4);">
              &#128273; Reset My Password
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 24px;">
            If the button doesn&apos;t work, copy and paste this link:<br />
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">
              &#9203; <strong>This link expires in 15 minutes.</strong>
              After that, you will need to request a new reset link.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
            If you did not request a password reset, please ignore this email.<br />
            Your account is safe and your password has <strong>not</strong> been changed.
          </p>
        </div>

        <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} JBVNL Portal &mdash; Do not reply to this email.
          Built by Praveen Kumar.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.warn(`[EMAIL] Password reset email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send password reset email:', err.message);
    return false;
  }
}

async function sendComplaintStatusEmail(toEmail, userName, complaintTitle, oldStatus, newStatus, complaintId) {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.SMTP_FROM || `JBVNL Portal <${process.env.SMTP_USER}>`;
  
  const statusColors = {
    resolved: '#16a34a',
    in_progress: '#d97706', 
    closed: '#6b7280',
    pending: '#dc2626'
  };
  const color = statusColors[newStatus] || '#2563eb';

  const mailOptions = {
    from,
    to: toEmail,
    subject: `Complaint Update: ${complaintTitle} — Status changed to ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f4f6fb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a3a5c;">⚡ JBVNL Portal</h1>
          <p style="color: #6b7280; font-size: 13px;">Jharkhand Bijli Vitran Nigam Limited</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1a3a5c;">Complaint Status Update</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your complaint status has been updated.</p>
          <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">Complaint</td><td style="padding: 8px; font-weight: bold;">${complaintTitle}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Previous Status</td><td style="padding: 8px;">${oldStatus}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">New Status</td><td style="padding: 8px; font-weight: bold; color: ${color};">${newStatus.toUpperCase()}</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 13px;">Log in to your JBVNL Portal account to view full details.</p>
        </div>
        <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 20px;">© ${new Date().getFullYear()} JBVNL Portal</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.warn(`[EMAIL] Complaint status email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send complaint status email:', err.message);
    return false;
  }
}

async function sendBillGeneratedEmail(toEmail, userName, billNumber, billingPeriod, amount, dueDate) {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.SMTP_FROM || `JBVNL Portal <${process.env.SMTP_USER}>`;

  const mailOptions = {
    from,
    to: toEmail,
    subject: `New Bill Generated: ${billingPeriod} — ₹${amount.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f4f6fb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a3a5c;">⚡ JBVNL Portal</h1>
          <p style="color: #6b7280; font-size: 13px;">Jharkhand Bijli Vitran Nigam Limited</p>
        </div>
        <div style="background: #fff; border-radius: 12px; padding: 28px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1a3a5c;">New Bill Generated</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your electricity bill for <strong>${billingPeriod}</strong> has been generated.</p>
          <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; color: #6b7280;">Bill Number</td><td style="padding: 8px; font-weight: bold;">${billNumber}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Billing Period</td><td style="padding: 8px;">${billingPeriod}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Amount Due</td><td style="padding: 8px; font-weight: bold; color: #dc2626;">₹${amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; color: #6b7280;">Due Date</td><td style="padding: 8px;">${new Date(dueDate).toLocaleDateString('en-IN')}</td></tr>
          </table>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL}/consumer/six-months" 
               style="background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Pay Now
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Please pay before the due date to avoid late charges.</p>
        </div>
        <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 20px;">© ${new Date().getFullYear()} JBVNL Portal</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.warn(`[EMAIL] Bill generated email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send bill generated email:', err.message);
    return false;
  }
}

module.exports = { 
  sendOtpEmail, 
  sendPasswordResetEmail,
  sendComplaintStatusEmail,
  sendBillGeneratedEmail
};
