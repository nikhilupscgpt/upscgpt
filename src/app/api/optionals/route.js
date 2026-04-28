import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Using queryRaw to bypass any stale Prisma client issues
    const optionals = await prisma.$queryRaw`SELECT * FROM "OptionalSubject" ORDER BY name ASC`;
    return NextResponse.json(optionals);
  } catch (error) {
    console.error('Raw SQL fetch failed:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch optionals', 
      details: error.message 
    }, { status: 500 });
  }
}
