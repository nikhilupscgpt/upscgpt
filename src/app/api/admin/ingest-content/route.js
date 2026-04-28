import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { chunkText, generateEmbedding } from '@/lib/rag-utils';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let title, subject, examType, contentMarkdown, sourceUrl, optionalId, isOptional;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      title = formData.get('title');
      subject = formData.get('subject');
      examType = formData.get('examType') || 'BOTH';
      sourceUrl = formData.get('sourceUrl') || '';
      isOptional = formData.get('isOptional') === 'true';
      const optionalSlug = formData.get('optionalSlug');

      if (optionalSlug) {
        const opt = await prisma.optionalSubject.findUnique({ where: { slug: optionalSlug } });
        optionalId = opt?.id;
      }

      if (file && file.type === 'application/pdf') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        contentMarkdown = result.text;
        await parser.destroy();
      } else if (file) {
        contentMarkdown = await file.text();
      }
    } else {
      const body = await req.json();
      title = body.title;
      subject = body.subject;
      examType = body.examType;
      contentMarkdown = body.contentMarkdown;
      sourceUrl = body.sourceUrl;
      isOptional = body.isOptional;
      optionalId = body.optionalId;
    }

    if (!title || !subject || !contentMarkdown) {
      return NextResponse.json({ error: 'Missing required fields (Title, Subject, Content)' }, { status: 400 });
    }

    const chunks = chunkText(contentMarkdown, 1500);
    let successfulChunks = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await generateEmbedding(chunk);
        const vectorStr = `[${embedding.join(',')}]`;

        await prisma.$executeRawUnsafe(`
          INSERT INTO "SubjectContent" (id, subject, "examType", "isOptional", "optionalId", title, "contentMarkdown", "sourceUrl", "createdAt", "updatedAt", embedding)
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector
          )
        `, 
          subject, 
          examType || 'BOTH', 
          isOptional || false,
          optionalId || null,
          `${title} - Part ${i+1}`, 
          chunk, 
          sourceUrl || '',
          vectorStr
        );
        successfulChunks++;
      } catch (err) {
        console.error(`Failed to process chunk ${i}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ingested ${successfulChunks}/${chunks.length} chunks.`,
      stats: { total: chunks.length, saved: successfulChunks }
    });

  } catch (error) {
    console.error('[AdminIngest] Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
