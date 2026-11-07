import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { fetchDeckBySetId } from '@/lib/remote/deckHelper';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: NO_CACHE_HEADERS,
  });
}

function err(message, status = 400) {
  return json({ error: message }, status);
}

/**
 * Signalling Endpoint for Smart Board Remote Presenting
 * Supports:
 * - GET ?op=poll&id=...
 * - GET ?op=deck&id=...
 * - POST { op: "create" }
 * - POST { op: "offer", id, epoch, offer }
 * - POST { op: "join", code, setId }
 * - POST { op: "answer", id, epoch, answer }
 */
export async function GET(req) {
  const session = await getServerSession(authOptions).catch(() => null);
  const callerId = session?.user?.id || null;

  const { searchParams } = new URL(req.url);
  const op = searchParams.get('op');
  const id = searchParams.get('id');

  if (!id) {
    return err('Missing session id');
  }

  const remoteSession = await prisma.remoteSession.findUnique({
    where: { id },
  });

  if (!remoteSession) {
    return err('Session not found', 404);
  }

  if (new Date() > new Date(remoteSession.expiresAt)) {
    return err('Session expired', 410);
  }

  const isPublicDisplay = remoteSession.displayUserId === 'board_display';
  const isPublicController = remoteSession.controllerUserId === 'ipad_controller';
  const isDisplay = isPublicDisplay || (callerId && remoteSession.displayUserId === callerId);
  const isController = isPublicController || (callerId && remoteSession.controllerUserId === callerId);

  // 1. POLL
  if (op === 'poll') {
    if (!isDisplay && !isController) {
      return err('Access denied for this session', 403);
    }

    return json({
      epoch: remoteSession.epoch,
      offer: remoteSession.offer,
      answer: remoteSession.answerEpoch === remoteSession.epoch ? remoteSession.answer : null,
      setId: remoteSession.setId,
      code: remoteSession.code,
    });
  }

  // 2. DECK / CONTENT
  if (op === 'deck' || op === 'content') {
    if (!isDisplay && !isController) {
      return err('Access denied for this session deck', 403);
    }

    const deck = await fetchDeckBySetId(remoteSession.setId);
    return json({
      deck,
      setId: remoteSession.setId,
    });
  }

  return err(`Unsupported GET operation: ${op}`);
}

export async function POST(req) {
  const session = await getServerSession(authOptions).catch(() => null);
  const callerId = session?.user?.id || null;

  let body;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body');
  }

  const { op } = body || {};

  // 1. CREATE (Board creates a new session with random 6-digit code)
  if (op === 'create') {
    const now = new Date();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours TTL

    // Generate unique 6-digit code
    let code = '';
    let attempts = 0;
    while (attempts < 15) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await prisma.remoteSession.findFirst({
        where: {
          code,
          expiresAt: { gt: now },
        },
      });
      if (!existing) break;
      attempts++;
    }

    const newSession = await prisma.remoteSession.create({
      data: {
        code,
        displayUserId: callerId || 'board_display',
        epoch: 0,
        expiresAt,
      },
    });

    return json({
      id: newSession.id,
      code: newSession.code,
    });
  }

  // 2. OFFER (Board posts WebRTC offer for an epoch)
  if (op === 'offer') {
    const { id, epoch, offer } = body;
    if (!id || typeof epoch !== 'number' || !offer) {
      return err('Missing id, epoch, or offer');
    }

    const current = await prisma.remoteSession.findUnique({ where: { id } });
    if (!current) return err('Session not found', 404);
    if (new Date() > new Date(current.expiresAt)) return err('Session expired', 410);

    // Ownership check: only display board can post offers
    if (current.displayUserId !== 'board_display' && current.displayUserId !== callerId) {
      return err('Forbidden: Only the board host can post offers', 403);
    }

    await prisma.remoteSession.update({
      where: { id },
      data: {
        epoch,
        offer: typeof offer === 'string' ? offer : JSON.stringify(offer),
        answer: null,
        answerEpoch: null,
      },
    });

    return json({ ok: true });
  }

  // 3. JOIN (iPad pairs using 6-digit code and attaches setId)
  if (op === 'join') {
    const rawCode = String(body.code || '').trim();
    if (!/^\d{6}$/.test(rawCode)) {
      return err('Invalid 6-digit code format');
    }

    const current = await prisma.remoteSession.findFirst({
      where: {
        code: rawCode,
        expiresAt: { gt: new Date() },
      },
    });

    if (!current) {
      return err('Board code not found or expired', 404);
    }

    const updated = await prisma.remoteSession.update({
      where: { id: current.id },
      data: {
        controllerUserId: callerId || 'ipad_controller',
        setId: body.setId != null ? String(body.setId) : current.setId,
      },
    });

    return json({
      id: updated.id,
      epoch: updated.epoch,
      offer: updated.offer,
    });
  }

  // 4. ANSWER (iPad posts WebRTC answer for the active epoch)
  if (op === 'answer') {
    const { id, epoch, answer } = body;
    if (!id || typeof epoch !== 'number' || !answer) {
      return err('Missing id, epoch, or answer');
    }

    const current = await prisma.remoteSession.findUnique({ where: { id } });
    if (!current) return err('Session not found', 404);
    if (new Date() > new Date(current.expiresAt)) return err('Session expired', 410);

    // Caller must be the controller
    if (current.controllerUserId !== 'ipad_controller' && current.controllerUserId !== callerId) {
      return err('Forbidden: Only joined controller can answer', 403);
    }

    // Stale epoch rejection (Rule: reject with 409 if body.epoch != session.epoch)
    if (epoch !== current.epoch) {
      return err('Stale epoch: Reconnecting with newer offer', 409);
    }

    await prisma.remoteSession.update({
      where: { id },
      data: {
        answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
        answerEpoch: epoch,
      },
    });

    return json({ ok: true });
  }

  return err(`Unsupported POST operation: ${op}`);
}
