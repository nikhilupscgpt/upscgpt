import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomInt } from 'node:crypto';
import { fetchDeckBySetId } from '@/lib/remote/deckHelper';
import { getClientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';

// Who may do what (roles are read from the DB, not trusted from the JWT):
// - create a board session (the classroom screen): DISPLAY, FACULTY, ADMIN
// - join as the controller (the iPad, which picks the deck): FACULTY, ADMIN
const HOST_ROLES = new Set(['DISPLAY', 'FACULTY', 'ADMIN']);
const CONTROLLER_ROLES = new Set(['FACULTY', 'ADMIN']);
const MAX_SETID_CHARS = 4000;

async function getCaller() {
  const session = await getServerSession(authOptions).catch(() => null);
  const id = session?.user?.id || null;
  if (!id) return { id: null, role: null };
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    return { id, role: user?.role || null };
  } catch (e) {
    console.error('[Remote] Role lookup failed:', e?.message);
    return { id, role: null };
  }
}

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
  // Polled every second, so only the session id is needed here (no role lookup).
  const session = await getServerSession(authOptions).catch(() => null);
  const callerId = session?.user?.id || null;
  if (!callerId) {
    return err('Sign in required', 401);
  }

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

  // Sessions are bound to real accounts; legacy anonymous placeholders
  // ('board_display' / 'ipad_controller') no longer grant access.
  const isDisplay = remoteSession.displayUserId === callerId;
  const isController = remoteSession.controllerUserId === callerId;

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

    // The deck (setId) is chosen by the controller, who must be FACULTY/ADMIN
    // (enforced on join), so staff can show any Issue/PYQ deck.
    if (!remoteSession.controllerUserId) {
      return json({ deck: [], setId: null });
    }
    const deck = await fetchDeckBySetId(remoteSession.setId);
    return json({
      deck,
      setId: remoteSession.setId,
    });
  }

  return err('Unsupported GET operation');
}

export async function POST(req) {
  const { id: callerId, role: callerRole } = await getCaller();

  let body;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body');
  }

  const { op } = body || {};

  // 1. CREATE (Board creates a new session with random 6-digit code)
  if (op === 'create') {
    if (!callerId) return err('Sign in with a classroom display or faculty account to start a board session.', 401);
    if (!HOST_ROLES.has(callerRole)) return err('This account cannot host a board session.', 403);

    const now = new Date();
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours TTL

    // Generate unique 6-digit code
    let code = '';
    let attempts = 0;
    while (attempts < 15) {
      code = randomInt(100000, 1000000).toString();
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
        displayUserId: callerId,
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
    if (!callerId || current.displayUserId !== callerId) {
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
    // Brute-force protection for the 6-digit code.
    const rl = await rateLimit({
      bucket: 'remote-join',
      key: `ip:${getClientIp(req)}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rl.allowed) {
      return tooManyRequests(NextResponse, rl.retryAfterSec, 'Too many pairing attempts. Please wait a few minutes and try again.');
    }

    if (!callerId) return err('Sign in with a faculty account to control the board.', 401);
    if (!CONTROLLER_ROLES.has(callerRole)) return err('Only faculty or admin accounts can control a board.', 403);

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
        controllerUserId: callerId,
        setId: body.setId != null ? String(body.setId).slice(0, MAX_SETID_CHARS) : current.setId,
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
    if (!callerId || current.controllerUserId !== callerId) {
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

  return err('Unsupported POST operation');
}
