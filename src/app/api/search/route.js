import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { generateEmbedding } from "../../../lib/rag-utils";
import { generateQuestionSlug } from "../../../lib/pyqSlug";
import { extractCoreSubjectEntity, stripBoilerplateFromStem } from "../../../lib/seo";
import { resolveSyllabusNodesForQuestion } from "../../../lib/nodeBridge";

const QUESTION_BOILERPLATE_STOPWORDS = new Set([
  "consider",
  "following",
  "statement",
  "statements",
  "reference",
  "with",
  "which",
  "above",
  "given",
  "correct",
  "incorrect",
  "true",
  "false",
  "select",
  "answer",
  "using",
  "code",
  "below",
  "only",
  "pair",
  "pairs",
  "many",
  "how",
  "regarding",
  "context",
  "respect",
  "about",
  "from",
  "that",
  "this",
  "these",
  "those",
  "have",
  "has",
  "been",
  "were",
  "was",
  "are",
  "the",
  "and",
  "for",
  "into",
  "under",
  "india",
]);

function detectQuestionStyleQuery(rawQuery = "") {
  const q = String(rawQuery || "").trim();
  if (!q) return false;
  const wordCount = q.split(/\s+/).length;
  if (wordCount >= 6) return true;
  if (q.includes("?")) return true;
  return /\b(consider the following|with reference to|which of the|which one of|how many of|statement|statements|in the context of|is\/are correct|select the correct)\b/i.test(
    q
  );
}

function extractSignificantTokens(rawQuery = "") {
  const stripped = stripBoilerplateFromStem(rawQuery) || rawQuery;
  const tokens = String(stripped)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !QUESTION_BOILERPLATE_STOPWORDS.has(w));

  return [...new Set(tokens)].slice(0, 6);
}

async function searchPrelimsQuestionDrafts(rawQuery) {
  const cleanedPhrase = (stripBoilerplateFromStem(rawQuery) || rawQuery)
    .replace(/\s+/g, " ")
    .trim();
  const tokens = extractSignificantTokens(rawQuery);

  const orConditions = [];

  if (cleanedPhrase.length >= 4) {
    orConditions.push({ stem: { contains: cleanedPhrase, mode: "insensitive" } });
    orConditions.push({ srcTopic: { contains: cleanedPhrase, mode: "insensitive" } });
    orConditions.push({ srcSubject: { contains: cleanedPhrase, mode: "insensitive" } });
  }

  // If the user pasted a multi-word question, also match records containing top significant tokens
  if (tokens.length >= 2) {
    const topTokens = tokens.slice(0, 3);
    orConditions.push({
      AND: topTokens.map(t => ({
        stem: { contains: t, mode: "insensitive" },
      })),
    });
  } else if (tokens.length === 1) {
    orConditions.push({ stem: { contains: tokens[0], mode: "insensitive" } });
    orConditions.push({ srcTopic: { contains: tokens[0], mode: "insensitive" } });
  }

  if (orConditions.length === 0) return [];

  const drafts = await prisma.questionDraft.findMany({
    where: { OR: orConditions },
    take: 25,
    orderBy: [{ examYear: "desc" }, { questionNo: "asc" }],
    select: {
      id: true,
      dedupHash: true,
      examName: true,
      examYear: true,
      paper: true,
      questionNo: true,
      srcSubject: true,
      srcTopic: true,
      stem: true,
      options: true,
      correctLabel: true,
      explanation: true,
    },
  });

  const lowerPhrase = cleanedPhrase.toLowerCase();

  // Score and sort candidates by how closely they match the searched question/topic
  const scored = drafts.map(d => {
    const stemLower = String(d.stem || "").toLowerCase();
    const topicLower = String(d.srcTopic || "").toLowerCase();
    const subjectLower = String(d.srcSubject || "").toLowerCase();

    let score = 0;
    let isDirectQuestionMatch = false;

    if (lowerPhrase.length >= 12 && stemLower.includes(lowerPhrase)) {
      score += 120;
      isDirectQuestionMatch = true;
    } else if (lowerPhrase.length >= 4 && stemLower.includes(lowerPhrase)) {
      score += 50;
    }

    if (lowerPhrase.length >= 4 && topicLower.includes(lowerPhrase)) {
      score += 45;
    }

    let matchedTokenCount = 0;
    for (const token of tokens) {
      if (stemLower.includes(token)) {
        score += 18;
        matchedTokenCount++;
      }
      if (topicLower.includes(token)) {
        score += 14;
      }
      if (subjectLower.includes(token)) {
        score += 6;
      }
    }

    if (tokens.length >= 3 && matchedTokenCount >= Math.ceil(tokens.length * 0.75)) {
      score += 40;
      isDirectQuestionMatch = true;
    }

    const slug = generateQuestionSlug(d);
    const syllabusNodes = resolveSyllabusNodesForQuestion(d, 2);

    return {
      id: d.id,
      dedupHash: d.dedupHash,
      slug,
      link: `/prelims/pyq/${slug}`,
      examName: d.examName || "UPSC CSE Prelims",
      examYear: d.examYear || 2024,
      year: d.examYear || 2024,
      paper: d.paper || "GS1",
      questionNo: d.questionNo,
      srcSubject: d.srcSubject || "General Studies",
      srcTopic: d.srcTopic || "General",
      coreEntity: extractCoreSubjectEntity(d),
      stem: d.stem,
      question: d.stem,
      options: d.options,
      correctLabel: d.correctLabel,
      explanation: d.explanation,
      syllabusNodes,
      isDirectQuestionMatch,
      rank: score,
    };
  });

  scored.sort((a, b) => b.rank - a.rank || (b.year || 0) - (a.year || 0));
  return scored.slice(0, 10);
}

export async function GET(req) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    // RULE 1: Queries under 3 chars return immediately with no DB call
    if (query.length < 3) {
      return NextResponse.json({ nodes: [], pyqs: [], news: [], isQuestionQuery: false });
    }

    const isQuestionStyle = detectQuestionStyleQuery(query);
    const cleanedSearchQuery = (stripBoilerplateFromStem(query) || query).trim();

    // PRIMARY FAST PATH: PostgreSQL Full-Text Search + QuestionDraft PYQ Search
    const [nodes, draftPyqs, legacyPyqs, news, streaks, editorials] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, title, slug, "nodeType", domain, "gsPapers", metadata,
               ts_rank("searchVector", plainto_tsquery('english', ${cleanedSearchQuery})) as rank
        FROM "Issue"
        WHERE "searchVector" @@ plainto_tsquery('english', ${cleanedSearchQuery})
        ORDER BY rank DESC LIMIT 15
      `.catch(() => []),
      searchPrelimsQuestionDrafts(query).catch(() => []),
      prisma.$queryRaw`
        SELECT id, "questionText" as question, year, paper,
               ts_rank("searchVector", plainto_tsquery('english', ${cleanedSearchQuery})) as rank
        FROM "PreviousYearQuestion"
        WHERE "searchVector" @@ plainto_tsquery('english', ${cleanedSearchQuery})
        ORDER BY rank DESC LIMIT 5
      `.catch(() => []),
      prisma.article.findMany({
        where: { title: { contains: cleanedSearchQuery, mode: "insensitive" } },
        take: 5,
        select: { id: true, title: true, publishedAt: true, source: true },
      }).catch(() => []),
      prisma.newsStreak.findMany({
        where: { title: { contains: cleanedSearchQuery, mode: "insensitive" } },
        take: 3,
        select: { id: true, title: true, updatedAt: true },
      }).catch(() => []),
      prisma.editorial.findMany({
        where: { title: { contains: cleanedSearchQuery, mode: "insensitive" } },
        take: 3,
        select: { id: true, title: true, publishedAt: true, source: true },
      }).catch(() => []),
    ]);

    let finalNodes = nodes || [];

    // Combine rich Prelims QuestionDrafts with any legacy PYQs (deduplicated)
    const combinedPyqs = [...(draftPyqs || [])];
    const seenStems = new Set(
      combinedPyqs.map(p => String(p.stem || p.question || "").slice(0, 60).toLowerCase())
    );
    for (const lp of legacyPyqs || []) {
      const key = String(lp.question || "").slice(0, 60).toLowerCase();
      if (key && !seenStems.has(key)) {
        seenStems.add(key);
        combinedPyqs.push({
          ...lp,
          stem: lp.question,
          link: `/prelims/pyq`,
        });
      }
    }

    // RULE 2: Embedding is ONLY called when keywordNodes.length === 0 AND query.length >= 6
    if (query.length >= 6 && finalNodes.length === 0) {
      try {
        const embedding = await generateEmbedding(cleanedSearchQuery);
        const vectorStr = `[${embedding.join(",")}]`;

        const semanticNodes = await prisma.$queryRawUnsafe(
          `
          SELECT id, title, slug, "nodeType", domain, "gsPapers", metadata,
                 (1 - (embedding <=> $1::vector)) as rank
          FROM "Issue"
          WHERE (embedding <=> $1::vector) < 0.6
          ORDER BY rank DESC LIMIT 5
        `,
          vectorStr
        );

        const existingIds = new Set(finalNodes.map(n => n.id));
        semanticNodes.forEach(sn => {
          if (!existingIds.has(sn.id)) {
            finalNodes.push({ ...sn, isSemantic: true });
          }
        });
      } catch (embErr) {
        console.warn("[Search API] Semantic fallback skipped:", embErr.message);
      }
    }

    // Attach linked PYQs to the top syllabus node
    if (finalNodes.length > 0) {
      const topNode = finalNodes[0];
      if (combinedPyqs.length > 0) {
        topNode.linkedPyqs = combinedPyqs.slice(0, 3).map(p => ({
          id: p.id,
          slug: p.slug,
          link: p.link,
          year: p.examYear || p.year,
          paper: p.paper || "GS1",
          questionText: p.stem || p.question,
        }));
      } else {
        topNode.linkedPyqs = [];
      }
    }

    const hasDirectPyqMatch = combinedPyqs.some(p => p.isDirectQuestionMatch);
    const isQuestionQuery = Boolean(
      (isQuestionStyle && combinedPyqs.length > 0) || hasDirectPyqMatch
    );

    const duration = Date.now() - startTime;
    console.log(
      `[Search API] Query: "${query}" | Nodes: ${finalNodes.length} | PYQs: ${combinedPyqs.length} | QuestionMode: ${isQuestionQuery} | Latency: ${duration}ms`
    );

    return NextResponse.json({
      nodes: finalNodes,
      pyqs: combinedPyqs,
      news: news || [],
      streaks: streaks || [],
      editorials: editorials || [],
      isQuestionQuery,
      latency: duration,
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
