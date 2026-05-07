import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { generateEmbedding } from "../../../lib/rag-utils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ nodes: [], pyqs: [] });
    }

    // 1. Keyword Search for Issue Nodes
    let nodes = await prisma.$queryRaw`
      SELECT 
        id, title, slug, "nodeType",
        "gsPapers"[1] as "gsCategory",
        metadata->'keyThemes' as themes,
        ts_rank("searchVector", websearch_to_tsquery('english', ${query})) as rank
      FROM "Issue"
      WHERE "searchVector" @@ websearch_to_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 10
    `;

    // 2. Keyword Search for PYQs
    let pyqs = await prisma.$queryRaw`
      SELECT 
        id, "questionText" as question, year, paper,
        NULL as "issueId",
        ts_rank("searchVector", websearch_to_tsquery('english', ${query})) as rank
      FROM "PreviousYearQuestion"
      WHERE "searchVector" @@ websearch_to_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 10
    `;

    // 3. Semantic Fallback (if keyword results are sparse)
    if ((nodes || []).length < 3) {
      try {
        const embedding = await generateEmbedding(query);
        const vectorStr = `[${embedding.join(",")}]`;

        const semanticNodes = await prisma.$queryRawUnsafe(`
          SELECT 
            id, title, slug, "nodeType",
            "gsPapers"[1] as "gsCategory",
            metadata->'keyThemes' as themes,
            (1 - (embedding <=> $1::vector)) as rank
          FROM "Issue"
          WHERE (embedding <=> $1::vector) < 0.6
          ORDER BY rank DESC
          LIMIT 5
        `, vectorStr);

        // Merge and deduplicate
        const existingIds = new Set(nodes.map(n => n.id));
        semanticNodes.forEach(sn => {
          if (!existingIds.has(sn.id)) {
            nodes.push({ ...sn, isSemantic: true });
          }
        });
      } catch (embErr) {
        console.warn("[Search API] Semantic fallback failed:", embErr.message);
      }
    }

    return NextResponse.json({
      nodes: nodes || [],
      pyqs: pyqs || []
    });

  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json({ error: "Search failed", details: error.message }, { status: 500 });
  }
}
