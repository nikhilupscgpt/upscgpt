import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * PATCH /api/admin/issues/[id]
 * Updates a specific Issue node.
 */
export async function PATCH(req, props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await props.params;
  const id = params?.id;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: 'Valid Issue ID required' }, { status: 400 });
  }

  try {
    const { title, backgroundNote, possibleQuestions, prelimsNote, mainsNote, status, orderIndex, relatedIssueIds, cumulativeSummary, valueAddition, mainsFacts } = body;

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        backgroundNote: backgroundNote !== undefined ? backgroundNote : undefined,
        possibleQuestions: possibleQuestions !== undefined ? possibleQuestions : undefined,
        prelimsNote: prelimsNote !== undefined ? prelimsNote : undefined,
        mainsNote: mainsNote !== undefined ? mainsNote : undefined,
        mainsFacts: mainsFacts !== undefined ? mainsFacts : undefined,
        cumulativeSummary: cumulativeSummary !== undefined ? cumulativeSummary : undefined,
        valueAddition: valueAddition !== undefined ? valueAddition : undefined,
        status: status !== undefined ? status : undefined,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined,
        relatedTo: relatedIssueIds ? { set: relatedIssueIds.map(rid => ({ id: rid })) } : undefined
      },
    });

    return NextResponse.json({
      success: true,
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('[Issue Detail API] PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/issues/[id]
 * Fetches a specific Issue node with counts and details.
 */
export async function GET(req, props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await props.params;
  const id = params?.id;

  if (!id || id === 'undefined') {
    return NextResponse.json({ error: 'Valid Issue ID required' }, { status: 400 });
  }

  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { publishedAt: 'desc' }
        },
        editorials: {
          orderBy: { publishedAt: 'desc' }
        },
        relatedTo: {
          select: { id: true, title: true }
        },
        _count: {
          select: {
            articles: true,
            editorials: true,
            testPacks: true,
            pyqLinks: true,
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error('[Issue Detail API] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
