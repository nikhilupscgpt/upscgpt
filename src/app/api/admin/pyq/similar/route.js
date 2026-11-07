import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  findSimilarPyqCandidates,
  attachSimilarPyq,
  detachSimilarPyq,
  searchQuestionsForFamily,
} from '@/lib/pyq-similar-engine';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    const search = searchParams.get('q');
    const subject = searchParams.get('subject') || 'ALL';

    // Search query mode
    if (search) {
      const results = await searchQuestionsForFamily({
        query: search,
        subject,
        excludeId: questionId,
        limit: Number(searchParams.get('limit')) || 10,
      });
      return NextResponse.json({ count: results.length, results });
    }

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId or search query (q) required' },
        { status: 400 }
      );
    }

    const data = await findSimilarPyqCandidates(questionId, {
      limit: Number(searchParams.get('limit')) || 5,
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/admin/pyq/similar] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch similar PYQ data' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, questionId, targetId, keyTakeaway } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    if (action === 'attach') {
      if (!targetId) {
        return NextResponse.json({ error: 'targetId is required for attach' }, { status: 400 });
      }
      const res = await attachSimilarPyq({
        questionId,
        targetId,
        keyTakeaway,
        isVerified: true,
      });
      return NextResponse.json(res);
    }

    if (action === 'detach') {
      const res = await detachSimilarPyq({ questionId, targetId });
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/pyq/similar] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update similar PYQ' },
      { status: 500 }
    );
  }
}
