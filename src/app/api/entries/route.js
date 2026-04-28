import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Papa from "papaparse"

import { mapEntrySchema } from "@/lib/validations"

import { runWithRetry } from "@/lib/db-retry"

export async function GET() {
  try {
    // Database-first approach for 100% reliability, wrapped in retry for Neon Serverless
    const entries = await runWithRetry(async () => {
      return await prisma.mapEntry.findMany({
        orderBy: { createdAt: "desc" }
      })
    }, 3, 500);
    
    // Return the entries including the new hierarchical data
    return NextResponse.json(entries)
  } catch (error) {
    console.error("GET Entries Error:", error)
    // Return empty array to prevent frontend .map() crashes
    return NextResponse.json([])
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
