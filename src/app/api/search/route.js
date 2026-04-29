import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/rag-utils";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Generate Query Embedding for Semantic Search
    const embedding = await generateEmbedding(query);
    const vectorStr = `[${embedding.join(",")}]`;

    // 2. Parallel Hybrid Search
    // We combine keyword relevance (using PostgreSQL ts_rank where possible or ILIKE) with semantic similarity.
    const [issues, contents, pyqs, entries, orgs] = await Promise.all([
      // Issues: Hybrid (Multilingual Keyword + Semantic)
      prisma.$queryRawUnsafe(`
        SELECT id, title, title_hi, title_mr, slug, topic, category, "cumulativeSummary",
               (CASE 
                 WHEN title ILIKE $2 THEN 1.0 
                 WHEN title_hi ILIKE $2 THEN 1.0 
                 WHEN title_mr ILIKE $2 THEN 1.0 
                 ELSE 0.0 END) as keyword_score,
               (1 - (embedding <=> $1::vector)) as semantic_score
        FROM "Issue"
        WHERE title ILIKE $2 OR title_hi ILIKE $2 OR title_mr ILIKE $2 OR topic ILIKE $2 OR "cumulativeSummary" ILIKE $2
        ORDER BY (CASE WHEN title ILIKE $2 THEN 1.0 ELSE 0.0 END) DESC, (1 - (embedding <=> $1::vector)) DESC
        LIMIT 10
      `, vectorStr, `%${query}%`),

      // SubjectContent: Hybrid (Multilingual)
      prisma.$queryRawUnsafe(`
        SELECT id, title, subject, "examType", "contentMarkdown",
               (CASE WHEN title ILIKE $2 THEN 1.0 ELSE 0.0 END) as keyword_score,
               (1 - (embedding <=> $1::vector)) as semantic_score
        FROM "SubjectContent"
        WHERE title ILIKE $2 OR subject ILIKE $2 OR "contentMarkdown" ILIKE $2
        ORDER BY (CASE WHEN title ILIKE $2 THEN 1.0 ELSE 0.0 END) DESC, (1 - (embedding <=> $1::vector)) DESC
        LIMIT 10
      `, vectorStr, `%${query}%`),

      // PYQs: Hybrid
      prisma.$queryRawUnsafe(`
        SELECT id, year, paper, subject, "questionText",
               (CASE WHEN "questionText" ILIKE $2 THEN 1.0 ELSE 0.0 END) as keyword_score,
               (1 - (embedding <=> $1::vector)) as semantic_score
        FROM "PreviousYearQuestion"
        WHERE "questionText" ILIKE $2 OR subject ILIKE $2
        ORDER BY (CASE WHEN "questionText" ILIKE $2 THEN 1.0 ELSE 0.0 END) DESC, (1 - (embedding <=> $1::vector)) DESC
        LIMIT 5
      `, vectorStr, `%${query}%`),

      // Atlas Nodes: Strict Keyword (Multilingual)
      prisma.mapEntry.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { name_hi: { contains: query, mode: 'insensitive' } },
            { name_mr: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),

      // Organizations: Strict Keyword (Multilingual)
      prisma.organization.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { name_hi: { contains: query, mode: 'insensitive' } },
            { name_mr: { contains: query, mode: 'insensitive' } },
            { shortName: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 3
      })
    ]);

    // 3. Helper to extract snippet
    const getSnippet = (text, q) => {
      if (!text) return "";
      const index = text.toLowerCase().indexOf(q.toLowerCase());
      if (index === -1) return text.substring(0, 160) + "...";
      const start = Math.max(0, index - 60);
      const end = Math.min(text.length, index + 100);
      return (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
    };

    // 4. Normalize and Combine
    const normalizedResults = [
      ...issues.map(i => ({
        type: 'ISSUE',
        id: i.id,
        title: i.title,
        subtitle: getSnippet(i.cumulativeSummary || i.topic, query),
        link: `/issues/${i.slug}`,
        score: (i.keyword_score * 2) + i.semantic_score, // Boost keyword matches
        icon: '🗞️'
      })),
      ...contents.map(c => ({
        type: 'CONTENT',
        id: c.id,
        title: c.title,
        subtitle: getSnippet(c.contentMarkdown || c.subject, query),
        link: `/subject-portal/${c.subject.toLowerCase()}`,
        score: (c.keyword_score * 2) + c.semantic_score,
        icon: '📚'
      })),
      ...pyqs.map(p => ({
        type: 'PYQ',
        id: p.id,
        title: `PYQ ${p.year} (${p.paper})`,
        subtitle: getSnippet(p.questionText, query),
        link: `/prelims`,
        score: (p.keyword_score * 1.5) + p.semantic_score,
        icon: '🎯'
      })),
      ...entries.map(e => ({
        type: 'ATLAS',
        id: e.id,
        title: e.name,
        subtitle: `Atlas Node | Category: ${e.category}`,
        link: `/atlas`,
        score: 3.0, // Guaranteed priority for exact Atlas matches
        icon: '🧭'
      })),
      ...orgs.map(o => ({
        type: 'ORG',
        id: o.id,
        title: `${o.name} (${o.shortName})`,
        subtitle: `Organization | ${o.category}`,
        link: `/atlas`,
        score: 2.8,
        icon: '🏢'
      }))
    ];

    // Sort by combined score
    const finalResults = normalizedResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    return NextResponse.json({ results: finalResults });
  } catch (error) {
    console.error("Hybrid Search Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
