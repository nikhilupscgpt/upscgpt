import React from 'react';
import { getStructuredExplanation } from './pyqExplanationHelper';
import { normalizeKeywordsList } from './pyqKeywords';
import { parseStem } from '@/app/prelims/pyq/StemView';

/**
 * Renders statement text with inline <mark> keyword highlights:
 * - active: bright yellow background (#facc15), black text
 * - dimmed: muted taupe/dark-yellow background, muted text
 * - context: subtle white pill background
 */
export function renderHighlightedText(text, keywordSpotlight) {
  if (!text || typeof text !== 'string') return text;
  if (!keywordSpotlight) return text;

  const activePhrases = Array.isArray(keywordSpotlight.activePhrases) && keywordSpotlight.activePhrases.length > 0
    ? keywordSpotlight.activePhrases
    : [keywordSpotlight.term || keywordSpotlight.keyword || ''].filter(Boolean);

  const dimmedPhrases = Array.isArray(keywordSpotlight.dimmedPhrases)
    ? keywordSpotlight.dimmedPhrases.filter(Boolean)
    : [];

  const contextPhrases = Array.isArray(keywordSpotlight.contextPhrases)
    ? keywordSpotlight.contextPhrases.filter(Boolean)
    : [];

  const targets = [];
  activePhrases.forEach((p) => targets.push({ phrase: String(p).trim(), type: 'active' }));
  contextPhrases.forEach((p) => targets.push({ phrase: String(p).trim(), type: 'context' }));
  dimmedPhrases.forEach((p) => targets.push({ phrase: String(p).trim(), type: 'dimmed' }));

  const validTargets = targets.filter((t) => t.phrase.length > 0);
  if (validTargets.length === 0) return text;

  // Sort longest phrase first so longer matches take precedence
  validTargets.sort((a, b) => b.phrase.length - a.phrase.length);

  const escapeRegex = (s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = new RegExp(`(${validTargets.map((t) => escapeRegex(t.phrase)).join('|')})`, 'gi');

  const parts = text.split(pattern);
  return parts.map((part, i) => {
    const match = validTargets.find((t) => t.phrase.toLowerCase() === part.toLowerCase());
    if (match) {
      return (
        <mark key={i} className={`pq-reel-kw-mark ${match.type}`}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

function normalizeReelKeywordSpotlights(rawKeywords, statements, topic, stem) {
  const isConstitutionPartXXII = (stem || '').includes('officially called') || (stem || '').includes('stand repealed') || (stem || '').includes('There is no Article');

  if (Array.isArray(rawKeywords) && rawKeywords.length > 0) {
    return rawKeywords.map((k, idx) => {
      const term = k.term || k.keyword || k.concept || 'Key Anchor';
      const calloutTerm = k.calloutTerm || (term.startsWith('“') ? term : `“${term}”`);
      const calloutNote = k.calloutNote || k.note || k.significance || k.explanation || 'Essential exam context';
      const activePhrases = Array.isArray(k.activePhrases) && k.activePhrases.length > 0
        ? k.activePhrases
        : [term].filter(Boolean);
      const dimmedPhrases = Array.isArray(k.dimmedPhrases)
        ? k.dimmedPhrases
        : rawKeywords.slice(0, idx).map(prev => prev.term || prev.keyword).filter(Boolean);
      const contextPhrases = Array.isArray(k.contextPhrases) ? k.contextPhrases : [];

      return {
        term,
        calloutTerm,
        calloutNote,
        activePhrases,
        dimmedPhrases,
        contextPhrases,
        note: calloutNote,
      };
    });
  }

  // Automatic high-yield defaults
  if (isConstitutionPartXXII) {
    return [
      {
        term: 'There is no Article',
        calloutTerm: '“There is no Article”',
        calloutNote: 'An absolute claim. Finding a single Article is enough to prove it wrong.',
        activePhrases: ['There is no Article'],
        dimmedPhrases: [],
        contextPhrases: [],
        note: 'An absolute claim. Finding a single Article is enough to prove it wrong.',
      },
      {
        term: 'stand repealed',
        calloutTerm: '“stand repealed”',
        calloutNote: 'Points to the repeal clause. Which earlier Acts did the Constitution end?',
        activePhrases: ['stand repealed'],
        dimmedPhrases: ['There is no Article'],
        contextPhrases: ['officially called'],
        note: 'Points to the repeal clause. Which earlier Acts did the Constitution end?',
      },
    ];
  }

  // General questions fallback: look for absolute qualifiers or keywords in statements
  const stmtTexts = statements.map(s => s.text).join(' ');
  const absoluteMatches = ['only', 'all', 'neither', 'always', 'never', 'any', 'exclusively'].filter(w =>
    new RegExp(`\\b${w}\\b`, 'i').test(stmtTexts)
  );

  const spotlights = [];
  if (absoluteMatches.length > 0) {
    const firstAbs = absoluteMatches[0];
    spotlights.push({
      term: firstAbs,
      calloutTerm: `“${firstAbs}”`,
      calloutNote: 'Extreme qualifier. UPSC frequently tests extreme words to create distractor traps.',
      activePhrases: [firstAbs],
      dimmedPhrases: [],
      contextPhrases: [],
      note: 'Notice the absolute qualifier in the statement.',
    });
  }

  spotlights.push({
    term: topic || 'Core Anchor',
    calloutTerm: `“${topic || 'Core Anchor'}”`,
    calloutNote: 'Verify the statutory and constitutional provisions governing this concept.',
    activePhrases: [topic || ''].filter(Boolean),
    dimmedPhrases: spotlights.length > 0 ? [spotlights[0].term] : [],
    contextPhrases: [],
    note: 'Central syllabus anchor for this question.',
  });

  return spotlights;
}

function normalizeReelValueAddition(rdVa, topic, stem, analysis) {
  const isConstitutionPartXXII = (stem || '').includes('officially called') || (stem || '').includes('stand repealed') || (stem || '').includes('There is no Article');

  const rawItems = rdVa?.items || rdVa?.trio || null;
  let items = [];

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    items = rawItems.map((item, idx) => ({
      art: item.art || item.num || `0${idx + 1}`,
      title: item.title || item.what || `Key Takeaway ${idx + 1}`,
      desc: item.desc || item.how || item.note || '',
    }));
  } else if (isConstitutionPartXXII) {
    items = [
      {
        art: '394',
        title: 'Came into force early',
        desc: 'Arts. 5–9, 60, 324, 366, 367, 379, 380, 388 and 391–394 came into force on 26 November 1949.',
      },
      {
        art: '394A',
        title: 'Authoritative Hindi text',
        desc: 'Inserted by the 58th Amendment, 1987.',
      },
      {
        art: '395',
        title: 'Not repealed',
        desc: 'The Abolition of Privy Council Jurisdiction Act, 1949 is expressly excluded from the repeal.',
      },
    ];
  } else {
    items = [
      {
        art: '01',
        title: 'Core Rule',
        desc: 'Verify exact constitutional and statutory provisions before choosing an option.',
      },
      {
        art: '02',
        title: 'Examiner Lens',
        desc: 'Watch for negative and absolute qualifiers designed to provoke uncertainty.',
      },
      {
        art: '03',
        title: 'Memory Anchor',
        desc: `Revise key provisions and exceptions under ${topic || 'this theme'} for Prelims.`,
      },
    ];
  }

  const title = rdVa?.title || 'Value addition';
  const subtitle = rdVa?.subtitle || (isConstitutionPartXXII ? 'Add these to your Part XXII notes' : (topic ? `Add these to your ${topic} notes` : 'Add these to your revision notes'));
  const note = rdVa?.note || extractValueAdditionNote(analysis?.valueAddition);

  return {
    title,
    subtitle,
    items,
    trio: items.map(it => ({ art: it.art, what: it.title, how: it.desc })),
    note,
  };
}

/**
 * Deterministic (0ms, 0-cost) rule-based parser that transforms a UPSC PYQ
 * or Custom Question into the 9-step Reels Storyboard format:
 * 1. Hook (curiosity headline)
 * 2. Statements (numbered 1, 2, 3...)
 * 3. Options (A, B, C, D)
 * 4. Pause (5s countdown ring to write answer in comments)
 * 5-7. Verdicts (progressive statement reveal with stamps and auto-collapsing .mini)
 * 8. Answer (highlighting correct option)
 * 9. Takeaway (high-yield 3-row summary card)
 */
function extractValueAdditionNote(va) {
  if (!va) return 'Master core statutory provisions and examiner traps for UPSC Prelims.';
  if (typeof va === 'string') return va.trim().substring(0, 180);
  if (Array.isArray(va) && va.length > 0) {
    const first = va[0];
    if (typeof first === 'string') return first.trim().substring(0, 180);
    if (first && typeof first === 'object') {
      const text =
        first.description ||
        first.title ||
        first.heading ||
        (Array.isArray(first.bullets) && typeof first.bullets[0] === 'string' ? first.bullets[0] : '') ||
        '';
      if (typeof text === 'string' && text.trim()) return text.trim().substring(0, 180);
    }
  }
  return 'Master core statutory provisions and examiner traps for UPSC Prelims.';
}

/**
 * Intelligent parser that extracts lead preamble, individual numbered statements,
 * and closing prompt from raw UPSC stems (including inline "1. ... 2. ..." formats).
 */
export function parseStemForReels(rawStem, analysis) {
  let text = String(rawStem || '').trim();

  // 1. Detach closing question prompt if attached at the end
  const PROMPT_RE = /\s+((?:Which\s+(?:one\s+of\s+the|of\s+the|pairs?|statements?|of\s+these)|How\s+many\s+of\s+the|Select\s+the\s+correct).*)$/i;
  let prompt = 'Which one of the statements given above is/are correct?';
  const pMatch = text.match(PROMPT_RE);
  if (pMatch) {
    prompt = pMatch[1].trim();
    text = text.slice(0, pMatch.index).trim();
  }

  // 2. Pre-normalize statement delimiters (newlines before Statement I / 1. / (1) / etc.)
  text = text.replace(/([.:;]|\b)\s*(Statement[\s-]*(?:I{1,3}|IV|[1-4])\s*[.:])/gi, '$1\n$2');
  text = text.replace(/([.:;]|\s+)\s*(\(?([1-6])\)\.?\s+|\b([1-6])\.\s+)/g, '$1\n$2');

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const STMT_RE = /^(?:Statement[\s-]*(?:I{1,3}|IV|[1-4])|\(?[1-6]\)?)\s*[.:)]\s*(.*)$/i;

  let lead = '';
  const statements = [];

  for (const line of lines) {
    const m = line.match(STMT_RE);
    if (m && m[1]) {
      statements.push({
        num: statements.length + 1,
        text: m[1].trim(),
      });
    } else {
      if (statements.length === 0) {
        lead = lead ? `${lead} ${line}` : line;
      }
    }
  }

  // 3. Fallback: If no statements found from regex, check analysis.statementBreakdown
  if (statements.length === 0 && Array.isArray(analysis?.statementBreakdown) && analysis.statementBreakdown.length > 0) {
    analysis.statementBreakdown.forEach((item, idx) => {
      const stmtText = item.claim || item.statement || item.text || '';
      if (stmtText) {
        statements.push({
          num: item.num || idx + 1,
          text: stmtText,
        });
      }
    });
  }

  // 4. Final fallback if question is a direct short single prompt
  if (statements.length === 0) {
    statements.push({
      num: 1,
      text: text || 'Analyze the given question and choose the correct answer.',
    });
  }

  lead = lead.replace(/\s*[:]\s*$/, '').trim();
  if (lead) {
    lead = lead.endsWith(':') ? lead : `${lead}:`;
  } else {
    lead = 'Consider the following statements:';
  }

  return { lead, statements, prompt };
}

export function buildPyqReelStoryboard(q) {
  if (!q) return null;

  const { explanationText, analysis } = getStructuredExplanation(q);
  const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : 'A';
  const options = Array.isArray(q.options) ? q.options : [];
  const correctOpt = options.find((o) => String(o.label).toUpperCase() === correctLabel);

  // Parse stem cleanly into lead preamble, statements 1/2/3, and prompt
  const { lead: rawLead, statements, prompt: optionsLead } = parseStemForReels(q.stem || '', analysis);

  // If human reelData was ingested or pre-generated, adopt it directly!
  const reelData = analysis?.reelData || null;

  const normalizedKeywords = normalizeReelKeywordSpotlights(
    reelData?.keywords || analysis?.keywords,
    statements,
    q.srcTopic || q.srcSubject,
    q.stem
  );

  const normalizedValueAddition = normalizeReelValueAddition(
    reelData?.valueAddition || reelData?.takeaway,
    q.srcTopic || q.srcSubject,
    q.stem,
    analysis
  );

  if (reelData) {
    const rd = reelData;
    const rdVerdicts = Array.isArray(rd.verdicts) && rd.verdicts.length > 0 ? rd.verdicts : [];

    return {
      examHeader: `${q.examName || 'UPSC CSE'} ${q.examYear || 'Prelims'} / ${q.srcSubject || 'General Studies'}`,
      topic: q.srcTopic || q.srcSubject || 'Core Concept',
      hook: {
        tag: 'UPSC Prelims Question',
        headline: rd.hookHeadline || rd.hook?.headline || `How well do you know ${q.srcTopic || 'this topic'}?`,
        teaser: rd.hookTeaser || rd.hook?.teaser || `Read these statements carefully before picking an option.`,
      },
      statements: {
        lead: rawLead,
        items: Array.isArray(rd.statements) && rd.statements.length > 0 ? rd.statements : statements,
      },
      options: {
        lead: optionsLead,
        items: options.map((o) => ({
          label: String(o.label || '').toUpperCase(),
          text: o.text || '',
        })),
      },
      keywords: normalizedKeywords,
      pause: {
        seconds: 5,
        title: 'Pause & Attempt',
        sub: 'Take 5 seconds. Decide your option before the reveal.',
      },
      analysis: {
        title: 'Statement breakdown',
        verdicts: rdVerdicts.length > 0 ? rdVerdicts : statements.map((s) => ({
          num: s.num,
          claim: s.text,
          isCorrect: true,
          stamp: '✓ Correct',
          mini: `Statement ${s.num}`,
          source: explanationText || 'Verified UPSC standard reference.',
        })),
        answer: {
          label: correctLabel,
          text: rd.answer?.text || (correctOpt ? correctOpt.text : 'Official UPSC verified answer.'),
        },
      },
      valueAddition: normalizedValueAddition,
      takeaway: normalizedValueAddition,
    };
  }

  // Parse statement verdicts from explanation
  const breakdownList = Array.isArray(analysis?.statementBreakdown)
    ? analysis.statementBreakdown
    : Array.isArray(analysis?.optionBreakdown)
    ? analysis.optionBreakdown
    : [];

  const verdicts = statements.map((stmt, idx) => {
    const num = stmt.num || idx + 1;
    // Check if breakdown exists for this statement
    const b = breakdownList.find(
      (item) =>
        item.num === num ||
        (item.label && String(item.label).toLowerCase().includes(String(num)))
    );

    let isCorrect = false;
    let sourceText = '';
    let miniAnchor = '';

    if (b) {
      isCorrect = Boolean(b.isCorrect);
      sourceText = b.text || b.explanation || '';
    } else {
      // Fallback regex search in explanationText
      const regex = new RegExp(`statement\\s*${num}[^.]*?(correct|incorrect|true|false)`, 'i');
      const m = (explanationText || '').match(regex);
      if (m) {
        const word = m[1].toLowerCase();
        isCorrect = word === 'correct' || word === 'true';
      }
      sourceText = explanationText || 'Based on standard reference texts.';
    }

    // Try to extract an article/act/keyword anchor for the .mini tag
    const artMatch = sourceText.match(/\b(Art(?:icle)?\.?\s*\d+[A-Z]?)\b/i);
    const actMatch = sourceText.match(/\b([A-Z][a-zA-Z\s]{3,25}Act(?:,\s*\d{4})?)\b/);
    if (artMatch) {
      miniAnchor = `${artMatch[1]} · Key Provision`;
    } else if (actMatch) {
      miniAnchor = `${actMatch[1]}`;
    } else if (q.srcTopic) {
      miniAnchor = `${q.srcTopic}`;
    } else {
      miniAnchor = `Statement ${num} Verification`;
    }

    return {
      num,
      claim: stmt.text,
      isCorrect,
      stamp: isCorrect ? '✓ Correct' : '✗ Incorrect',
      mini: miniAnchor,
      source: sourceText.length > 280 ? sourceText.substring(0, 280) + '...' : sourceText,
    };
  });

  // Build Human Conversational Hook Headline
  let hookHeadline = '';
  const stem = q.stem || '';
  if (q.srcTopic && q.srcTopic.length < 50) {
    hookHeadline = `How well do you know ${q.srcTopic}?`;
  } else if (stem.includes('?')) {
    const qPart = stem.split('?')[0] + '?';
    hookHeadline = qPart.length < 90 ? qPart : `Can you solve this UPSC Prelims question?`;
  } else {
    hookHeadline = `Can you catch the catch in this UPSC question?`;
  }

  const hookTeaser = statements.length > 1
    ? `${statements.length} statements testing your foundational conceptual clarity.`
    : `Read the statements carefully before picking an option.`;

  // Build Keywords
  const rawKeywords = Array.isArray(analysis?.keywords)
    ? normalizeKeywordsList(analysis.keywords).slice(0, 3)
    : [];

  const keywordsList = rawKeywords.length > 0
    ? rawKeywords.map(k => ({ term: k.keyword, note: k.significance }))
    : [
        { term: q.srcTopic || 'Core Concept', note: 'Central syllabus anchor for this question' },
        { term: 'Phrasing', note: 'Notice the absolute or negative phrasing in the stem' }
      ];

  // Build Takeaway Trio
  const trio = [];
  if (rawKeywords.length >= 3) {
    trio.push({ art: '01', what: rawKeywords[0].keyword || 'Anchor Concept', how: rawKeywords[0].significance || 'Foundational Rule' });
    trio.push({ art: '02', what: rawKeywords[1].keyword || 'Trap Area', how: rawKeywords[1].significance || 'Elimination Anchor' });
    trio.push({ art: '03', what: rawKeywords[2].keyword || 'Core Fact', how: rawKeywords[2].significance || 'Repeated Theme' });
  } else {
    verdicts.slice(0, 3).forEach((v, i) => {
      trio.push({
        art: `0${i + 1}`,
        what: v.mini || `Key Fact ${i + 1}`,
        how: v.isCorrect ? 'True Statement' : 'Watch out for distractor trap',
      });
    });
  }

  while (trio.length < 3) {
    trio.push({
      art: `0${trio.length + 1}`,
      what: q.srcSubject || 'General Studies',
      how: 'UPSC Prelims Core Focus',
    });
  }

  return {
    examHeader: `${q.examName || 'UPSC CSE'} ${q.examYear || 'Prelims'} / ${q.srcSubject || 'General Studies'}`,
    topic: q.srcTopic || q.srcSubject || 'General Studies',
    hook: {
      tag: 'UPSC Prelims Question',
      headline: hookHeadline,
      teaser: hookTeaser,
    },
    statements: {
      lead: rawLead,
      items: statements,
    },
    options: {
      lead: optionsLead,
      items: options.map((o) => ({
        label: String(o.label || '').toUpperCase(),
        text: o.text || '',
      })),
    },
    keywords: normalizedKeywords,
    pause: {
      seconds: 5,
      title: 'Pause & Attempt',
      sub: 'Take 5 seconds. Decide your option before the reveal.',
    },
    analysis: {
      title: 'Statement breakdown',
      verdicts,
      answer: {
        label: correctLabel,
        text: correctOpt ? correctOpt.text : 'Official verified key.',
      },
    },
    valueAddition: normalizedValueAddition,
    takeaway: normalizedValueAddition,
  };
}

/**
 * Builds storyboard for Mapping nodes
 */
export function buildMappingReelStoryboard(item) {
  if (!item) return null;
  const placeName = item.place || item.title || 'Mapping Spotlight';
  const rd = item.riverDetails || {};

  return {
    examHeader: `UPSC Mapping & Geography / ${item.regionScope || 'India'}`,
    topic: placeName,
    hook: {
      tag: 'Mapping Masterclass',
      headline: `Where does the ${placeName} originate and flow?`,
      teaser: `Key tributaries, spatial coordinates, and examiner traps for UPSC Prelims.`,
    },
    statements: {
      lead: `Key geographic and hydrological markers for ${placeName}:`,
      items: [
        { num: 1, text: rd.origin ? `Origin: ${rd.origin}` : item.locationText || 'Major spatial landmark' },
        { num: 2, text: rd.leftTributaries?.length ? `Left Bank Tributaries: ${rd.leftTributaries.join(', ')}` : (item.staticFacts?.[0] || 'Strategic boundary') },
        { num: 3, text: rd.rightTributaries?.length ? `Right Bank Tributaries: ${rd.rightTributaries.join(', ')}` : (item.staticFacts?.[1] || 'Protected area / biosphere') },
      ],
    },
    options: {
      lead: `Which of the geographic statements about ${placeName} is correct?`,
      items: [
        { label: 'A', text: 'Statement 1 and 2 only' },
        { label: 'B', text: 'All three statements' },
        { label: 'C', text: 'Statement 2 and 3 only' },
        { label: 'D', text: 'Statement 1 only' },
      ],
    },
    pause: {
      seconds: 5,
      title: 'Pause and attempt',
      sub: 'Drop your answer in the comments',
    },
    analysis: {
      title: 'Spatial Analysis',
      verdicts: [
        { num: 1, claim: rd.origin ? `Origin: ${rd.origin}` : (item.locationText || 'Location'), isCorrect: true, stamp: '✓ Correct', mini: 'Origin & Source', source: rd.origin || 'Verified source.' },
        { num: 2, claim: rd.leftTributaries?.length ? `Left Bank: ${rd.leftTributaries.join(', ')}` : (item.staticFacts?.[0] || 'Fact 1'), isCorrect: true, stamp: '✓ Correct', mini: 'Left-Bank Drainage', source: rd.leftTributaries?.join(', ') || 'Left bank course.' },
        { num: 3, claim: rd.rightTributaries?.length ? `Right Bank: ${rd.rightTributaries.join(', ')}` : (item.staticFacts?.[1] || 'Fact 2'), isCorrect: true, stamp: '✓ Correct', mini: 'Right-Bank Drainage', source: rd.rightTributaries?.join(', ') || 'Right bank course.' },
      ],
      answer: {
        label: 'B',
        text: `All statements regarding ${placeName} are correct.`,
      },
    },
    takeaway: {
      title: `Spatial Essentials: ${placeName}`,
      trio: [
        { art: 'ORIGIN', what: rd.origin?.split('(')[0]?.trim() || placeName, how: 'Source elevation' },
        { art: 'DRAIN', what: rd.outflow?.split('(')[0]?.trim() || 'Bay of Bengal / Arabian Sea', how: 'Termination basin' },
        { art: 'LENGTH', what: rd.lengthKm ? `${rd.lengthKm} km` : 'Strategic River', how: 'Total basin span' },
      ],
      note: item.newsHook || 'High-probability spatial node for UPSC Prelims map marking.',
    },
  };
}
