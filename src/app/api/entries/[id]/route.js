import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

// Public GET — used by NewsTicker to fetch UPSC crux content on click
export async function GET(req, { params }) {
  try {
    const { id } = await params
    const entry = await prisma.mapEntry.findUnique({ where: { id } })
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(entry)
  } catch (error) {
    console.error("GET Entry Error:", error)
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.mapEntry.delete({
      where: { id }
    })
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}
