import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import crypto from 'crypto';
import { sendEmail, getOtpEmailHtml } from '@/lib/comms';
import { getClientIp, rateLimit, clearHits, tooManyRequests } from '@/lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Flood protection: per IP 20/hour, per email 1/minute and 5/hour.
    const ip = getClientIp(req);
    const ipLimit = await rateLimit({ bucket: 'otp-send-ip', key: ip, limit: 20, windowMs: HOUR, record: false });
    if (!ipLimit.allowed) {
      return tooManyRequests(NextResponse, ipLimit.retryAfterSec, 'Too many code requests from your network. Please try again later.');
    }
    const minuteLimit = await rateLimit({ bucket: 'otp-send-email-1m', key: cleanEmail, limit: 1, windowMs: MINUTE, record: false });
    if (!minuteLimit.allowed) {
      return tooManyRequests(NextResponse, 60, 'Please wait a minute before requesting another code.');
    }
    const hourLimit = await rateLimit({ bucket: 'otp-send-email-1h', key: cleanEmail, limit: 5, windowMs: HOUR, record: false });
    if (!hourLimit.allowed) {
      return tooManyRequests(NextResponse, hourLimit.retryAfterSec, 'Too many codes requested for this email. Please try again in an hour.');
    }
    // All checks passed: record the send in each bucket.
    await Promise.all([
      rateLimit({ bucket: 'otp-send-ip', key: ip, limit: 20, windowMs: HOUR }),
      rateLimit({ bucket: 'otp-send-email-1m', key: cleanEmail, limit: 1, windowMs: MINUTE }),
      rateLimit({ bucket: 'otp-send-email-1h', key: cleanEmail, limit: 5, windowMs: HOUR }),
    ]);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to Database
    await prisma.verificationToken.upsert({
      where: { identifier: cleanEmail },
      update: { 
        code: otp, 
        token, 
        expires, 
        type: 'EMAIL_OTP' 
      },
      create: { 
        identifier: cleanEmail, 
        code: otp, 
        token, 
        expires, 
        type: 'EMAIL_OTP' 
      }
    });

    // A fresh code resets the wrong-code counter for this email (sends are capped at 5/hour above).
    await clearHits({ bucket: 'otp-fail', key: cleanEmail });

    // Send actual OTP Email using configured provider (Gmail, SMTP, Resend, or Console Simulation)
    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: `Your UPSCGPT Verification Code: ${otp}`,
      html: getOtpEmailHtml({ otp, email: cleanEmail }),
      text: `Your UPSCGPT one-time login verification code is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.`,
    });

    const deliveryStatus = emailResult.simulated ? 'SIMULATED' : (emailResult.success ? 'SENT' : 'FAILED');

    // Log to CommunicationLog
    await prisma.communicationLog.create({
      data: {
        type: 'OTP',
        channel: 'EMAIL',
        recipient: cleanEmail,
        content: 'OTP verification code dispatched',
        status: deliveryStatus,
      }
    });

    console.log(`[AUTH] OTP sent (Provider: ${emailResult.provider}, Status: ${deliveryStatus})`);

    return NextResponse.json({ 
      success: true, 
      message: emailResult.simulated 
        ? 'Verification code generated (Simulation mode: check terminal logs until mail credentials are configured)'
        : 'Verification code sent to your email inbox.',
      simulated: Boolean(emailResult.simulated),
    });

  } catch (error) {
    console.error(`[OTP Request API] Error:`, error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
