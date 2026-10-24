import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import crypto from 'crypto';
import { sendEmail, getOtpEmailHtml } from '@/lib/comms';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
        content: `OTP verification code dispatched: ${otp}`,
        status: deliveryStatus,
      }
    });

    console.log(`[AUTH] OTP for ${cleanEmail}: ${otp} (Provider: ${emailResult.provider}, Status: ${deliveryStatus})`);

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
