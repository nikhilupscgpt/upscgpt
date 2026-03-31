import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

import { adminUserSchema } from "@/lib/validations"

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    
    // Partial validation for PATCH
    const validation = adminUserSchema.partial().safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const updateData = { ...validation.data }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'USER_MOD',
        details: `Updated user: ${user.email || user.username} (ID: ${user.id})`,
        userId: session.user.id
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("User update failed:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = await prisma.user.delete({ where: { id } })
    
    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'USER_MOD',
        details: `Deleted user: ${user.email || user.username} (ID: ${user.id})`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User deletion failed:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
