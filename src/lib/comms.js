import { Resend } from 'resend';
import nodemailer from 'nodemailer';

function isPlaceholder(val) {
  if (!val) return true;
  const s = String(val).trim().toLowerCase();
  return (
    s === '' ||
    s.includes('your-email') ||
    s.includes('your-app-password') ||
    s.includes('your_api_key') ||
    s.includes('example.com')
  );
}

/**
 * Returns currently active mail provider status.
 */
export function getEmailProviderInfo() {
  if (process.env.RESEND_API_KEY && !isPlaceholder(process.env.RESEND_API_KEY)) {
    return {
      provider: 'RESEND',
      configured: true,
      sender: process.env.RESEND_FROM || 'UPSCGPT <notifications@upscgpt.in>',
    };
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && !isPlaceholder(process.env.SMTP_USER)) {
    return {
      provider: 'SMTP',
      configured: true,
      sender: process.env.SMTP_FROM || `UPSCGPT <${process.env.SMTP_USER}>`,
    };
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_PASS && !isPlaceholder(process.env.GMAIL_USER)) {
    return {
      provider: 'GMAIL',
      configured: true,
      sender: `UPSCGPT <${process.env.GMAIL_USER}>`,
    };
  }

  return {
    provider: 'SIMULATION',
    configured: false,
    sender: 'UPSCGPT Simulation <dev@upscgpt.in>',
  };
}

/**
 * Creates SMTP transporter on demand using current environment variables.
 */
function createSmtpTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && !isPlaceholder(process.env.SMTP_USER)) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
      from: process.env.SMTP_FROM || `UPSCGPT <${process.env.SMTP_USER}>`,
      provider: 'SMTP',
    };
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_PASS && !isPlaceholder(process.env.GMAIL_USER)) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS, // App Password
        },
      }),
      from: `UPSCGPT <${process.env.GMAIL_USER}>`,
      provider: 'GMAIL',
    };
  }

  return null;
}

/**
 * Universal Communication Service for UPSCGPT
 */
export async function sendEmail({ to, subject, html, text }) {
  const providerInfo = getEmailProviderInfo();

  // 1. Try Resend if configured
  if (providerInfo.provider === 'RESEND') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: providerInfo.sender,
        to: Array.isArray(to) ? to : [to],
        subject: subject || 'UPSCGPT Notification',
        html: html || (text ? `<p style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${text.replace(/\n/g, '<br/>')}</p>` : ''),
        text: text || '',
      });
      if (error) throw error;
      return { success: true, provider: 'RESEND', messageId: data?.id };
    } catch (err) {
      console.error('[Comms] Resend failed:', err.message);
      // Fall through to SMTP if configured
    }
  }

  // 2. Try SMTP / Gmail if configured
  const smtpConfig = createSmtpTransporter();
  if (smtpConfig) {
    try {
      const info = await smtpConfig.transporter.sendMail({
        from: smtpConfig.from,
        to,
        subject: subject || 'UPSCGPT Notification',
        text: text || '',
        html: html || (text ? `<p style="font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${text.replace(/\n/g, '<br/>')}</p>` : ''),
      });
      return { success: true, provider: smtpConfig.provider, messageId: info?.messageId };
    } catch (err) {
      console.error(`[Comms] ${smtpConfig.provider} failed:`, err.message);
    }
  }

  // 3. Simulation mode (credentials not yet provided or invalid)
  console.log('────────────────────────────────────────────────────────────────────');
  console.log(`[Comms: EMAIL SIMULATION]`);
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:    ${text || '(HTML message content)'}`);
  console.log('────────────────────────────────────────────────────────────────────');

  return {
    success: true,
    simulated: true,
    provider: 'SIMULATION',
    note: 'Email simulated in server console. To send real emails, set GMAIL_USER/PASS or RESEND_API_KEY in .env.',
  };
}

/**
 * Branded Responsive OTP Email Template
 */
export function getOtpEmailHtml({ otp, email }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your UPSCGPT Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #111c34; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.05em; color: #ffffff;">
                      UPSCGPT <span style="color: #38bdf8; font-size: 15px; font-weight: 700;">· ATLAS & STUDIO</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase;">
                      Secure Account Authentication
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 14px;">Your One-Time Passcode (OTP)</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px;">
                Use the following 6-digit verification code to complete your login to <strong>UPSCGPT Atlas</strong>.
              </p>

              <!-- OTP Code Display -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 26px;">
                <tr>
                  <td align="center" style="background: rgba(56, 189, 248, 0.08); border: 2px dashed #0284c7; border-radius: 14px; padding: 22px 16px;">
                    <span style="font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #38bdf8; font-family: monospace; display: inline-block; padding-left: 12px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Warning -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13.5px; color: #fbbf24; line-height: 1.5;">
                  ⏱️ This code is valid for <strong>10 minutes</strong>. Never share your OTP with anyone.
                </p>
              </div>

              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
                If you did not request this verification email for <span style="color: #94a3b8;">${email}</span>, you can safely ignore this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0b1120; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                UPSCGPT Knowledge Systems · India's Intelligent UPSC Preparation Ecosystem<br>
                <a href="https://upscgpt.in" style="color: #38bdf8; text-decoration: none;">upscgpt.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Branded Responsive Announcement / Update Email Template
 */
export function getAnnouncementEmailHtml({ subject, content, recipientName }) {
  const paragraphs = String(content || '')
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="font-size: 15.5px; line-height: 1.65; color: #cbd5e1; margin: 0 0 16px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || 'UPSCGPT Update'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111c34; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 38px; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.05em; color: #ffffff;">
                UPSCGPT <span style="color: #38bdf8; font-size: 15px; font-weight: 700;">· OFFICIAL UPDATE</span>
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 38px 28px;">
              ${recipientName ? `<p style="font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 18px;">Hi ${recipientName},</p>` : ''}
              
              <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 20px; line-height: 1.35;">
                ${subject || 'UPSCGPT Platform Announcement'}
              </h1>

              <div style="margin-bottom: 28px;">
                ${paragraphs}
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px 0 20px;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%); border-radius: 12px;">
                    <a href="https://upscgpt.in" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.02em;">
                      Open UPSCGPT Platform →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 38px; background-color: #0b1120; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                UPSCGPT Knowledge Systems · You are receiving this because you have an account on UPSCGPT.<br>
                To manage your preferences or unsubscribe, visit your account settings.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Msg91 SMS Integration (India)
 */
export async function sendSMS({ to, message, templateId }) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.warn('[Comms] Msg91 Auth Key missing. SMS simulated to:', to);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId || process.env.MSG91_OTP_TEMPLATE_ID,
        short_url: '1',
        recipients: [{ mobiles: to, message }],
      }),
    });

    const data = await response.json();
    return { success: data.type === 'success', data };
  } catch (err) {
    console.error('[Comms] SMS failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * WhatsApp Integration via Msg91
 */
export async function sendWhatsApp({ to, templateName, params }) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.warn('[Comms] Msg91 Auth Key missing. WhatsApp simulated to:', to);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/whatsapp/send/', {
      method: 'POST',
      headers: {
        authkey: authKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        integrated_number: process.env.WHATSAPP_NUMBER,
        content_type: 'template',
        payload: {
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [{ type: 'body', parameters: params }],
          },
        },
      }),
    });

    const data = await response.json();
    return { success: data.status === 'success', data };
  } catch (err) {
    console.error('[Comms] WhatsApp failed:', err.message);
    return { success: false, error: err.message };
  }
}
