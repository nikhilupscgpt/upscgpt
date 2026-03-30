import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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

export async function POST(req) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { email, name, tier, role, password } = body
  
  const user = await prisma.user.create({
    data: { 
      email, 
      name, 
      tier: tier || 'FREE', 
      role: role || 'USER',
      password: password || null // In a real app, hash this!
    }
  })
  return NextResponse.json(user)
}
