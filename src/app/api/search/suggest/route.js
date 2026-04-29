import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/rag-utils";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // 1. Quick Keyword Prefix Match
    const [issues, entries, contents] = await Promise.all([
      prisma.issue.findMany({
        where: { OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { topic: { contains: query, mode: 'insensitive' } }
        ]},
        select: { id: true, title: true, slug: true, category: true },
        take: 5
      }),
      prisma.mapEntry.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { id: true, name: true, category: true },
        take: 3
      }),
      prisma.subjectContent.findMany({
        where: { title: { contains: query, mode: 'insensitive' } },
        select: { id: true, title: true, subject: true },
        take: 3
      })
    ]);

    let suggestions = [
      ...issues.map(i => ({ id: i.id, text: i.title, sub: i.category, type: 'ISSUE', link: `/issues/${i.slug}` })),
      ...entries.map(e => ({ id: e.id, text: e.name, sub: e.category, type: 'ATLAS', link: `/atlas` })),
      ...contents.map(c => ({ id: c.id, text: c.title, sub: c.subject, type: 'STUDY', link: `/subject-portal/${c.subject.toLowerCase()}` }))
    ];

    // 2. If no exact matches, try Semantic Fallback (limit to top 3 for speed)
    if (suggestions.length < 3) {
      try {
        const embedding = await generateEmbedding(query);
        const vectorStr = `[${embedding.join(",")}]`;
        
        const semanticMatches = await prisma.$queryRawUnsafe(`
          SELECT id, title, slug, category, 
                 (1 - (embedding <=> $1::vector)) as score
          FROM "Issue"
          WHERE (1 - (embedding <=> $1::vector)) > 0.65
          ORDER BY score DESC LIMIT 3
        `, vectorStr);

        semanticMatches.forEach(m => {
          if (!suggestions.some(s => s.id === m.id)) {
            suggestions.push({
              id: m.id,
              text: m.title,
              sub: m.category,
              type: 'ISSUE',
              link: `/issues/${m.slug}`,
              isSemantic: true
            });
          }
        });
      } catch (e) {
        console.warn("Semantic suggest failed:", e);
      }
    }

    // Priority to shorter matches (closer to exact prefix)
    const sortedSuggestions = suggestions
      .sort((a, b) => a.text.length - b.text.length)
      .slice(0, 8);

    return NextResponse.json({ suggestions: sortedSuggestions });
  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
