import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  generateSimilarPyqClusters,
  mergeClusterQuestions,
  rejectCluster,
} from '@/lib/pyq-similar-engine';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Faculty access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || 'ALL';
    const status = searchParams.get('status') || 'unreviewed';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await generateSimilarPyqClusters({
      subject,
      status,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error generating similar PYQ clusters:', error);
    return NextResponse.json(
      { error: 'Failed to generate similar PYQ clusters', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Faculty access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, anchorId, selectedIds, keyTakeaway, theme, clusterId, questionIds, reason } = body;

    if (action === 'merge') {
      if (!Array.isArray(selectedIds) || selectedIds.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 questions must be selected to merge into a similar family' },
          { status: 400 }
        );
      }

      const result = await mergeClusterQuestions({
        anchorId,
        selectedIds,
        keyTakeaway,
        theme,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully linked ${result.count} questions into similar family`,
        ...result,
      });
    }

    if (action === 'reject') {
      const result = await rejectCluster({
        clusterId,
        questionIds,
        reason: reason || 'Not conceptually similar / rejected by curator',
      });

      return NextResponse.json({
        success: true,
        message: 'Cluster dismissed from candidate queue',
        ...result,
      });
    }

    return NextResponse.json(
      { error: `Invalid action '${action}'. Expected 'merge' or 'reject'.` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling similar PYQ cluster action:', error);
    return NextResponse.json(
      { error: 'Failed to process cluster action', details: error.message },
      { status: 500 }
    );
  }
}
