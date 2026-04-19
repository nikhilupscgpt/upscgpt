import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: [{ category: 'asc' }, { shortName: 'asc' }]
    })
    return NextResponse.json(orgs)
  } catch (error) {
    console.error('GET /api/organizations error:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}
