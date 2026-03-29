import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { entries } = await req.json()
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const payload = entries.map(e => ({
      lat: Number.isNaN(parseFloat(e.lat)) ? null : parseFloat(e.lat),
      lon: Number.isNaN(parseFloat(e.lon)) ? null : parseFloat(e.lon),
      name: e.name || "Unnamed",
      category: e.category || "strait",
      tags: e.tags || null,
      year: e.year ? parseInt(e.year) : null,
      shape: e.shape || null,
      prelims: e.prelims || "",
      mains: e.mains || "",
      india: e.india || ""
    }))

    const result = await prisma.mapEntry.createMany({
      data: payload
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
    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete all entries" }, { status: 500 })
  }
}
