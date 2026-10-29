import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma";

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
      const flat = validation.error.flatten().fieldErrors;
      const firstMsg = Object.values(flat).flat()[0] || 'Invalid input fields';
      return NextResponse.json({ error: firstMsg, details: flat }, { status: 400 })
    }

    const updateData = { ...validation.data }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10)
    } else {
      delete updateData.password
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Audit the action (non-blocking)
    try {
      if (session?.user?.id) {
        await prisma.actionLog.create({
          data: {
            action: 'USER_MOD',
            message: `Updated user: ${user.email || user.username} (ID: ${user.id})`,
            userId: session.user.id
          }
        })
      }
    } catch (logErr) {
      console.warn('ActionLog skipped:', logErr?.message)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("User update failed:", error)
    return NextResponse.json({ error: error?.message || "Failed to update user" }, { status: 500 })
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
    
    // Audit the action (non-blocking)
    try {
      if (session?.user?.id) {
        await prisma.actionLog.create({
          data: {
            action: 'USER_MOD',
            message: `Deleted user: ${user.email || user.username} (ID: ${user.id})`,
            userId: session.user.id
          }
        })
      }
    } catch (logErr) {
      console.warn('ActionLog skipped:', logErr?.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("User deletion failed:", error)
    return NextResponse.json({ error: error?.message || "Failed to delete user" }, { status: 500 })
  }
}
