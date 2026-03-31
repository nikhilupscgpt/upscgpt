import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { bulkEntriesSchema } from "@/lib/validations"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const validation = bulkEntriesSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { entries } = validation.data
    
    const payload = entries.map(e => ({
      ...e,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    const result = await prisma.mapEntry.createMany({
      data: payload,
      skipDuplicates: true
    })

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'CONTENT_EDIT',
        details: `Bulk created map entries. Count: ${result.count}`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk POST Error:", error)
    return NextResponse.json({ error: "Failed to insert bulk entries" }, { status: 500 })
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await prisma.mapEntry.deleteMany({})
    
    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'CONTENT_EDIT',
        details: `Deleted all map entries. Count: ${result.count}`,
        userId: session.user.id
      }
    })
    
    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete all entries" }, { status: 500 })
  }
}
