import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail, sendSMS, sendWhatsApp, getAnnouncementEmailHtml, getEmailProviderInfo } from '@/lib/comms';
import { commsSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalUsers, proUsers, freeUsers, recentLogs] = await Promise.all([
      prisma.user.count({ where: { email: { not: null } } }),
      prisma.user.count({ where: { email: { not: null }, tier: 'PRO' } }),
      prisma.user.count({ where: { email: { not: null }, tier: 'FREE' } }),
      prisma.communicationLog.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const providerInfo = getEmailProviderInfo();

    return NextResponse.json({
      counts: {
        ALL: totalUsers,
        PRO: proUsers,
        FREE: freeUsers,
      },
      provider: providerInfo,
      recentLogs,
    });
  } catch (error) {
    console.error('[AdminComms:GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = commsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { channel, type, subject, content, html, recipients, templateName, params } = validation.data;
    
    // Resolve targeted recipients list
    let targetUsers = [];
    if (recipients === 'ALL') {
      targetUsers = await prisma.user.findMany({
        where: { email: { not: null } },
        select: { id: true, email: true, name: true, phone: true },
      });
    } else if (recipients === 'PRO') {
      targetUsers = await prisma.user.findMany({
        where: { email: { not: null }, tier: 'PRO' },
        select: { id: true, email: true, name: true, phone: true },
      });
    } else if (recipients === 'FREE') {
      targetUsers = await prisma.user.findMany({
        where: { email: { not: null }, tier: 'FREE' },
        select: { id: true, email: true, name: true, phone: true },
      });
    } else if (Array.isArray(recipients)) {
      // Manual list of email addresses
      targetUsers = recipients.map(r => ({ email: r.trim(), name: r.split('@')[0], id: null }));
    }

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'No recipients matched the selected audience.' }, { status: 400 });
    }

    const emailSubject = subject || `UPSCGPT Announcement: ${type || 'Update'}`;
    const results = [];
    let sentCount = 0;
    let simulatedCount = 0;
    let failedCount = 0;

    for (const user of targetUsers) {
      if (!user.email && !user.phone) continue;

      let res;
      if (channel === 'EMAIL') {
        const emailHtml = html || getAnnouncementEmailHtml({
          subject: emailSubject,
          content,
          recipientName: user.name,
        });

        res = await sendEmail({
          to: user.email,
          subject: emailSubject,
          text: content,
          html: emailHtml,
        });
      } else if (channel === 'SMS') {
        res = await sendSMS({ to: user.phone || user.email, message: content });
      } else if (channel === 'WHATSAPP') {
        res = await sendWhatsApp({ to: user.phone || user.email, templateName, params });
      }

      const isSimulated = Boolean(res?.simulated);
      const isSuccess = Boolean(res?.success);
      const status = isSimulated ? 'SIMULATED' : (isSuccess ? 'SENT' : 'FAILED');

      if (isSimulated) simulatedCount++;
      else if (isSuccess) sentCount++;
      else failedCount++;

      // Record to CommunicationLog in database
      await prisma.communicationLog.create({
        data: {
          userId: user.id || null,
          type: type || 'ANNOUNCEMENT',
          channel,
          status,
          content: `${emailSubject} | ${content.slice(0, 160)}`,
          recipient: user.email || user.phone || 'unknown',
        },
      });

      results.push({ email: user.email, status, provider: res?.provider });
    }

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'COMMS_SEND',
        message: `Dispatched ${channel} broadcast. Recipients: ${typeof recipients === 'string' ? recipients : recipients.length + ' custom'}, Count: ${results.length}, Sent: ${sentCount}, Simulated: ${simulatedCount}, Failed: ${failedCount}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      totalCount: results.length,
      sentCount,
      simulatedCount,
      failedCount,
      provider: getEmailProviderInfo(),
      details: results,
    });
  } catch (error) {
    console.error('[AdminComms:POST] Bulk send failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
