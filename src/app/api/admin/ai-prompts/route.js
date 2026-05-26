import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/prisma'
import { authOptions } from "@/lib/auth"
import { getPromptConfigKey, listAiPrompts } from '@/lib/aiPromptRegistry'
import { runWithRetry } from '@/lib/db-retry'

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
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timed out after 15s')), 15000)
    );

    const dbQueryPromise = runWithRetry(async () => {
      return await listAiPrompts()
    }, 2, 500);

    const prompts = await Promise.race([dbQueryPromise, timeoutPromise]);
    
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

    const config = await runWithRetry(() =>
      prisma.platformConfig.upsert({
        where: { key: getPromptConfigKey(id) },
        update: { value },
        create: {
          key: getPromptConfigKey(id),
          value,
        },
      })
    )

    await prisma.actionLog.create({
      data: {
        action: 'AI_PROMPT_UPDATE',
        userId: session.user.id,
        message: `Updated AI prompt: ${id}`,
      },
    })

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('[AdminAiPrompts] POST failed:', error)
    return NextResponse.json({ error: 'Failed to save AI prompt' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/ai-prompts
 * Resets a prompt to its default value by removing the DB override.
 * Body: { id: string }
 */
export async function DELETE(req) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Prompt id is required.' }, { status: 400 })
    }

    const key = getPromptConfigKey(id)

    // Delete the DB override so the code defaultValue takes effect
    await runWithRetry(() =>
      prisma.platformConfig.deleteMany({ where: { key } })
    )

    await prisma.actionLog.create({
      data: {
        action: 'AI_PROMPT_RESET',
        userId: session.user.id,
        message: `Reset AI prompt to default: ${id}`,
      },
    })

    return NextResponse.json({ success: true, message: `Prompt "${id}" has been reset to its default value.` })
  } catch (error) {
    console.error('[AdminAiPrompts] DELETE failed:', error)
    return NextResponse.json({ error: 'Failed to reset AI prompt' }, { status: 500 })
  }
}
