import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
    const { lat, lon, name, category, prelims, mains, india } = body
    
    // Basic validation
    if (!lat || !lon || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const entry = await prisma.mapEntry.create({
      data: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name,
        category: category || "strait",
        prelims: prelims || "",
        mains: mains || "",
        india: india || ""
      }
    })
    return NextResponse.json(entry)
  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}
