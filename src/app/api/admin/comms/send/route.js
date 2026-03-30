import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendEmail, sendSMS, sendWhatsApp } from '@/lib/comms'

const prisma = new PrismaClient()

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function POST(req) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { channel, type, content, recipients, templateName, params } = await req.json()
    
    // Logic: If recipients is "ALL", "PRO", or "FREE", fetch the list.
    // Otherwise, assume it's an array of targeted emails/phones.
    let targetUsers = []
    if (recipients === 'ALL') {
      targetUsers = await prisma.user.findMany({ where: { email: { not: null } } })
    } else if (recipients === 'PRO') {
      targetUsers = await prisma.user.findMany({ where: { email: { not: null }, tier: 'PRO' } })
    } else if (recipients === 'FREE') {
      targetUsers = await prisma.user.findMany({ where: { email: { not: null }, tier: 'FREE' } })
    } else if (Array.isArray(recipients)) {
      // Manual list
      targetUsers = recipients.map(r => ({ email: r, name: r.split('@')[0] }))
    }

    const results = []
    for (const user of targetUsers) {
      let res;
      if (channel === 'EMAIL') {
        res = await sendEmail({ to: user.email, subject: `UPSCGPT Update: ${type}`, text: content })
      } else if (channel === 'SMS') {
        res = await sendSMS({ to: user.phone || user.email, message: content })
      } else if (channel === 'WHATSAPP') {
        res = await sendWhatsApp({ to: user.phone || user.email, templateName, params })
      }

      // Log it!
      await prisma.communicationLog.create({
        data: {
          userId: user.id || null,
          type: type || 'MARKETING',
          channel,
          status: res.success ? 'SENT' : 'FAILED',
          content: content || templateName,
          recipient: user.email || user.phone || 'unknown'
        }
      })
      results.push({ email: user.email, success: res.success })
    }

    return NextResponse.json({ success: true, count: results.length, details: results })
  } catch (error) {
    console.error('[AdminComms] Bulk send failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
