import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getPromptConfigKey, listAiPrompts } from '@/lib/aiPromptRegistry'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prompts = await listAiPrompts()
    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('[AdminAiPrompts] GET failed:', error)
    return NextResponse.json({ error: 'Failed to fetch AI prompts' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, value } = body

    if (!id || typeof value !== 'string') {
      return NextResponse.json({ error: 'Prompt id and string value are required.' }, { status: 400 })
    }

    const config = await prisma.platformConfig.upsert({
      where: { key: getPromptConfigKey(id) },
      update: { value },
      create: {
        key: getPromptConfigKey(id),
        value,
      },
    })

    await prisma.actionLog.create({
      data: {
        action: 'AI_PROMPT_UPDATE',
        userId: session.user.id,
        details: `Updated AI prompt: ${id}`,
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('[AdminAiPrompts] POST failed:', error)
    return NextResponse.json({ error: 'Failed to save AI prompt' }, { status: 500 })
  }
}

