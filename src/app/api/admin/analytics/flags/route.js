import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { invalidateKillSwitchCache, KILL_SWITCH_DEFAULTS } from '@/lib/analytics/marketing';
import { writeAuditLog } from '@/lib/security/guards';

async function ensureDefaultFlags() {
  for (const def of KILL_SWITCH_DEFAULTS) {
    await prisma.featureFlag.upsert({
      where: { key: def.key },
      update: {},
      create: { key: def.key, enabled: false, description: def.description },
    });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureDefaultFlags();
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    return NextResponse.json({ flags });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to load flags' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key, enabled } = await req.json();
    if (!key || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'key and boolean enabled are required' }, { status: 400 });
    }

    const before = await prisma.featureFlag.findUnique({ where: { key } });
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled, updatedBy: session.user.email || session.user.id },
      create: { key, enabled, updatedBy: session.user.email || session.user.id },
    });

    invalidateKillSwitchCache(key);

    await writeAuditLog({
      actorId: session.user.id,
      action: 'KILL_SWITCH_TOGGLED',
      entity: 'FeatureFlag',
      entityId: key,
      before,
      after: flag,
    });

    return NextResponse.json({ flag });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to toggle flag' }, { status: 500 });
  }
}
