import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Simulate payment verification
    console.log(`[Upgrade API] Upgrading user ${session.user.id} to PRO...`)

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tier: 'PRO'
      }
    })

    // Note: NextAuth session won't update immediately on client until refresh
    // but the DB is updated.
    return NextResponse.json({ 
      success: true, 
      message: "Upgrade successful! Welcome to PRO tier.",
      tier: 'PRO'
    })
  } catch (error) {
    console.error("[Upgrade API] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
