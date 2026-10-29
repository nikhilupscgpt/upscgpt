import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma";

// Helper to check if requester is ADMIN
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

import { runWithRetry } from '@/lib/db-retry'

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timed out after 15s')), 15000)
    );

    const dbQueryPromise = runWithRetry(async () => {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, username: true, email: true, role: true, tier: true, validUntil: true, createdAt: true
        }
      })
    }, 2, 500);

    const users = await Promise.race([dbQueryPromise, timeoutPromise]);
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
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
      const flat = validation.error.flatten().fieldErrors;
      const firstMsg = Object.values(flat).flat()[0] || 'Invalid input fields';
      return NextResponse.json({ error: firstMsg, details: flat }, { status: 400 })
    }

    const { email, name, tier, role, password, username } = validation.data

    if ((role === 'FACULTY' || role === 'ADMIN') && (!username || !password)) {
      return NextResponse.json(
        { error: 'Username and Password (min 6 chars) are required for Faculty / Admin accounts.' },
        { status: 400 }
      )
    }

    if (!email && !username) {
      return NextResponse.json(
        { error: 'Please provide at least an Email Address or a Username.' },
        { status: 400 }
      )
    }
    
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }
    
    // Upsert by username or email if user already exists, otherwise create
    let user;
    if (username) {
      const existingByUsername = await prisma.user.findUnique({ where: { username } });
      if (existingByUsername) {
        user = await prisma.user.update({
          where: { id: existingByUsername.id },
          data: {
            name,
            email: email || existingByUsername.email,
            tier: tier || (role === 'FACULTY' ? 'PRO' : 'FREE'),
            role: role || 'USER',
            ...(hashedPassword ? { password: hashedPassword } : {}),
          },
        });
      }
    }
    if (!user && email) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            name,
            username: username || existingByEmail.username,
            tier: tier || (role === 'FACULTY' ? 'PRO' : existingByEmail.tier),
            role: role || 'USER',
            ...(hashedPassword ? { password: hashedPassword } : {}),
          },
        });
      }
    }
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email: email || null, 
          name, 
          username: username || null,
          tier: tier || (role === 'FACULTY' ? 'PRO' : 'FREE'), 
          role: role || 'USER',
          password: hashedPassword
        }
      })
    }

    // Audit the action (non-blocking)
    try {
      if (session?.user?.id) {
        await prisma.actionLog.create({
          data: {
            action: 'USER_MOD',
            message: `Provisioned user: ${username || email} (Role: ${role}, Tier: ${tier})`,
            userId: session.user.id
          }
        })
      }
    } catch (logErr) {
      console.warn('ActionLog skipped:', logErr?.message)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("User Creation Error:", error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: `A user with that ${error?.meta?.target || 'username or email'} already exists.` },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error?.message || "Failed to create user" }, { status: 500 })
  }
}
