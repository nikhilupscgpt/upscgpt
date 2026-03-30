import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const totalUsers = await prisma.user.count()
    const proUsers = await prisma.user.count({ where: { tier: 'PRO' } })
    const activeSubs = await prisma.subscription.count({ where: { status: 'active' } })
    
    // Recent 10 payments
    const recentPayments = await prisma.paymentLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })

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
