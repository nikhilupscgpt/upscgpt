import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Universal Communication Service for UPSCGPT
 * Designed to be provider-agnostic. 
 * If you switch from Msg91 or Resend, only this file needs modification.
 */

export async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    console.warn('[Comms] Resend API key missing. Email simulated to:', to);
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'UPSCGPT <notifications@upscgpt.com>', // Replace with your verified domain
      to: [to],
      subject,
      html: html || text,
    });

    if (error) throw error;
    return { success: true, id: data.id };
  } catch (err) {
    console.error('[Comms] Email failed:', err.message);
    return { success: false, error: err.message };
  }
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
    // Msg91 Flow API
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        template_id: templateId || process.env.MSG91_OTP_TEMPLATE_ID,
        short_url: '1',
        recipients: [{ mobiles: to, message }]
      })
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
        'authkey': authKey,
        'content-type': 'application/json'
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
            components: [{ type: 'body', parameters: params }]
          }
        }
      })
    });

    const data = await response.json();
    return { success: data.status === 'success', data };
  } catch (err) {
    console.error('[Comms] WhatsApp failed:', err.message);
    return { success: false, error: err.message };
  }
}
