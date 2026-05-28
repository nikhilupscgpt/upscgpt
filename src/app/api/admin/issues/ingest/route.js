import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/admin/issues/ingest
 * Ingest an Article or Editorial and link it to an Issue node.
 * 
 * Body: {
 *   issueId: string,         // Required — the Issue node to attach to
 *   type: "ARTICLE" | "EDITORIAL",
 *   title: string,           // Required
 *   url: string,             // Optional but recommended
 *   source: string,          // "The Hindu", "Indian Express", "PIB", etc.
 *   contentType: "NEWS" | "PIB" | "REPORT",   // Only for articles
 *   author: string,          // Only for editorials
 *   rawContent: string,      // Full text (for AI processing later)
 *   publishedAt: string,     // ISO date string
 * }
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      issueId,
      type = 'ARTICLE',
      title,
      url,
      source,
      contentType = 'NEWS',
      examStage,
      importanceScore = 1,
      author,
      rawContent,
      publishedAt,
      newsStreakId,
    } = body;

    // Validation
    if (!issueId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: issueId and title are required.' },
        { status: 400 }
      );
    }

    // Verify the Issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true, title: true, slug: true },
    });

    if (!issue) {
      return NextResponse.json(
        { error: `Issue not found: ${issueId}` },
        { status: 404 }
      );
    }

    let result;
    const publishDate = publishedAt ? new Date(publishedAt) : new Date();
    const parsedImportanceScore = parseInt(importanceScore) || 1;

    if (type === 'EDITORIAL') {
      // --- Ingest Editorial ---
      result = await prisma.editorial.create({
        data: {
          issueId,
          title,
          url: url || null,
          author: author || null,
          source: source || null,
          importanceScore: parsedImportanceScore,
          rawContent: rawContent || null,
          status: rawContent ? 'PENDING' : 'DONE',
          publishedAt: publishDate,
          newsStreakId: newsStreakId || null,
        },
      });

      // Create timeline event
      await prisma.timelineEvent.create({
        data: {
          issueId,
          date: publishDate,
          eventText: `Editorial: "${title}"${author ? ` by ${author}` : ''}${source ? ` (${source})` : ''}`,
          sourceUrl: url || null,
          itemType: 'EDITORIAL',
          refId: null, // Editorial doesn't link to Article FK
        },
      });
    } else {
      // --- Ingest Article ---
      // Check for duplicate URL
      if (url) {
        const existing = await prisma.article.findUnique({ where: { url } });
        if (existing) {
          return NextResponse.json(
            { error: `Article with this URL already exists (ID: ${existing.id})` },
            { status: 409 }
          );
        }
      }

      result = await prisma.article.create({
        data: {
          issueId,
          title,
          url: url || null,
          source: source || null,
          contentType,
          examStage: examStage || null,
          importanceScore: parsedImportanceScore,
          rawContent: rawContent || null,
          status: rawContent ? 'PENDING' : 'DONE',
          addedManually: true,
          publishedAt: publishDate,
          newsStreakId: newsStreakId || null,
        },
      });

      // Create timeline event
      await prisma.timelineEvent.create({
        data: {
          issueId,
          date: publishDate,
          eventText: `${contentType === 'PIB' ? 'PIB Release' : 'News'}: "${title}"${source ? ` (${source})` : ''}`,
          sourceUrl: url || null,
          itemType: 'NEWS',
          refId: result.id,
        },
      });
    }

    // Log the ingestion
    await prisma.actionLog.create({
      data: {
        action: 'MANUAL_INGEST',
        message: `${type}: "${title}" → Issue: "${issue.title}" (${issue.slug})`,
        status: 'SUCCESS',
      },
    });

    // Update Issue lastUpdatedAt
    await prisma.issue.update({
      where: { id: issueId },
      data: { lastUpdatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      type,
      id: result.id,
      linkedTo: issue.title,
      message: `${type === 'EDITORIAL' ? 'Editorial' : 'Article'} ingested successfully and linked to "${issue.title}".`,
    });

  } catch (error) {
    console.error('[Ingest API] Error:', error);

    // Log failure
    try {
      await prisma.actionLog.create({
        data: {
          action: 'MANUAL_INGEST',
          message: `FAILED: ${error.message}`,
          status: 'FAILURE',
        },
      });
    } catch (_) {}

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/issues/ingest
 * Update an existing Article or Editorial.
 */
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      type = 'ARTICLE',
      title,
      url,
      source,
      contentType,
      examStage,
      importanceScore,
      author,
      rawContent,
      publishedAt,
      newsStreakId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const publishDate = publishedAt ? new Date(publishedAt) : undefined;
    const parsedImportanceScore = importanceScore !== undefined ? (parseInt(importanceScore) || 1) : undefined;

    let result;
    if (type === 'EDITORIAL') {
      result = await prisma.editorial.update({
        where: { id },
        data: {
          title,
          url: url !== undefined ? (url || null) : undefined,
          author: author !== undefined ? (author || null) : undefined,
          source: source !== undefined ? (source || null) : undefined,
          importanceScore: parsedImportanceScore,
          rawContent: rawContent !== undefined ? (rawContent || null) : undefined,
          publishedAt: publishDate,
          newsStreakId: newsStreakId !== undefined ? (newsStreakId || null) : undefined,
        },
      });
    } else {
      // Check duplicate URL
      if (url) {
        const existing = await prisma.article.findFirst({
          where: { url, NOT: { id } }
        });
        if (existing) {
          return NextResponse.json(
            { error: `Another article with this URL already exists (ID: ${existing.id})` },
            { status: 409 }
          );
        }
      }

      result = await prisma.article.update({
        where: { id },
        data: {
          title,
          url: url !== undefined ? (url || null) : undefined,
          source: source !== undefined ? (source || null) : undefined,
          contentType: contentType !== undefined ? contentType : undefined,
          examStage: examStage !== undefined ? (examStage || null) : undefined,
          importanceScore: parsedImportanceScore,
          rawContent: rawContent !== undefined ? (rawContent || null) : undefined,
          publishedAt: publishDate,
          newsStreakId: newsStreakId !== undefined ? (newsStreakId || null) : undefined,
        },
      });
    }

    // Log the update
    await prisma.actionLog.create({
      data: {
        action: 'MANUAL_UPDATE',
        message: `${type} Updated: "${title || result.title}" (ID: ${id})`,
        status: 'SUCCESS',
      },
    });

    return NextResponse.json({
      success: true,
      type,
      id: result.id,
      message: `${type === 'EDITORIAL' ? 'Editorial' : 'Article'} updated successfully.`,
    });
  } catch (error) {
    console.error('[Ingest API PUT] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
