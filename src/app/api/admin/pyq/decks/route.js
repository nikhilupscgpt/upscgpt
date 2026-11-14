import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { sanitizeDeckInput } from '@/lib/pyq/deck-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const userId = auth.session?.user?.id || '';
    const decks = await prisma.deck.findMany({
      where: {
        OR: [{ ownerId: userId }, { isShared: true }],
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const myDecks = decks.filter((d) => d.ownerId === userId);
    const sharedDecks = decks.filter((d) => d.isShared && d.ownerId !== userId);

    return NextResponse.json({ myDecks, sharedDecks });
  } catch (err) {
    console.error('[GET /api/admin/pyq/decks] Error:', err);
    return NextResponse.json({ error: 'Failed to load decks' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const ownerId = auth.session?.user?.id;
    if (!ownerId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = sanitizeDeckInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const deck = await prisma.deck.create({
      data: {
        ownerId,
        title: parsed.data.title,
        isShared: parsed.data.isShared,
        sectionPath: parsed.data.sectionPath,
        notes: parsed.data.notes,
        items: {
          create: parsed.data.questionIds.map((questionId, position) => ({
            questionId,
            position,
          })),
        },
      },
      include: {
        items: { orderBy: { position: 'asc' } },
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/pyq/decks] Error:', err);
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
  }
}
