import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '@/lib/prisma';

function getEntityTitle(note) {
  if (note.article) return note.article.title;
  if (note.editorial) return note.editorial.title;
  if (note.issue) return note.issue.title;
  if (note.streak) return note.streak.title;
  return null;
}

function getEntityType(note) {
  if (note.articleId) return 'article';
  if (note.editorialId) return 'editorial';
  if (note.issueId) return 'issue';
  if (note.streakId) return 'streak';
  return null;
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    const where = { userId: session.user.id };

    if (entityType && entityId) {
      if (entityType === 'issue') where.issueId = entityId;
      else if (entityType === 'article') where.articleId = entityId;
      else if (entityType === 'editorial') where.editorialId = entityId;
      else if (entityType === 'streak') where.streakId = entityId;
    }

    const notes = await prisma.userNote.findMany({
      where,
      include: {
        issue: { select: { title: true } },
        article: { select: { title: true } },
        editorial: { select: { title: true } },
        streak: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = notes.map((note) => ({
      id: note.id,
      content: note.content,
      entityType: getEntityType(note),
      entityTitle: getEntityTitle(note),
      subject: note.subject,
      topic: note.topic,
      linkedNodeIds: note.linkedNodeIds,
      isAiGenerated: note.isAiGenerated,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return NextResponse.json({ notes: formatted });
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, entityType, entityId, linkedNodeIds, isAiGenerated } = await req.json();

    if (!content || !entityType || !entityId) {
      return NextResponse.json({ error: 'content, entityType, and entityId are required' }, { status: 400 });
    }

    // Build the foreign key field
    const fkField = {
      issue: 'issueId',
      article: 'articleId',
      editorial: 'editorialId',
      streak: 'streakId',
    }[entityType];

    if (!fkField) {
      return NextResponse.json({ error: 'Invalid entityType. Must be issue, article, editorial, or streak.' }, { status: 400 });
    }

    // Auto-detect subject and topic from the parent entity
    let subject = null;
    let topic = null;

    if (entityType === 'issue') {
      const issue = await prisma.issue.findUnique({ where: { id: entityId }, select: { domain: true, topic: true } });
      if (issue) {
        subject = issue.domain;
        topic = issue.topic;
      }
    } else if (entityType === 'article') {
      const article = await prisma.article.findUnique({
        where: { id: entityId },
        select: { issue: { select: { domain: true, topic: true } } },
      });
      if (article?.issue) {
        subject = article.issue.domain;
        topic = article.issue.topic;
      }
    } else if (entityType === 'editorial') {
      const editorial = await prisma.editorial.findUnique({
        where: { id: entityId },
        select: { issue: { select: { domain: true, topic: true } } },
      });
      if (editorial?.issue) {
        subject = editorial.issue.domain;
        topic = editorial.issue.topic;
      }
    } else if (entityType === 'streak') {
      const streak = await prisma.newsStreak.findUnique({
        where: { id: entityId },
        select: { issues: { select: { domain: true, topic: true }, take: 1 } },
      });
      if (streak?.issues?.length > 0) {
        subject = streak.issues[0].domain;
        topic = streak.issues[0].topic;
      }
    }

    const note = await prisma.userNote.create({
      data: {
        userId: session.user.id,
        content,
        [fkField]: entityId,
        subject,
        topic,
        linkedNodeIds: Array.isArray(linkedNodeIds) ? linkedNodeIds : [],
        isAiGenerated: !!isAiGenerated,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noteId, content, linkedNodeIds, isAiGenerated } = await req.json();

    if (!noteId || !content) {
      return NextResponse.json({ error: 'noteId and content are required' }, { status: 400 });
    }

    // Ensure the note belongs to the user
    const existing = await prisma.userNote.findFirst({
      where: { id: noteId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const dataToUpdate = { content };
    if (Array.isArray(linkedNodeIds)) {
      dataToUpdate.linkedNodeIds = linkedNodeIds;
    }
    if (typeof isAiGenerated === 'boolean') {
      dataToUpdate.isAiGenerated = isAiGenerated;
    }

    const note = await prisma.userNote.update({
      where: { id: noteId },
      data: dataToUpdate,
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json({ error: 'noteId query param is required' }, { status: 400 });
    }

    // Ensure the note belongs to the user
    const existing = await prisma.userNote.findFirst({
      where: { id: noteId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.userNote.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
