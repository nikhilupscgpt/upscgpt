import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { dedupeQuestionIds } from '@/lib/pyq/deck-helpers';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { id } = await params;
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    if (!deck) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });

    const userId = auth.session?.user?.id;
    if (deck.ownerId !== userId && !deck.isShared && auth.session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ deck });
  } catch (err) {
    console.error('[GET /api/admin/pyq/decks/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to load deck' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { id } = await params;
    const existing = await prisma.deck.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });

    const userId = auth.session?.user?.id;
    if (existing.ownerId !== userId && auth.session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const updateData = {};
    if (typeof body.title === 'string' && body.title.trim()) updateData.title = body.title.trim();
    if (typeof body.isShared === 'boolean') updateData.isShared = body.isShared;
    if (typeof body.notes === 'string' || body.notes === null) updateData.notes = body.notes;

    const nextIds = Array.isArray(body.questionIds) ? dedupeQuestionIds(body.questionIds) : null;

    const deck = await prisma.$transaction(async (tx) => {
      if (nextIds) {
        await tx.deckItem.deleteMany({ where: { deckId: id } });
        if (nextIds.length > 0) {
          await tx.deckItem.createMany({
            data: nextIds.map((questionId, position) => ({
              deckId: id,
              questionId,
              position,
            })),
          });
        }
      }
      return tx.deck.update({
        where: { id },
        data: updateData,
        include: { items: { orderBy: { position: 'asc' } } },
      });
    });

    return NextResponse.json({ deck });
  } catch (err) {
    console.error('[PATCH /api/admin/pyq/decks/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { id } = await params;
    const existing = await prisma.deck.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Deck not found' }, { status: 404 });

    const userId = auth.session?.user?.id;
    if (existing.ownerId !== userId && auth.session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.deck.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/pyq/decks/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}
