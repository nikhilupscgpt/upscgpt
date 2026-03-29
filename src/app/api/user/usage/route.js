import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const FREE_DAILY_SECONDS = 15 * 60 // 15 mins

function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.tier === 'PREMIUM') {
    return NextResponse.json({ premium: true, remaining: Infinity })
  }

  const today = getTodayString()
  let currentUsage = user.dailyMapSeconds || 0
  
  if (user.lastMapAccessDate !== today) {
    // Reset usage for new day
    currentUsage = 0
  }

  const body = await req.json().catch(() => ({}))
  const { incrementSeconds = 0 } = body

  // We enforce that they can increment max 60s at a time to prevent abuse
  const toAdd = Math.min(incrementSeconds, 60)
  
  if (toAdd > 0) {
    currentUsage += toAdd
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        dailyMapSeconds: currentUsage,
        lastMapAccessDate: today
      }
    })
  }

  const remaining = Math.max(0, FREE_DAILY_SECONDS - currentUsage)
  
  return NextResponse.json({
    premium: false,
    used: currentUsage,
    remaining,
    exhausted: currentUsage >= FREE_DAILY_SECONDS
  })
}

export async function GET(req) {
  // Just check current status without incrementing
  return POST(new Request(req.url, { method: 'POST', body: JSON.stringify({ incrementSeconds: 0 }), headers: req.headers }))
}
