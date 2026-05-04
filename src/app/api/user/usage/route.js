import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const FREE_DAILY_SECONDS = 15 * 60 // 15 mins

function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

import { usageIncrementSchema } from "@/lib/validations"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.tier === 'PRO') {
    return NextResponse.json({ premium: true, remaining: Infinity })
  }

  const today = getTodayString()
  let currentUsage = user.dailyMapSeconds || 0
  
  if (user.lastMapAccessDate !== today) {
    // Reset usage for new day
    currentUsage = 0
  }

  try {
    const body = await req.json()
    const validation = usageIncrementSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { incrementSeconds } = validation.data
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
  } catch (error) {
    console.error("Usage update error:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function GET(req) {
  // Just check current status without incrementing
  return POST(new Request(req.url, { method: 'POST', body: JSON.stringify({ incrementSeconds: 0 }), headers: req.headers }))
}
