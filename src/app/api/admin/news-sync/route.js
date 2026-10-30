import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lastSync = await prisma.actionLog.findFirst({
      where: { action: 'SCRAPE_RUN' },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(lastSync || { message: 'No scrape runs logged.' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'News scraper has been removed.' }, { status: 410 })
}

