import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { chunkText, generateEmbedding } from '@/lib/rag-utils';

export async function POST(req) {
  // 1. Verify Authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, subject, examType, contentMarkdown, sourceUrl } = body;

    if (!title || !subject || !contentMarkdown) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Chunk the incoming markdown text
    const chunks = chunkText(contentMarkdown, 1500); // 1500 chars is roughly 300 words
    
    // 3. Process each chunk
    let successfulChunks = 0;
    
    // Process serially or in small batches to avoid rate limits
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        // Generate Embedding
        const embedding = await generateEmbedding(chunk);
        const vectorStr = `[${embedding.join(',')}]`;

        // We use $executeRawUnsafe to insert the Unsupported("vector") type.
        await prisma.$executeRawUnsafe(`
          INSERT INTO "SubjectContent" (id, subject, "examType", title, "contentMarkdown", "sourceUrl", "createdAt", "updatedAt", embedding)
          VALUES (
            gen_random_uuid()::text, 
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            NOW(), 
            NOW(), 
            $6::vector
          )
        `, 
          subject, 
          examType || 'BOTH', 
          `${title} - Part ${i+1}`, 
          chunk, 
          sourceUrl || ''
        );
        
        successfulChunks++;
      } catch (err) {
        console.error(`Failed to process chunk ${i}:`, err);
        // Continue processing other chunks even if one fails
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
