import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to Database
    await prisma.verificationToken.upsert({
      where: { identifier: email },
      update: { 
        code: otp, 
        token, 
        expires, 
        type: 'EMAIL_OTP' 
      },
      create: { 
        identifier: email, 
        code: otp, 
        token, 
        expires, 
        type: 'EMAIL_OTP' 
      }
    });

    // Log the "Sending" of the OTP
    await prisma.communicationLog.create({
      data: {
        type: 'OTP',
        channel: 'EMAIL',
        recipient: email,
        content: `Your UPSC Atlas OTP is ${otp}`,
        status: 'SENT_MOCK'
      }
    });

    // In a real app, you would use Resend/Nodemailer here
    console.log(`[AUTH] OTP for ${email}: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully (Check console/logs)' 
    });

  } catch (error) {
    console.error(`[OTP Request API] Error:`, error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
