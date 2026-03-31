import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { mapEntrySchema } from "@/lib/validations"

export async function GET() {
  try {
    const entries = await prisma.mapEntry.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(entries)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = mapEntrySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { lat, lon, name, category, prelims, mains, india } = validation.data
    
    const entry = await prisma.mapEntry.create({
      data: {
        lat,
        lon,
        name,
        category,
        prelims,
        mains,
        india
      }
    })

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'CONTENT_EDIT',
        details: `Created map entry: ${name} (${category})`,
        userId: session.user.id
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}
