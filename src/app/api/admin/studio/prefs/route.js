import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

function getFacultyId(session) {
  return session?.user?.id || session?.user?.email || null;
}

function isAuthorized(session) {
  return Boolean(session && (session.user?.role === 'ADMIN' || session.user?.role === 'FACULTY'));
}

const DEFAULT_PREFS = {
  defaultTool: 'select',
  rememberLastTool: false,
  recordTheme: 'light',
  countdown: true,
  pauseCue: true,
  toolbarPosition: 'bottom',
  webcamCorner: 'bottom-right',
  webcamSize: 'm',
  webcamShape: 'circle',
  fontScale: 1,
  toolSettings: null,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const facultyId = getFacultyId(session);
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty identity' }, { status: 400 });
    }

    const prefs = await prisma.presenterPrefs.findUnique({ where: { facultyId } });
    const toolSettingsObj =
      prefs?.toolSettings && typeof prefs.toolSettings === 'object' ? prefs.toolSettings : null;
    return NextResponse.json({
      prefs: prefs
        ? {
            ...prefs,
            webcamShape: ['circle', 'rect'].includes(toolSettingsObj?.webcamShape)
              ? toolSettingsObj.webcamShape
              : 'circle',
          }
        : { facultyId, ...DEFAULT_PREFS },
      facultyName: session?.user?.name || 'Faculty',
    });
  } catch (error) {
    console.error('Error loading PresenterPrefs:', error);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const facultyId = getFacultyId(session);
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty identity' }, { status: 400 });
    }

    const body = await req.json();
    const webcamShape = ['circle', 'rect'].includes(body?.webcamShape) ? body.webcamShape : 'circle';
    const nextToolSettings =
      body?.toolSettings && typeof body.toolSettings === 'object'
        ? { ...body.toolSettings, webcamShape }
        : { webcamShape };
    const data = {
      defaultTool: typeof body?.defaultTool === 'string' ? body.defaultTool : 'select',
      rememberLastTool: Boolean(body?.rememberLastTool),
      recordTheme: body?.recordTheme === 'dark' ? 'dark' : 'light',
      countdown: body?.countdown !== false,
      pauseCue: body?.pauseCue !== false,
      toolbarPosition: ['bottom', 'left', 'right'].includes(body?.toolbarPosition) ? body.toolbarPosition : 'bottom',
      webcamCorner: ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(body?.webcamCorner)
        ? body.webcamCorner
        : 'bottom-right',
      webcamSize: ['s', 'm', 'l'].includes(body?.webcamSize) ? body.webcamSize : 'm',
      fontScale: [1, 1.12, 1.24].includes(Number(body?.fontScale)) ? Number(body.fontScale) : 1,
      toolSettings: nextToolSettings,
    };

    const prefs = await prisma.presenterPrefs.upsert({
      where: { facultyId },
      update: data,
      create: { facultyId, ...data },
    });
    return NextResponse.json({ prefs: { ...prefs, webcamShape } });

    return NextResponse.json({ prefs });
  } catch (error) {
    console.error('Error saving PresenterPrefs:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
