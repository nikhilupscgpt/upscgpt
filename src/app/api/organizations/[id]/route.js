import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const { id } = params
    const org = await prisma.organization.findUnique({ where: { id } })
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    // Find member country map entries to get their coordinates for highlighting
    const memberNames = org.members.split(',').map(m => m.trim())
    const memberEntries = await prisma.mapEntry.findMany({
      where: {
        name: { in: memberNames },
        worldPart: 'POLITICAL'
      },
      select: { id: true, name: true, lat: true, lon: true, continent: true }
    })

    return NextResponse.json({ ...org, memberEntries })
  } catch (error) {
    console.error('GET /api/organizations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}
