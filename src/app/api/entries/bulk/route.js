import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { entries } = await req.json()
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const payload = entries.map(e => {
      const parsedLat = parseFloat(e.lat)
      const parsedLon = parseFloat(e.lon)
      const parsedYear = parseInt(e.year)
      
      return {
        lat: isNaN(parsedLat) ? null : parsedLat,
        lon: isNaN(parsedLon) ? null : parsedLon,
        name: e.name || "Unnamed",
        category: e.category || "strait",
        tags: e.tags || null,
        year: isNaN(parsedYear) ? null : parsedYear,
        shape: e.shape || null,
        prelims: e.prelims || "",
        mains: e.mains || "",
        india: e.india || "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const result = await prisma.mapEntry.createMany({
      data: payload,
      skipDuplicates: true // This is the fix for the 500 error on duplicates
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk POST Error:", error)
    return NextResponse.json({ error: error.message || "Failed to insert bulk entries" }, { status: 500 })
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
