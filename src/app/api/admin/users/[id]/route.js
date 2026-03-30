import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function PATCH(req, { params }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const body = await req.json()
  
  const user = await prisma.user.update({
    where: { id },
    data: body
  })
  return NextResponse.json(user)
}

export async function DELETE(req, { params }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
