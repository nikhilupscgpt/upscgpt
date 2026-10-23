import { getStructuredExplanation } from './pyqExplanationHelper';
import { normalizeKeywordsList } from './pyqKeywords';

/**
 * Builds structured presentation slide steps for a given PYQ.
 * The left panel holds the pinned question; the right panel moves
 * through these steps progressively.
 */
export function buildQuestionSteps(q) {
  if (!q) return [];
  const { explanationText, analysis } = getStructuredExplanation(q);
  const steps = [];

  const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;
  const options = Array.isArray(q.options) ? q.options : [];
  const correctOpt = options.find(o => String(o.label).toUpperCase() === correctLabel);

  // Collect statement / option verdicts if available
  const verdicts = {};
  if (analysis?.optionBreakdown && Array.isArray(analysis.optionBreakdown)) {
    for (const ob of analysis.optionBreakdown) {
      if (ob.label) {
        verdicts[String(ob.label).toUpperCase()] = ob.verdict || '';
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 0: Question Spotlight & Initial Read
  // -------------------------------------------------------------
  steps.push({
    id: 'intro',
    type: 'intro',
    badge: 'STAGE 1 · QUESTION SPOTLIGHT',
    title: 'Question Stem & Statements Framing',
    subtitle: `${q.examName || 'UPSC CSE Pre'} ${q.examYear || ''} · ${q.srcSubject || 'General Studies'} · ${q.srcTopic || 'General'}`,
    showAnswer: false,
    highlightedOption: null,
    verdicts: {},
  });

  // -------------------------------------------------------------
  // STEP 1+: Elimination Breakdown (Statement by statement)
  // -------------------------------------------------------------
  if (analysis?.optionBreakdown && Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0) {
    const chunkSize = 3;
    const totalParts = Math.ceil(analysis.optionBreakdown.length / chunkSize);

    for (let i = 0; i < analysis.optionBreakdown.length; i += chunkSize) {
      const chunk = analysis.optionBreakdown.slice(i, i + chunkSize);
      const partNum = Math.floor(i / chunkSize) + 1;

      // Active verdicts visible up to this chunk
      const activeChunkVerdicts = {};
      const itemsSoFar = analysis.optionBreakdown.slice(0, i + chunkSize);
      for (const item of itemsSoFar) {
        if (item.label) {
          activeChunkVerdicts[String(item.label).toUpperCase()] = item.verdict || '';
        }
      }

      steps.push({
        id: `breakdown_${partNum}`,
        type: 'breakdown',
        badge: totalParts > 1 ? `STAGE 2 · ELIMINATION BREAKDOWN (${partNum}/${totalParts})` : 'STAGE 2 · ELIMINATION BREAKDOWN',
        title: 'Option & Statement Elimination Analysis',
        subtitle: 'Evaluate validity, historical/constitutional accuracy, and distractor traps',
        items: chunk,
        showAnswer: false,
        highlightedOption: null,
        verdicts: activeChunkVerdicts,
      });
    }
  }

  // -------------------------------------------------------------
  // STEP 2: Official Answer & Logic Summary
  // -------------------------------------------------------------
  steps.push({
    id: 'answer',
    type: 'answer',
    badge: 'STAGE 3 · VERIFIED ANSWER & CORE LOGIC',
    title: correctLabel ? `Official Answer: Option (${correctLabel})` : 'Verified Answer & Key Takeaway',
    subtitle: correctOpt ? correctOpt.text : 'Verified official UPSC answer key logic',
    correctLabel,
    explanationText: explanationText || (correctOpt ? correctOpt.text : 'Official UPSC answer verified against official key.'),
    showAnswer: true,
    highlightedOption: correctLabel,
    verdicts,
  });

  // -------------------------------------------------------------
  // STEP 3+: Keywords & Core Concepts (Chunked to fit 1080p)
  // -------------------------------------------------------------
  if (analysis?.keywords && Array.isArray(analysis.keywords) && analysis.keywords.length > 0) {
    const normalized = normalizeKeywordsList(analysis.keywords);
    if (normalized.length > 0) {
      const chunkSize = 3;
      const totalParts = Math.ceil(normalized.length / chunkSize);

      for (let i = 0; i < normalized.length; i += chunkSize) {
        const chunk = normalized.slice(i, i + chunkSize);
        const partNum = Math.floor(i / chunkSize) + 1;

        steps.push({
          id: `keywords_${partNum}`,
          type: 'keywords',
          badge: totalParts > 1 ? `STAGE 4 · CORE CONCEPTS & TERMINOLOGY (${partNum}/${totalParts})` : 'STAGE 4 · CORE CONCEPTS & TERMINOLOGY',
          title: 'High-Yield Prelims Concept Cards',
          subtitle: 'Definitions, constitutional articles, doctrines, and syllabus linkages',
          keywords: chunk,
          showAnswer: true,
          highlightedOption: correctLabel,
          verdicts,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 4+: High-Yield Value Addition (Chunked to fit 1080p)
  // -------------------------------------------------------------
  if (analysis?.valueAddition) {
    let points = [];
    if (typeof analysis.valueAddition === 'string') {
      const rawLines = analysis.valueAddition.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of rawLines) {
        if (line.includes(' • ')) {
          const parts = line.split(/\s*•\s*/).filter(Boolean);
          for (const p of parts) {
            const cleaned = p.replace(/^[•*\-\s]+/, '').trim();
            if (cleaned) points.push(cleaned);
          }
        } else {
          const cleaned = line.replace(/^[•*\-\s]+/, '').trim();
          if (cleaned) points.push(cleaned);
        }
      }
    } else if (Array.isArray(analysis.valueAddition)) {
      points = analysis.valueAddition.map(item => {
        if (typeof item === 'string') return item;
        return item.title ? `${item.title}: ${item.description || ''}` : JSON.stringify(item);
      });
    }

    if (points.length > 0) {
      const chunkSize = 3;
      const totalParts = Math.ceil(points.length / chunkSize);

      for (let i = 0; i < points.length; i += chunkSize) {
        const chunk = points.slice(i, i + chunkSize);
        const partNum = Math.floor(i / chunkSize) + 1;

        steps.push({
          id: `valueAddition_${partNum}`,
          type: 'valueAddition',
          badge: totalParts > 1 ? `STAGE 5 · HIGH-YIELD VALUE ADDITION (${partNum}/${totalParts})` : 'STAGE 5 · HIGH-YIELD VALUE ADDITION',
          title: 'Exhaustive Value Addition & Facts',
          subtitle: 'Crucial dimensions, landmark judgments, constitutional provisions, and facts',
          points: chunk,
          showAnswer: true,
          highlightedOption: correctLabel,
          verdicts,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // STEP 5: Current Affairs & In News Connection
  // -------------------------------------------------------------
  if (analysis?.inNews && (analysis.inNews.headline || analysis.inNews.source || typeof analysis.inNews === 'string')) {
    steps.push({
      id: 'inNews',
      type: 'inNews',
      badge: 'STAGE 6 · CONTEMPORARY / CURRENT AFFAIRS LINKAGE',
      title: 'Current Affairs & News Context',
      subtitle: 'Why UPSC chose this theme in this exam year',
      inNews: analysis.inNews,
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  // -------------------------------------------------------------
  // STEP 6: Interlinked Similar PYQ & Family
  // -------------------------------------------------------------
  if (analysis?.similarPyq && (analysis.similarPyq.stem || typeof analysis.similarPyq === 'string')) {
    steps.push({
      id: 'similarPyq',
      type: 'similarPyq',
      badge: 'STAGE 7 · RECURRING THEME & PYQ FAMILY',
      title: 'Interlinked Previous Year Question',
      subtitle: 'How UPSC tests this recurring theme across multiple examination years',
      similarPyq: analysis.similarPyq,
      showAnswer: true,
      highlightedOption: correctLabel,
      verdicts,
    });
  }

  return steps;
}
