import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { generateQuestionSlug } from '@/lib/pyqSlug';

let cachedIntelStore = null;

function getIntelStore() {
  if (cachedIntelStore) return cachedIntelStore;

  const root = process.cwd();
  const dashQsPath = fs.existsSync(path.join(root, 'public/pyq/data/questions.json'))
    ? path.join(root, 'public/pyq/data/questions.json')
    : path.join(root, 'tools/pyq/dashboard_neon/questions.json');
  const dashInsPath = fs.existsSync(path.join(root, 'public/pyq/data/insights.json'))
    ? path.join(root, 'public/pyq/data/insights.json')
    : path.join(root, 'tools/pyq/dashboard_neon/insights.json');
  const neonQsPath = path.join(root, 'tools/pyq/input/neon_pyqs_with_solutions.json');
  const glossaryPath = fs.existsSync(path.join(root, 'public/pyq/data/glossary.json'))
    ? path.join(root, 'public/pyq/data/glossary.json')
    : path.join(root, 'tools/pyq/export_template/glossary.json');

  const dashQs = fs.existsSync(dashQsPath)
    ? JSON.parse(fs.readFileSync(dashQsPath, 'utf8'))
    : [];
  const dashIns = fs.existsSync(dashInsPath)
    ? JSON.parse(fs.readFileSync(dashInsPath, 'utf8'))
    : { subjects: {}, themes: {} };
  const neonQs = fs.existsSync(neonQsPath)
    ? JSON.parse(fs.readFileSync(neonQsPath, 'utf8'))
    : [];
  const glossary = fs.existsSync(glossaryPath)
    ? JSON.parse(fs.readFileSync(glossaryPath, 'utf8'))
    : { translate: {}, themes: {}, subjects: {} };

  const years = Array.from({ length: 16 }, (_, i) => 2011 + i);

  // Map neonQs by id for instant rich solution/analysis lookup
  const neonById = new Map();
  // Also build a rich keyword dictionary from all 451 solved questions
  const keywordMap = new Map();

  for (const nq of neonQs) {
    neonById.set(String(nq.id), nq);
    const an = nq.analysis || {};
    if (Array.isArray(an.keywords)) {
      for (const kw of an.keywords) {
        const term = String(kw.term || kw.name || kw.keyword || '').trim();
        const def = String(kw.concept || kw.shortNote || kw.definition || '').trim();
        if (!term || !def || term.length < 2) continue;
        const norm = term.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
        if (!keywordMap.has(norm)) {
          keywordMap.set(norm, {
            term,
            norm,
            definition: def,
            subject: nq.subject,
            topic: nq.topic,
            valueAddition: Array.isArray(an.valueAddition) ? an.valueAddition : [],
            questionIds: [String(nq.id)],
          });
        } else {
          const entry = keywordMap.get(norm);
          if (!entry.questionIds.includes(String(nq.id))) {
            entry.questionIds.push(String(nq.id));
          }
          if (def.length > entry.definition.length) {
            entry.definition = def;
          }
        }
      }
    }
  }

  // Precompute theme summaries from dashQs
  const byTheme = new Map();
  const bySubjCount = new Map();
  for (const q of dashQs) {
    bySubjCount.set(q.subjectKey, (bySubjCount.get(q.subjectKey) || 0) + 1);
    if (!byTheme.has(q.themeKey)) byTheme.set(q.themeKey, []);
    byTheme.get(q.themeKey).push(q);
  }

  const themeStats = new Map();
  for (const [tKey, list] of byTheme.entries()) {
    const first = list[0];
    const yrsSet = new Set(list.map((q) => q.year));
    const avgEarly =
      Math.round((list.filter((q) => q.year >= 2011 && q.year <= 2015).length / 5) * 10) / 10;
    const avgRecent =
      Math.round((list.filter((q) => q.year >= 2021 && q.year <= 2026).length / 6) * 10) / 10;
    const trend =
      list.length < 4
        ? 'Too few'
        : avgRecent >= avgEarly * 1.5 && avgRecent - avgEarly >= 0.5
        ? 'Rising'
        : avgEarly >= avgRecent * 1.5 && avgEarly - avgRecent >= 0.5
        ? 'Falling'
        : 'Steady';
    const subCounts = {};
    const fmtCounts = {};
    for (const q of list) {
      if (q.sub) subCounts[q.sub] = (subCounts[q.sub] || 0) + 1;
      if (q.format) fmtCounts[q.format] = (fmtCounts[q.format] || 0) + 1;
    }
    const topSubTopics = Object.entries(subCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sub, count]) => ({ sub, count }));

    const yearSparkline = years.map((yr) => ({
      year: yr,
      count: list.filter((q) => q.year === yr).length,
    }));

    themeStats.set(tKey, {
      themeKey: tKey,
      theme: first.theme,
      subjectKey: first.subjectKey,
      subject: first.subject,
      totalCount: list.length,
      shareSubject:
        Math.round((1000 * list.length) / Math.max(1, bySubjCount.get(first.subjectKey))) / 10,
      yearsAsked: yrsSet.size,
      totalPapers: years.length,
      avgEarly,
      avgRecent,
      trend,
      caShare: Math.round((100 * list.filter((q) => q.ca).length) / list.length),
      topSubTopics,
      yearSparkline,
    });
  }

  cachedIntelStore = {
    dashQs,
    dashIns,
    neonQs,
    neonById,
    keywordMap,
    glossary,
    themeStats,
    years,
  };
  return cachedIntelStore;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'about', 'what', 'which', 'how', 'many',
  'questions', 'question', 'pyq', 'pyqs', 'upsc', 'prelims', 'from', 'into',
  'show', 'give', 'tell', 'explain', 'meaning', 'define', 'definition', 'are', 'is', 'in', 'on', 'of', 'to',
]);

function tokenize(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get('q') || '').trim().slice(0, 200);
    if (rawQuery.length < 2) {
      return NextResponse.json({ conceptCard: null, trendAnalysis: null, pyqs: [] });
    }

    const store = getIntelStore();
    const { dashQs, dashIns, neonById, keywordMap, glossary, themeStats, years } = store;

    // 1. Apply Hindi/Marathi/colloquial translation from glossary.json if present
    let normalizedQuery = rawQuery.toLowerCase();
    for (const [k, v] of Object.entries(glossary.translate || {})) {
      const re = new RegExp(`\\b${k}\\b`, 'gi');
      if (re.test(normalizedQuery)) {
        normalizedQuery = normalizedQuery.replace(re, v);
      }
    }

    const tokens = tokenize(normalizedQuery);
    const phrase = tokens.join(' ');

    // 2. Match best Theme (via direct name, glossary.themes aliases, or token overlap)
    let matchedThemeKey = null;
    let bestThemeScore = 0;

    if (/\bmonetary\s+policy\b|\brbi\b|\brepo\s+rate\b/i.test(normalizedQuery) && themeStats.has('economy--banking_rbi')) {
      matchedThemeKey = 'economy--banking_rbi';
      bestThemeScore = 200;
    }

    for (const [tKey, tStat] of themeStats.entries()) {
      const tLower = tStat.theme.toLowerCase();
      if (normalizedQuery === tLower || phrase === tLower) {
        const sc = 150 + tStat.totalCount;
        if (sc > bestThemeScore) {
          bestThemeScore = sc;
          matchedThemeKey = tKey;
        }
      } else if (normalizedQuery.includes(tLower) || (phrase.length >= 4 && tLower.includes(phrase))) {
        const sc = 90 + tStat.totalCount * 0.8;
        if (sc > bestThemeScore) {
          bestThemeScore = sc;
          matchedThemeKey = tKey;
        }
      }
    }

    // Check glossary.themes aliases (only if query doesn't contain a specific article/section number)
    const hasSpecificNumber = /\b\d+\b/.test(normalizedQuery);
    if (!matchedThemeKey && !hasSpecificNumber && glossary.themes) {
      for (const [tKey, terms] of Object.entries(glossary.themes)) {
        if (!Array.isArray(terms)) continue;
        for (const alias of terms) {
          const aLower = String(alias).toLowerCase();
          if (aLower.length >= 3 && (normalizedQuery.includes(aLower) || phrase === aLower)) {
            const tStat = themeStats.get(tKey);
            if (tStat) {
              const sc = 80 + aLower.length * 2;
              if (sc > bestThemeScore) {
                bestThemeScore = sc;
                matchedThemeKey = tKey;
              }
            }
          }
        }
      }
    }

    // 3. Match best Keyword Definition from solved questions (keywordMap)
    let matchedKeyword = null;
    if (keywordMap.has(normalizedQuery) || keywordMap.has(phrase)) {
      matchedKeyword = keywordMap.get(normalizedQuery) || keywordMap.get(phrase);
    } else {
      let bestKwScore = 0;
      const queryNums = normalizedQuery.match(/\d+/g) || [];
      for (const [kNorm, kwEntry] of keywordMap.entries()) {
        // Never fuzzy-match a numbered query like "Article 394" to "Article 39(c)"
        if (queryNums.length > 0 && !queryNums.every((n) => new RegExp(`\\b${n}\\b`).test(kNorm) || kNorm.includes(n))) {
          continue;
        }
        if (kNorm === phrase || normalizedQuery.includes(kNorm)) {
          const sc = 100 + kNorm.length * 3 + kwEntry.questionIds.length * 5;
          if (sc > bestKwScore) {
            bestKwScore = sc;
            matchedKeyword = kwEntry;
          }
        } else if (phrase.length >= 4 && kNorm.includes(phrase)) {
          const sc = 70 + kwEntry.questionIds.length * 4;
          if (sc > bestKwScore) {
            bestKwScore = sc;
            matchedKeyword = kwEntry;
          }
        }
      }
    }

    // 4. Score and rank matching PYQs across all 1,512 questions (including full Detailed Solutions)
    const scoredQs = [];
    for (const dq of dashQs) {
      const nq = neonById.get(String(dq.id));
      const stemLower = String(dq.stem || '').toLowerCase();
      const optsLower = String(dq.options || '').toLowerCase();
      const themeSubLower = `${dq.theme || ''} ${dq.sub || ''} ${dq.subject || ''}`.toLowerCase();
      const expLower = nq?.explanation ? String(nq.explanation).toLowerCase() : '';
      const an = nq?.analysis || null;
      const kwTermsLower = Array.isArray(an?.keywords)
        ? an.keywords.map((k) => `${k.term || ''} ${k.concept || ''} ${k.shortNote || ''}`).join(' ').toLowerCase()
        : '';
      const fullAnalysisLower = an ? JSON.stringify(an).toLowerCase() : '';

      let score = 0;
      let phraseHit = false;
      if (phrase && phrase.length >= 3) {
        if (themeSubLower.includes(phrase)) { score += 45; phraseHit = true; }
        if (stemLower.includes(phrase)) { score += 38; phraseHit = true; }
        if (optsLower.includes(phrase)) { score += 28; phraseHit = true; }
        if (kwTermsLower.includes(phrase)) { score += 25; phraseHit = true; }
        if (expLower.includes(phrase)) { score += 16; phraseHit = true; }
        if (fullAnalysisLower.includes(phrase)) { score += 24; phraseHit = true; }
      }

      let tokenHits = 0;
      for (const tok of tokens) {
        let hit = false;
        const tokRe = /^\d+$/.test(tok) ? new RegExp(`\\b${tok}\\b`) : null;
        const hasTok = (txt) => (tokRe ? tokRe.test(txt) : txt.includes(tok));
        if (hasTok(themeSubLower)) { score += 14; hit = true; }
        if (hasTok(stemLower)) { score += 10; hit = true; }
        if (hasTok(optsLower)) { score += 8; hit = true; }
        if (hasTok(kwTermsLower)) { score += 8; hit = true; }
        if (hasTok(expLower)) { score += 5; hit = true; }
        if (hasTok(fullAnalysisLower)) { score += 6; hit = true; }
        if (hit) tokenHits++;
      }

      const allTokensHit = tokens.length > 0 && tokenHits === tokens.length;
      if (tokens.length > 1 && allTokensHit) {
        score += 25;
      }

      if (score > 0) {
        if (nq?.hasSolution) score += 3;
        scoredQs.push({ dq, nq, score, phraseHit, allTokensHit });
      }
    }

    // If multi-word/numbered query has exact phrase or all-token matches, drop weak partial matches
    const strongMatches = scoredQs.filter((x) => x.phraseHit || x.allTokensHit);
    const finalScoredQs = tokens.length > 1 && strongMatches.length > 0 ? strongMatches : scoredQs;

    finalScoredQs.sort((a, b) => b.score - a.score || b.dq.year - a.dq.year);

    // If no theme was matched yet, infer the dominant theme weighted by match score
    if (!matchedThemeKey && finalScoredQs.length > 0) {
      const topThemeScores = {};
      for (const item of finalScoredQs.slice(0, 10)) {
        const tk = item.dq.themeKey;
        topThemeScores[tk] = (topThemeScores[tk] || 0) + item.score;
      }
      const bestTk = Object.entries(topThemeScores).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (bestTk) matchedThemeKey = bestTk;
    }

    const scoredQsList = finalScoredQs;

    const themeStat = matchedThemeKey ? themeStats.get(matchedThemeKey) : null;
    const themeIns = matchedThemeKey ? dashIns.themes?.[matchedThemeKey] || {} : {};
    const subjIns = themeStat ? dashIns.subjects?.[themeStat.subjectKey] || {} : {};

    // 5. Build Block 1: Concept Card + Definition
    let conceptCard = null;
    if (matchedKeyword || themeStat) {
      const vaBullets = [];
      if (matchedKeyword && Array.isArray(matchedKeyword.valueAddition)) {
        for (const va of matchedKeyword.valueAddition) {
          if (Array.isArray(va?.bullets)) {
            for (const b of va.bullets) {
              if (b && vaBullets.length < 4) vaBullets.push(b);
            }
          }
        }
      }
      if (vaBullets.length === 0 && Array.isArray(themeIns.repeatedConcepts)) {
        vaBullets.push(...themeIns.repeatedConcepts.slice(0, 4));
      }

      const studyPointers = Array.isArray(themeIns.whatToStudy)
        ? themeIns.whatToStudy.slice(0, 3)
        : Array.isArray(subjIns.studyStrategy)
        ? subjIns.studyStrategy.slice(0, 3)
        : [];

      const isExactKwMatch =
        matchedKeyword &&
        (matchedKeyword.norm === normalizedQuery || matchedKeyword.norm === phrase);

      conceptCard = {
        title: isExactKwMatch
          ? matchedKeyword.term
          : themeStat && normalizedQuery.includes(themeStat.theme.toLowerCase())
          ? themeStat.theme
          : matchedKeyword
          ? matchedKeyword.term
          : themeStat
          ? themeStat.theme
          : rawQuery,
        subject: matchedKeyword?.subject || themeStat?.subject || 'General Studies',
        theme: themeStat?.theme || matchedKeyword?.topic || 'Core Concept',
        themeKey: themeStat?.themeKey || null,
        subjectKey: themeStat?.subjectKey || null,
        priority: themeIns.priority || 'High',
        nature: themeIns.nature ? String(themeIns.nature).split(/\s*[—–-]\s*|\.\s/)[0].trim() : 'Conceptual & Factual',
        definition:
          isExactKwMatch
            ? matchedKeyword.definition
            : themeIns.summary ||
              matchedKeyword?.definition ||
              subjIns.overview ||
              `High-yield UPSC Prelims topic tested across ${scoredQsList.length} questions (2011–2026).`,
        keyPoints: vaBullets,
        whatToStudy: studyPointers,
      };
    }

    // 6. Build Block 2: PYQ Trend & Weightage Strip (2011–2026)
    let trendAnalysis = null;
    if (themeStat) {
      trendAnalysis = {
        ...themeStat,
        matchedQueryCount: scoredQsList.length,
        priority: themeIns.priority || 'High',
        priorityReason: themeIns.priorityReason || null,
      };
    } else if (scoredQsList.length > 0) {
      const matchedList = scoredQsList.map((x) => x.dq);
      const yrsSet = new Set(matchedList.map((q) => q.year));
      trendAnalysis = {
        themeKey: null,
        theme: `"${rawQuery}" across UPSC Prelims`,
        subjectKey: matchedList[0].subjectKey,
        subject: matchedList[0].subject,
        totalCount: matchedList.length,
        matchedQueryCount: matchedList.length,
        shareSubject: null,
        yearsAsked: yrsSet.size,
        totalPapers: years.length,
        avgEarly:
          Math.round((matchedList.filter((q) => q.year >= 2011 && q.year <= 2015).length / 5) * 10) / 10,
        avgRecent:
          Math.round((matchedList.filter((q) => q.year >= 2021 && q.year <= 2026).length / 6) * 10) / 10,
        trend: 'Tracked',
        caShare: Math.round((100 * matchedList.filter((q) => q.ca).length) / matchedList.length),
        topSubTopics: [],
        yearSparkline: years.map((yr) => ({
          year: yr,
          count: matchedList.filter((q) => q.year === yr).length,
        })),
      };
    }

    // 7. Build Block 3: Interactive PYQ Cards (formatted for <PyqQuestionCard />)
    const pyqs = scoredQsList.slice(0, 15).map(({ dq, nq }) => {
      const opts =
        Array.isArray(nq?.options) && nq.options.length > 0
          ? nq.options
          : String(dq.options || '')
              .split('\n')
              .filter(Boolean)
              .map((line, idx) => {
                const m = line.match(/^\(([a-d])\)\s*(.*)$/i);
                return {
                  label: m ? m[1].toUpperCase() : String.fromCharCode(65 + idx),
                  text: m ? m[2] : line,
                };
              });

      const correctLabel = String(nq?.correctLabel || dq.answer || 'a').toUpperCase();
      const slug = generateQuestionSlug({
        id: dq.id,
        stem: dq.stem,
        examYear: dq.year,
        srcSubject: dq.subject,
      });

      return {
        id: dq.id,
        slug,
        link: `/prelims/pyq/${slug}`,
        examName: nq?.examName || 'UPSC CSE Pre',
        examYear: dq.year,
        questionNo: nq?.questionNo || null,
        srcSubject: dq.subject,
        srcTopic: `${dq.theme} · ${dq.sub}`,
        difficulty: nq?.difficulty || 'MEDIUM',
        stem: dq.stem,
        options: opts,
        correctLabel,
        explanation: nq?.explanation || `Correct Answer: (${dq.answer}) ${dq.answerText}`,
        analysis: nq?.analysis || null,
        hasSolution: Boolean(nq?.hasSolution),
      };
    });

    return NextResponse.json(
      {
        query: rawQuery,
        conceptCard,
        trendAnalysis,
        pyqs,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/pyq/search-intel] Error:', err);
    return NextResponse.json(
      { conceptCard: null, trendAnalysis: null, pyqs: [], error: err.message },
      { status: 500 }
    );
  }
}
