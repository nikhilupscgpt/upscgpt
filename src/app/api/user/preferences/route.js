import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedOptional } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const currentPreferences = typeof user.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : (user.preferences || {});

    const updatedPreferences = {
      ...currentPreferences,
      selectedOptional
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferences: updatedPreferences }
    });

    return NextResponse.json({ success: true, preferences: updatedPreferences });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const preferences = typeof user.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : (user.preferences || {});

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Failed to fetch preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}
