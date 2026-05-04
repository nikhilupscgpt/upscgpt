import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const freshPrisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'ID_REQUIRED' }, { status: 400 });

    const data = {};
    
    // 1. Text Fields (Briefings, Notes, Facts, Questions)
    const textFields = [
      'title', 'backgroundNote', 'cumulativeSummary', 'mainsNote', 
      'mainsFacts', 'valueAddition', 'prelimsNote', 'possibleQuestions', 'topic', 'domain'
    ];

    textFields.forEach(base => {
      ['', '_hi', '_mr'].forEach(suffix => {
        const key = `${base}${suffix}`;
        if (body[key] !== undefined) {
          data[key] = body[key] === null ? null : String(body[key]);
        }
      });
    });

    // 2. Structural Fields (Enums and Arrays)
    if (body.status && ['ACTIVE', 'DORMANT', 'ARCHIVED'].includes(body.status)) {
      data.status = body.status;
    }
    
    if (body.gsPapers && Array.isArray(body.gsPapers)) {
      data.gsPapers = body.gsPapers; // Keep as array
    }

    if (body.orderIndex !== undefined) {
      data.orderIndex = parseInt(body.orderIndex) || 0;
    }

    console.log(`[FORGE_FINAL] Committing ${id} with fields:`, Object.keys(data));

    await freshPrisma.issue.update({
      where: { id: String(id) },
      data
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[FORGE_FINAL_ERROR]', error);
    return NextResponse.json({ 
      error: 'PERSISTENCE_REJECTION', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const issue = await freshPrisma.issue.findUnique({
      where: { id: String(id) },
      include: {
        articles: { orderBy: { publishedAt: 'desc' }, take: 5 },
        _count: { select: { articles: true, editorials: true } }
      }
    });
    return NextResponse.json({ success: true, issue });
  } catch (err) {
    return NextResponse.json({ error: 'LOAD_FAILED', details: err.message }, { status: 500 });
  }
}
