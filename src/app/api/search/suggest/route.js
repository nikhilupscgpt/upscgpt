import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/rag-utils";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const MAX_QUERY_CHARS = 300;
const MIN_QUERY_CHARS = 3;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().slice(0, MAX_QUERY_CHARS);

  if (query.length < MIN_QUERY_CHARS) {
    return NextResponse.json({ suggestions: [] });
  }

  // Called on keystrokes: cap per IP so it can't be used to burn DB/embedding quota.
  const rl = await rateLimit({
    bucket: "search-suggest",
    key: `ip:${getClientIp(req)}`,
    limit: 300,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return tooManyRequests(NextResponse, rl.retryAfterSec, "Too many suggestion requests. Please slow down and try again shortly.");
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
      ...issues.map(i => ({ id: i.id, text: i.title, sub: i.category, type: 'ISSUE', link: `/node/${i.slug}` })),
      ...entries.map(e => ({ id: e.id, text: e.name, sub: e.category, type: 'ATLAS', link: `/atlas` })),
      ...contents.map(c => ({ id: c.id, text: c.title, sub: c.subject, type: 'STUDY', link: `/subject-portal/${c.subject.toLowerCase()}` }))
    ];

    // 2. If no exact matches, try Semantic Fallback (limit to top 3 for speed)
    // Embeddings share the per-IP budget used by /api/search; when it is spent,
    // suggestions fall back to plain text matches only.
    const embedBudget = suggestions.length < 3
      ? await rateLimit({
          bucket: "search-embed",
          key: `ip:${getClientIp(req)}`,
          limit: 60,
          windowMs: 60 * 60 * 1000,
        })
      : { allowed: false };
    if (suggestions.length < 3 && embedBudget.allowed) {
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
              link: `/node/${m.slug}`,
              isSemantic: true
            });
          }
        });
      } catch (e) {
        console.warn("Semantic suggest failed:", e?.message);
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
