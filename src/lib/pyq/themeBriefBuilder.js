import analysisData from './prelims-pyq-analysis.json';
import { getStructuredExplanation } from '../pyqExplanationHelper';
import { normalizeKeywordsList } from '../pyqKeywords';

function norm(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(str) {
  const stop = new Set(['of', 'the', 'and', 'in', 'to', 'for', 'on', 'with', 'a', 'an', 'indian', 'india']);
  return norm(str)
    .split(' ')
    .filter((w) => w.length > 2 && !stop.has(w));
}

function tokenOverlapScore(a, b) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 75;
  const ta = tokenize(a);
  const tb = new Set(tokenize(b));
  if (ta.length === 0 || tb.size === 0) return 0;
  let hits = 0;
  for (const w of ta) {
    if (tb.has(w)) hits += 1;
    else {
      for (const bw of tb) {
        if (bw.startsWith(w) || w.startsWith(bw)) {
          hits += 0.7;
          break;
        }
      }
    }
  }
  return Math.round((hits / Math.max(ta.length, tb.size)) * 70);
}

function stripHtml(str) {
  return String(str || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyQuestionPattern(q) {
  const stem = String(q?.stem || '').toLowerCase();
  const optsText = (Array.isArray(q?.options) ? q.options : [])
    .map((o) => String(o?.text || '').toLowerCase())
    .join(' ');

  if (stem.includes('statement-i') || stem.includes('statement i') || optsText.includes('both statement')) {
    return 'statementI_II';
  }
  if (
    stem.includes('how many of the above') ||
    stem.includes('how many pairs') ||
    optsText.includes('only one') && optsText.includes('only two')
  ) {
    return 'howManyOnly';
  }
  if (stem.includes('correctly matched') || stem.includes('match list') || stem.includes('pairs given above')) {
    return 'pairMatching';
  }
  if (
    stem.includes('consider the following statements') ||
    stem.includes('which of the statements given above') ||
    /(?:^|\n)\s*1\.\s+/.test(String(q?.stem || ''))
  ) {
    return 'multiStatement';
  }
  return 'singleMcq';
}

function matchSubjectRecord(subjectName) {
  const subjects = analysisData?.subjects || {};
  const keys = Object.keys(subjects);
  if (!subjectName) return null;

  const n = norm(subjectName);
  // Direct / alias matches
  for (const k of keys) {
    if (norm(k) === n) return { key: k, data: subjects[k] };
  }
  if (n.includes('polity') || n.includes('constitution') || n.includes('governance')) {
    return subjects['Indian Polity'] ? { key: 'Indian Polity', data: subjects['Indian Polity'] } : null;
  }
  if (n.includes('econ')) {
    return subjects['Economy'] ? { key: 'Economy', data: subjects['Economy'] } : null;
  }
  if (n.includes('env') || n.includes('ecol') || n.includes('biodiv')) {
    return subjects['Environment'] ? { key: 'Environment', data: subjects['Environment'] } : null;
  }
  if (n.includes('geog')) {
    return subjects['Geography'] ? { key: 'Geography', data: subjects['Geography'] } : null;
  }
  if (n.includes('sci') || n.includes('tech')) {
    return subjects['Science & Technology'] ? { key: 'Science & Technology', data: subjects['Science & Technology'] } : null;
  }
  if (n.includes('modern')) {
    return subjects['Modern History'] ? { key: 'Modern History', data: subjects['Modern History'] } : null;
  }
  if (n.includes('ancient')) {
    return subjects['Ancient History'] ? { key: 'Ancient History', data: subjects['Ancient History'] } : null;
  }
  if (n.includes('medieval')) {
    return subjects['Medieval History'] ? { key: 'Medieval History', data: subjects['Medieval History'] } : null;
  }
  if (n.includes('art') || n.includes('cultur')) {
    return subjects['Art & Culture'] ? { key: 'Art & Culture', data: subjects['Art & Culture'] } : null;
  }
  if (n.includes('agri')) {
    return subjects['Agriculture'] ? { key: 'Agriculture', data: subjects['Agriculture'] } : null;
  }

  let best = null;
  let bestScore = 0;
  for (const k of keys) {
    const score = tokenOverlapScore(subjectName, k);
    if (score > bestScore) {
      bestScore = score;
      best = { key: k, data: subjects[k] };
    }
  }
  return bestScore >= 30 ? best : null;
}

function matchThemeAndSubTopic(subjectData, topicName) {
  if (!subjectData || !topicName) return { theme: null, subTopic: null };
  const themes = Array.isArray(subjectData.themes) ? subjectData.themes : [];

  // Special common UPSC aliases
  const topicNorm = norm(topicName);
  const aliasCandidates = [topicName];
  if (topicNorm.includes('constituent assembly') || topicNorm.includes('historical background')) {
    aliasCandidates.push('Constitutional Framework & Assembly', 'Salient Features of the Constitution', 'Foundations');
  }

  let bestTheme = null;
  let bestSub = null;
  let bestScore = 0;

  for (const candidate of aliasCandidates) {
    for (const th of themes) {
      const thScore = tokenOverlapScore(candidate, th.themeName);
      if (thScore > bestScore) {
        bestScore = thScore;
        bestTheme = th;
        bestSub = null;
      }
      for (const st of th.subTopics || []) {
        const stScore = tokenOverlapScore(candidate, st.topic);
        if (stScore > bestScore) {
          bestScore = stScore;
          bestTheme = th;
          bestSub = st;
        }
      }
    }
  }

  if (bestScore < 25) return { theme: null, subTopic: null };
  return { theme: bestTheme, subTopic: bestSub };
}

function modeValue(list) {
  const counts = new Map();
  for (const item of list) {
    const v = String(item || '').trim();
    if (!v || v === 'General' || v === 'General Studies') continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  let top = '';
  let topCount = 0;
  for (const [k, c] of counts.entries()) {
    if (c > topCount) {
      top = k;
      topCount = c;
    }
  }
  return { value: top, count: topCount, uniqueCount: counts.size };
}

/**
 * Builds a structured Theme Analysis Brief for Page 1 of the Broadsheet PYQ Presenter.
 * Combines verified 15-year (2011-2025) UPSC Prelims analytics with live stats from the active deck.
 */
export function buildThemeAnalysisBrief(pyqItems = [], { subjectHint = '', topicHint = '' } = {}) {
  const questions = (pyqItems || []).filter((q) => !q.type || q.type === 'pyq');
  if (questions.length === 0) return null;

  const domSubject = modeValue(questions.map((q) => q.srcSubject));
  const domTopic = modeValue(questions.map((q) => q.srcTopic));

  const subjectLabel =
    (subjectHint && subjectHint !== 'ALL' ? subjectHint : '') ||
    domSubject.value ||
    'General Studies';

  const topicLabel =
    (topicHint && topicHint !== 'ALL' ? topicHint : '') ||
    (domTopic.value && (domTopic.uniqueCount === 1 || domTopic.count / questions.length >= 0.5)
      ? domTopic.value
      : '');

  const matchedSub = matchSubjectRecord(subjectLabel);
  const subjectData = matchedSub?.data || null;
  const { theme: matchedTheme, subTopic: matchedSubTopic } = matchThemeAndSubTopic(
    subjectData,
    topicLabel || domTopic.value
  );

  // 1. Live Deck Year Distribution & Pattern Counts
  const deckYearCounts = {};
  const deckYears = [];
  const deckPatternCounts = {
    singleMcq: 0,
    multiStatement: 0,
    howManyOnly: 0,
    statementI_II: 0,
    pairMatching: 0,
  };

  const keywordMap = new Map();
  const deckTraps = [];
  const deckNewsHooks = [];
  const roadmap = [];

  questions.forEach((q, idx) => {
    const yr = parseInt(q.examYear, 10);
    if (!Number.isNaN(yr) && yr >= 2005 && yr <= 2030) {
      deckYears.push(yr);
      deckYearCounts[String(yr)] = (deckYearCounts[String(yr)] || 0) + 1;
    }

    const pat = classifyQuestionPattern(q);
    deckPatternCounts[pat] = (deckPatternCounts[pat] || 0) + 1;

    // Extract keywords, traps, news from structured explanation
    const { analysis } = getStructuredExplanation(q);
    if (Array.isArray(analysis?.keywords)) {
      for (const kw of normalizeKeywordsList(analysis.keywords)) {
        const term = stripHtml(kw.term);
        if (!term) continue;
        const key = term.toLowerCase();
        if (!keywordMap.has(key)) {
          keywordMap.set(key, {
            term,
            shortNote: stripHtml(kw.shortNote || ''),
            count: 1,
          });
        } else {
          keywordMap.get(key).count += 1;
        }
      }
    }

    // Extract examiner traps from valueAddition groups if tagged as Trap
    if (Array.isArray(analysis?.valueAddition)) {
      for (const va of analysis.valueAddition) {
        if (va && typeof va === 'object') {
          const heading = `${va.title || ''} ${va.tag || ''}`.toLowerCase();
          if (heading.includes('trap') || heading.includes('caution') || heading.includes('pitfall')) {
            const firstBullet = Array.isArray(va.bullets) && va.bullets[0]
              ? stripHtml(typeof va.bullets[0] === 'string' ? va.bullets[0] : va.bullets[0]?.text)
              : '';
            const text = firstBullet || stripHtml(va.title);
            if (text && deckTraps.length < 4) deckTraps.push(text);
          }
        }
      }
    }

    if (analysis?.inNews?.headline && deckNewsHooks.length < 3) {
      deckNewsHooks.push({
        headline: stripHtml(analysis.inNews.headline),
        relevance: stripHtml(analysis.inNews.relevance || analysis.inNews.context || ''),
      });
    }

    const cleanStem = stripHtml(q.stem || '').replace(/^Consider the following statements.*?:\s*/i, '');
    roadmap.push({
      index: idx + 1,
      id: q.id,
      year: q.examYear || '',
      questionNo: q.questionNo || '',
      topic: q.srcTopic || topicLabel || subjectLabel,
      preview: cleanStem.length > 96 ? `${cleanStem.slice(0, 93)}...` : cleanStem,
    });
  });

  // 2. Year-by-year chart source: prefer matched 15-year theme counts if available, else deck year counts
  const chartSource = matchedTheme?.yearCounts || subjectData?.yearCounts || null;
  const yearsRange = [];
  for (let y = 2011; y <= 2025; y++) {
    yearsRange.push({
      year: y,
      themeCount: chartSource ? Number(chartSource[String(y)] || 0) : 0,
      deckCount: Number(deckYearCounts[String(y)] || 0),
    });
  }

  // 3. Pattern Breakdown (use matchedTheme if available, else compute percentages from live deck)
  const totalDeck = questions.length;
  const deckPatternPcts = {
    singleMcq: Math.round((deckPatternCounts.singleMcq / totalDeck) * 100),
    multiStatement: Math.round((deckPatternCounts.multiStatement / totalDeck) * 100),
    howManyOnly: Math.round((deckPatternCounts.howManyOnly / totalDeck) * 100),
    statementI_II: Math.round((deckPatternCounts.statementI_II / totalDeck) * 100),
    pairMatching: Math.round((deckPatternCounts.pairMatching / totalDeck) * 100),
  };

  const patternBreakdown = matchedTheme?.patternBreakdown
    ? {
        sourceLabel: `${matchedTheme.themeName} (15-Yr UPSC Trend)`,
        percentages: matchedTheme.patternBreakdown.percentages,
        counts: matchedTheme.patternBreakdown.counts,
        newPatternSharePct: matchedTheme.patternBreakdown.recent2022_2025?.newPatternSharePct ?? null,
        deckCounts: deckPatternCounts,
      }
    : {
        sourceLabel: `Current Session (${totalDeck} PYQs)`,
        percentages: deckPatternPcts,
        counts: deckPatternCounts,
        newPatternSharePct: Math.round(
          ((deckPatternCounts.howManyOnly + deckPatternCounts.statementI_II + deckPatternCounts.pairMatching) /
            totalDeck) *
            100
        ),
        deckCounts: deckPatternCounts,
      };

  // 4. Tested Anchors & Recurring Concepts
  const anchors = [];
  if (Array.isArray(matchedSubTopic?.testedAnchors)) {
    for (const a of matchedSubTopic.testedAnchors) {
      if (a && !anchors.includes(a)) anchors.push(a);
    }
  }
  const topDeckKeywords = Array.from(keywordMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const subjectConcepts = Array.isArray(subjectData?.recurringConcepts)
    ? subjectData.recurringConcepts.slice(0, 5)
    : [];

  // 5. Traps: deck-specific traps first, then subject-level traps
  const combinedTraps = [...deckTraps];
  if (Array.isArray(subjectData?.traps)) {
    for (const t of subjectData.traps) {
      if (combinedTraps.length >= 4) break;
      if (t && !combinedTraps.includes(t)) combinedTraps.push(t);
    }
  }

  // 6. High-Yield Focus / 2026-27 Predictions
  const focusPoints = [];
  if (Array.isArray(subjectData?.predictions2026)) {
    for (const p of subjectData.predictions2026.slice(0, 4)) {
      if (p) focusPoints.push(p);
    }
  }

  // 7. Sibling Sub-Topics in the parent theme (gives great big-picture context)
  const siblingSubTopics = Array.isArray(matchedTheme?.subTopics)
    ? matchedTheme.subTopics.slice(0, 6).map((st) => ({
        topic: st.topic,
        total: st.total,
        priority: st.priority,
        lastAskedYear: st.lastAskedYear,
        isCurrent: matchedSubTopic && st.topic === matchedSubTopic.topic,
      }))
    : [];

  const sortedDeckYears = [...deckYears].sort((a, b) => a - b);
  const deckYearSpan =
    sortedDeckYears.length > 1
      ? `${sortedDeckYears[0]} – ${sortedDeckYears[sortedDeckYears.length - 1]}`
      : sortedDeckYears.length === 1
      ? String(sortedDeckYears[0])
      : 'Multi-Year';

  return {
    subject: subjectLabel,
    topic: topicLabel || matchedTheme?.themeName || 'Complete Section',
    parentThemeName: matchedTheme?.themeName || null,
    matchedSubTopicName: matchedSubTopic?.topic || null,
    priorityBadge:
      matchedSubTopic?.priority ||
      subjectData?.themeRoiRanking?.find((r) => r.themeName === matchedTheme?.themeName)?.roiTier ||
      'High-Yield PYQ Module',
    deckCount: totalDeck,
    deckYearSpan,
    metrics: {
      themeTotal: matchedTheme?.totalQuestions ?? subjectData?.totalQuestions ?? totalDeck,
      themeSharePct: matchedTheme?.shareOfSubjectPct ?? null,
      recent5Yr: matchedTheme?.recent5YrQuestions ?? null,
      yearsActive: matchedTheme?.yearsActiveOutOf15 ?? null,
      lastAskedYear:
        matchedSubTopic?.lastAskedYear ??
        matchedTheme?.lastAskedYear ??
        (sortedDeckYears[sortedDeckYears.length - 1] || null),
      subTopicTotal: matchedSubTopic?.total ?? null,
      subTopicSplit5Yr: matchedSubTopic?.split5Yr || null,
      subjectAvgPerYear: subjectData?.avgPerYear ?? null,
      trendDirection: subjectData?.trendDirection || null,
    },
    overview: subjectData?.overview || '',
    yearsRange,
    hasThemeChart: Boolean(chartSource),
    patternBreakdown,
    anchors,
    topDeckKeywords,
    subjectConcepts,
    traps: combinedTraps,
    focusPoints,
    deckNewsHooks,
    siblingSubTopics,
    roadmap,
  };
}
