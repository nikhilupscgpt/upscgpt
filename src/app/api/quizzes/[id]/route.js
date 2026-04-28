import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    const testPack = await prisma.testPack.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            difficulty: true,
            gsPaper: true,
          }
        }
      }
    });

    if (!testPack) {
      return NextResponse.json({ error: 'Test pack not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      testPack
    });
  } catch (error) {
    console.error(`[Quiz Detail API] Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch quiz details' }, { status: 500 });
  }
}
