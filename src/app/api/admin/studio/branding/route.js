import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const DEFAULT_BRANDING = {
  id: 'default',
  logoLightRef: '/logo-light.png',
  logoDarkRef: '/logo-dark.png',
  showUrl: true,
  opacity: 0.6,
  heightPct: 3.5,
  corner: 'top-right',
  facultyLabel: true,
  facultyLabelSec: 5,
  openingCard: true,
  openingSec: 3,
  closingCard: true,
  closingText: 'Practise all PYQs free at upscgpt.in',
  closingSec: 10,
  facultyMayToggleCards: false,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await prisma.brandingSettings.findUnique({ where: { id: 'default' } });
    return NextResponse.json({ branding: row || DEFAULT_BRANDING });
  } catch (error) {
    console.error('Error loading BrandingSettings:', error);
    return NextResponse.json({ error: 'Failed to load branding' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const opacity = Math.min(1, Math.max(0.15, Number(body?.opacity ?? 0.6)));
    const heightPct = Math.min(8, Math.max(2, Number(body?.heightPct ?? 3.5)));
    const facultyLabelSec = Math.min(15, Math.max(1, parseInt(body?.facultyLabelSec ?? 5, 10) || 5));
    const openingSec = Math.min(10, Math.max(1, parseInt(body?.openingSec ?? 3, 10) || 3));
    const closingSec = Math.min(20, Math.max(3, parseInt(body?.closingSec ?? 10, 10) || 10));

    const data = {
      logoLightRef: typeof body?.logoLightRef === 'string' && body.logoLightRef.trim() ? body.logoLightRef.trim() : '/logo-light.png',
      logoDarkRef: typeof body?.logoDarkRef === 'string' && body.logoDarkRef.trim() ? body.logoDarkRef.trim() : '/logo-dark.png',
      showUrl: body?.showUrl !== false,
      opacity,
      heightPct,
      corner: ['top-right', 'top-left'].includes(body?.corner) ? body.corner : 'top-right',
      facultyLabel: body?.facultyLabel !== false,
      facultyLabelSec,
      openingCard: body?.openingCard !== false,
      openingSec,
      closingCard: body?.closingCard !== false,
      closingText: typeof body?.closingText === 'string' && body.closingText.trim()
        ? body.closingText.trim().slice(0, 140)
        : 'Practise all PYQs free at upscgpt.in',
      closingSec,
      facultyMayToggleCards: Boolean(body?.facultyMayToggleCards),
      updatedById: session.user?.id || session.user?.email || null,
    };

    const branding = await prisma.brandingSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    return NextResponse.json({ branding });
  } catch (error) {
    console.error('Error saving BrandingSettings:', error);
    return NextResponse.json({ error: 'Failed to save branding' }, { status: 500 });
  }
}
