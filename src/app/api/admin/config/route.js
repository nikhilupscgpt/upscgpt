import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const configs = await prisma.platformConfig.findMany()
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {})
    return NextResponse.json(configMap)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("Config POST Error:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}
