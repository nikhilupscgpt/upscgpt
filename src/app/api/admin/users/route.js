import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Helper to check if requester is ADMIN
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, tier: true, validUntil: true, createdAt: true
    }
  })
  return NextResponse.json(users)
}

import { adminUserSchema } from "@/lib/validations"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validation = adminUserSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { email, name, tier, role, password, username } = validation.data
    
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }
    
    const user = await prisma.user.create({
      data: { 
        email, 
        name, 
        username,
        tier: tier || 'FREE', 
        role: role || 'USER',
        password: hashedPassword
      }
    })

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'USER_MOD',
        details: `Created user: ${email || username} (Role: ${role}, Tier: ${tier})`,
        userId: session.user.id
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("User Creation Error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
