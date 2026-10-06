import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateEmbedding } from '@/lib/rag-utils';

import { seedOptionalSyllabus } from '@/lib/optional-seeder';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const optionalId = searchParams.get('optionalId');
  const fetchTree = searchParams.get('tree');

  if (!optionalId) {
    return NextResponse.json({ contents: [], tree: [] });
  }

  try {
    const opt = await prisma.optionalSubject.findUnique({
      where: { id: optionalId }
    });
    if (!opt) return NextResponse.json({ error: 'Optional subject not found' }, { status: 404 });

    if (fetchTree) {
      // Seed optional syllabus tree into database if not seeded yet
      await seedOptionalSyllabus(opt.slug, opt.id);

      // Fetch syllabus tree issues linked to this optional
      const domain = `OPTIONAL_${opt.slug.toUpperCase()}`;
      const tree = await prisma.issue.findMany({
        where: { domain },
        orderBy: { orderIndex: 'asc' }
      });
      return NextResponse.json({ tree });
    }


    const contents = await prisma.subjectContent.findMany({
      where: {
        optionalId,
        isOptional: true,
      },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        language: true,
        exam: true,
        issueId: true,
        createdAt: true,
        issue: {
          select: { title: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Error fetching optional content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action = 'ingest' } = body;

    // --- Action: Create syllabus subnode ---
    if (action === 'create_node') {
      const { title, parentIssueId, optionalId } = body;
      if (!title || !optionalId) {
        return NextResponse.json({ error: 'Missing title or optionalId' }, { status: 400 });
      }

      const opt = await prisma.optionalSubject.findUnique({ where: { id: optionalId } });
      if (!opt) return NextResponse.json({ error: 'Optional Subject not found' }, { status: 404 });

      const domain = `OPTIONAL_${opt.slug.toUpperCase()}`;

      // Slugify title cleanly
      const cleanSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      let finalSlug = `${opt.slug}-${cleanSlug}`;
      let counter = 1;
      while (await prisma.issue.findUnique({ where: { slug: finalSlug } })) {
        counter++;
        finalSlug = `${opt.slug}-${cleanSlug}-${counter}`;
      }

      // Find max orderIndex for ordering
      const maxOrderNode = await prisma.issue.findFirst({
        where: { domain },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });
      const orderIndex = (maxOrderNode?.orderIndex || 0) + 1;

      const node = await prisma.issue.create({
        data: {
          title,
          slug: finalSlug,
          domain,
          topic: opt.name,
          category: 'OPTIONAL',
          parentIssueId: parentIssueId || null,
          orderIndex
        }
      });

      return NextResponse.json({ success: true, node });
    }

    if (action === 'delete_node') {
      const { nodeId, optionalId } = body;
      if (!nodeId || !optionalId) {
        return NextResponse.json({ error: 'Missing nodeId or optionalId' }, { status: 400 });
      }

      // Verify node exists
      const node = await prisma.issue.findUnique({ where: { id: nodeId } });
      if (!node) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }

      async function collectDescendantIds(parentId) {
        const children = await prisma.issue.findMany({ where: { parentIssueId: parentId }, select: { id: true } });
        let ids = children.map(c => c.id);
        for (const child of children) {
          ids = ids.concat(await collectDescendantIds(child.id));
        }
        return ids;
      }

      const descendantIds = await collectDescendantIds(nodeId);
      const allIds = [nodeId, ...descendantIds];

      await prisma.$transaction([
        prisma.subjectContent.updateMany({
          where: { issueId: { in: allIds } },
          data: { issueId: null }
        }),
        prisma.issue.deleteMany({
          where: { id: { in: allIds } }
        })
      ]);

      return NextResponse.json({ success: true, deletedCount: allIds.length });
    }

    if (action === 'reorder_nodes') {
      const { updates } = body;
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json({ error: 'Invalid updates payload' }, { status: 400 });
      }

      await prisma.$transaction(
        updates.map(u => prisma.issue.update({
          where: { id: u.id },
          data: { orderIndex: u.orderIndex }
        }))
      );

      return NextResponse.json({ success: true, updated: updates.length });
    }

    // --- Action: Batch Ingest parsed chunks ---
    if (action === "batch_ingest") {
      const { chunks = [], optionalId } = body;
      if (!optionalId || !Array.isArray(chunks) || chunks.length === 0) {
        return NextResponse.json({ error: "Missing optionalId or empty chunks list" }, { status: 400 });
      }

      const opt = await prisma.optionalSubject.findUnique({ where: { id: optionalId } });
      if (!opt) return NextResponse.json({ error: `Optional Subject not found: ${optionalId}` }, { status: 404 });

      const subjectName = opt.name.toUpperCase();
      const results = [];

      for (const chunk of chunks) {
        if (!chunk.title || !chunk.contentMarkdown) continue;
        try {
          const embedding = await generateEmbedding(chunk.contentMarkdown);
          const vectorStr = `[${embedding.join(",")}]`;

          await prisma.$executeRawUnsafe(`
            INSERT INTO "SubjectContent" (
              id, subject, "examType", "isOptional", "optionalId", 
              title, "contentMarkdown", "sourceUrl", "createdAt", "updatedAt", 
              embedding, language, exam, "issueId"
            )
            VALUES (
              gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector, $9, $10, $11
            )
          `,
            subjectName,
            "MAINS",
            true,
            optionalId,
            chunk.title,
            chunk.contentMarkdown,
            chunk.source || chunk.sourceUrl || "",
            vectorStr,
            chunk.language || "en",
            chunk.exam || "BOTH",
            chunk.issueId || chunk.suggestedNodeId || null
          );
          results.push(chunk.title);
        } catch (itemErr) {
          console.error("Error vectorizing batch chunk:", chunk.title, itemErr);
        }
      }

      return NextResponse.json({ success: true, count: results.length, titles: results });
    }

    // --- Action: Ingest content chunk ---
    const {
      optionalId,
      title,
      contentMarkdown,
      sourceUrl,
      language = 'en',
      exam = 'BOTH',
      issueId // Optional explicit linkage to syllabus node ID
    } = body;

    // Validation
    if (!optionalId || !title || !contentMarkdown) {
      return NextResponse.json(
        { error: 'Missing required fields: optionalId, title, and contentMarkdown are required.' },
        { status: 400 }
      );
    }

    // Verify the Optional Subject exists
    const opt = await prisma.optionalSubject.findUnique({
      where: { id: optionalId }
    });

    if (!opt) {
      return NextResponse.json(
        { error: `Optional Subject not found: ${optionalId}` },
        { status: 404 }
      );
    }

    // Generate pgvector embedding for the note text
    const embedding = await generateEmbedding(contentMarkdown);
    const vectorStr = `[${embedding.join(',')}]`;

    // Save using raw SQL to write vector type correctly in pgvector
    const subjectName = opt.name.toUpperCase();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "SubjectContent" (
        id, subject, "examType", "isOptional", "optionalId", 
        title, "contentMarkdown", "sourceUrl", "createdAt", "updatedAt", 
        embedding, language, exam, "issueId"
      )
      VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector, $9, $10, $11
      )
    `,
      subjectName,
      'MAINS',
      true,
      optionalId,
      title,
      contentMarkdown,
      sourceUrl || '',
      vectorStr,
      language,
      exam,
      issueId || null
    );

    return NextResponse.json({ success: true, title });
  } catch (error) {
    console.error('Error ingesting optional content:', error);
    return NextResponse.json({ error: 'Failed to ingest optional content: ' + error.message }, { status: 500 });
  }
}
