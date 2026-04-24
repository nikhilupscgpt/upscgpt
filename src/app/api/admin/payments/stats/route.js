import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { runWithRetry } from "@/lib/db-retry"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { totalUsers, proUsers, activeSubs, recentPayments } = await runWithRetry(async () => {
      const tUsers = await prisma.user.count()
      const pUsers = await prisma.user.count({ where: { tier: 'PRO' } })
      const aSubs = await prisma.subscription.count({ where: { status: 'active' } })
      
      const rPayments = await prisma.paymentLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
      
      return { totalUsers: tUsers, proUsers: pUsers, activeSubs: aSubs, recentPayments: rPayments }
    }, 3, 500)

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        proUsers,
        activeSubs,
        proRate: totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0
      },
      recentPayments
    })
  } catch (error) {
    console.error('[AdminPayments] Stats failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
