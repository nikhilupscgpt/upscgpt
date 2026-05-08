import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { generateEmbedding } from "../../../lib/rag-utils";

export async function GET(req) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    // RULE 1: Queries under 3 chars return immediately with no DB call
    if (query.length < 3) {
      return NextResponse.json({ nodes: [], pyqs: [], news: [] });
    }

    const cleanQuery = query.replace(/'/g, "''");

    // PRIMARY FAST PATH: PostgreSQL Full-Text Search
    const [nodes, pyqs, news] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, title, slug, "nodeType", domain, "gsPapers", metadata,
               ts_rank("searchVector", plainto_tsquery('english', ${cleanQuery})) as rank
        FROM "Issue"
        WHERE "searchVector" @@ plainto_tsquery('english', ${cleanQuery})
        ORDER BY rank DESC LIMIT 15
      `,
      prisma.$queryRaw`
        SELECT id, "questionText" as question, year, paper,
               ts_rank("searchVector", plainto_tsquery('english', ${cleanQuery})) as rank
        FROM "PreviousYearQuestion"
        WHERE "searchVector" @@ plainto_tsquery('english', ${cleanQuery})
        ORDER BY rank DESC LIMIT 10
      `,
      prisma.article.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        take: 5,
        select: { id: true, title: true, publishedAt: true, source: true }
      })
    ]);

    let finalNodes = nodes || [];
    
    // RULE 2: Embedding is ONLY called when keywordNodes.length === 0 AND query.length >= 6
    if (query.length >= 6 && finalNodes.length === 0) {
      try {
        const embedding = await generateEmbedding(query);
        const vectorStr = `[${embedding.join(",")}]`;

        const semanticNodes = await prisma.$queryRawUnsafe(`
          SELECT id, title, slug, "nodeType", domain, "gsPapers", metadata,
                 (1 - (embedding <=> $1::vector)) as rank
          FROM "Issue"
          WHERE (embedding <=> $1::vector) < 0.6
          ORDER BY rank DESC LIMIT 5
        `, vectorStr);

        // Merge and deduplicate
        const existingIds = new Set(finalNodes.map(n => n.id));
        semanticNodes.forEach(sn => {
          if (!existingIds.has(sn.id)) {
            finalNodes.push({ ...sn, isSemantic: true });
          }
        });
      } catch (embErr) {
        // RULE 3: If embedding fails, return empty immediately (handled by empty semanticNodes or catch)
        console.warn("[Search API] Semantic fallback skipped:", embErr.message);
      }
    }

    // Related PYQs for the top match (Lightweight Keyword Search)
    if (finalNodes.length > 0) {
      const topNode = finalNodes[0];
      const nodeKeywords = [topNode.title, ...(topNode.metadata?.keyThemes || [])].slice(0, 2);
      
      if (nodeKeywords.length > 0) {
        try {
          const relatedPyqs = await prisma.$queryRaw`
            SELECT id, "questionText", year, paper
            FROM "PreviousYearQuestion"
            WHERE "searchVector" @@ plainto_tsquery('english', ${nodeKeywords.join(' ')})
            LIMIT 3
          `;
          topNode.linkedPyqs = relatedPyqs;
        } catch (err) {
          topNode.linkedPyqs = [];
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Search API] Query: "${query}" | Nodes: ${finalNodes.length} | Latency: ${duration}ms`);

    return NextResponse.json({
      nodes: finalNodes,
      pyqs: pyqs || [],
      news: news || [],
      latency: duration
    });

  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json({ error: "Search failed", details: error.message }, { status: 500 });
  }
}
