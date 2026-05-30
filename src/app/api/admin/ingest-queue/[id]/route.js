import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { POST as processNews } from '../../news-engine/process/route';

/**
 * PATCH /api/admin/ingest-queue/[id]
 * Approves or Rejects a pending article/editorial.
 * Body: { action: 'APPROVE' | 'REJECT', type: 'ARTICLE' | 'EDITORIAL' }
 */
export async function PATCH(req, props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await props.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { action, type, issueId, title, contentType, seoTitle, seoDescription, seoKeywords } = body;

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updateData = {};
    if (issueId) updateData.issueId = issueId;
    if (title) updateData.title = title;
    if (contentType && type === 'ARTICLE') updateData.contentType = contentType;

    if (seoTitle || seoDescription || seoKeywords) {
      const table = type === 'ARTICLE' ? prisma.article : prisma.editorial;
      const record = await table.findUnique({
        where: { id },
        select: { structuredData: true }
      });
      const existingData = record?.structuredData || {};
      updateData.structuredData = {
        ...existingData,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined
      };
    }

    if (type === 'ARTICLE') {
      if (action === 'APPROVE') {
        // Set to PENDING first, so the news-engine processor can find it
        await prisma.article.update({ 
          where: { id }, 
          data: { ...updateData, status: 'PENDING' } 
        });
        
        // Trigger AI processing in-line synchronously
        try {
          const mockReq = new Request('http://localhost/api/admin/news-engine/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'cookie': req.headers.get('cookie') || '',
            },
            body: JSON.stringify({ articleId: id })
          });
          await processNews(mockReq);
        } catch (err) {
          console.error('[Ingest Queue Approval] AI Processing Failed:', err);
          // Update status to DONE as fallback so it does not get stuck in PENDING
          await prisma.article.update({ where: { id }, data: { status: 'DONE' } });
        }
      } else {
        await prisma.article.delete({ where: { id } });
      }
    } else if (type === 'EDITORIAL') {
      if (action === 'APPROVE') {
        await prisma.editorial.update({ 
          where: { id }, 
          data: { ...updateData, status: 'PENDING' } 
        });
        
        // Trigger AI processing in-line synchronously
        try {
          const mockReq = new Request('http://localhost/api/admin/news-engine/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'cookie': req.headers.get('cookie') || '',
            },
            body: JSON.stringify({ editorialId: id })
          });
          await processNews(mockReq);
        } catch (err) {
          console.error('[Ingest Queue Approval] AI Processing Failed:', err);
          await prisma.editorial.update({ where: { id }, data: { status: 'DONE' } });
        }
      } else {
        await prisma.editorial.delete({ where: { id } });
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // We might also want to delete the TimelineEvent if rejected, but Prisma Cascade handles it if it's a FK.
    // Wait, TimelineEvent for Editorial doesn't have an FK constraint to Editorial (refId is just a string, no relation).
    // Let's manually delete TimelineEvent if REJECT to be safe.
    if (action === 'REJECT') {
      await prisma.timelineEvent.deleteMany({
        where: {
          OR: [
            { refId: id },
            // Fallback for Editorials without FK
            { itemType: 'EDITORIAL', eventText: { contains: id } } // Weak fallback, but usually safe if refId was null
          ]
        }
      });
    }

    return NextResponse.json({ success: true, message: `Item ${action.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('[Ingest Queue PATCH API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
