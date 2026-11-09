/**
 * Helper to parse and extract structured analysis from question explanation.
 * Gracefully handles raw JSON strings pasted by admins/curators so the frontend
 * always renders rich Lecture-Grade Deep-Dives instead of raw JSON code.
 */
export function getStructuredExplanation(q) {
  if (!q) return { explanationText: null, analysis: null };

  let explanationText = q.explanation || null;
  let analysis = q.analysis || null;

  if (typeof explanationText === 'string') {
    const trimmed = explanationText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.analysis && typeof parsed.analysis === 'object') {
          analysis = parsed.analysis;
        } else if (parsed.keywords || parsed.optionBreakdown || parsed.valueAddition) {
          analysis = parsed;
        }

        if (typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
          explanationText = parsed.explanation.trim();
        } else {
          // Clear explanationText so raw JSON string is never printed as text
          explanationText = null;
        }
      } catch (e) {
        // Keep raw text if not valid JSON
      }
    }
  }

  // Synthesize substantive explanation text from structured analysis if explanationText is empty
  if (!explanationText && analysis) {
    if (typeof analysis.whyCorrect === 'string' && analysis.whyCorrect.trim()) {
      explanationText = analysis.whyCorrect.trim();
    } else if (Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0) {
      const correctLbl = (q.correctLabel || '').toLowerCase();
      const match = analysis.optionBreakdown.find(o => (o.label || '').toLowerCase() === correctLbl);
      if (match && typeof match.explanation === 'string' && match.explanation.trim()) {
        explanationText = match.explanation.trim();
      } else {
        const firstWithExp = analysis.optionBreakdown.find(o => o.explanation && o.explanation.trim());
        if (firstWithExp) explanationText = firstWithExp.explanation.trim();
      }
    } else if (Array.isArray(analysis.statementBreakdown) && analysis.statementBreakdown.length > 0) {
      const parts = analysis.statementBreakdown
        .map(s => s.explanation || s.text)
        .filter(Boolean)
        .slice(0, 3);
      if (parts.length > 0) explanationText = parts.join(' ');
    } else if (Array.isArray(analysis.keywords) && analysis.keywords.length > 0) {
      const kw = analysis.keywords.find(k => k.concept || k.shortNote);
      if (kw) explanationText = (kw.concept || kw.shortNote || '').trim();
    }
  }

  return { explanationText, analysis };
}

/**
 * Format pure question text + options for fast 1-click clipboard copy
 * so teachers can directly paste into Gemini or AI without manual cleanup.
 */
export function formatQuestionForCopy(q) {
  if (!q) return '';

  const examName = q.examName || 'UPSC CSE Pre';
  const examYear = q.examYear || '';
  const qNo = q.questionNo ? `Q#${q.questionNo}` : '';
  const subject = q.srcSubject || '';
  const topic = q.srcTopic || '';

  const metaParts = [];
  if (examName || examYear) {
    metaParts.push([examName, examYear].filter(Boolean).join(' '));
  }
  if (qNo) metaParts.push(qNo);
  if (subject || topic) {
    metaParts.push([subject, topic].filter(Boolean).join(' › '));
  }
  const header = metaParts.join(' · ');

  const stem = (q.stem || '').trim();

  let optionsText = '';
  if (Array.isArray(q.options) && q.options.length > 0) {
    const lines = q.options.map((opt, idx) => {
      const label = (typeof opt === 'object' && opt !== null && opt.label)
        ? String(opt.label).toLowerCase()
        : String.fromCharCode(97 + idx);
      const text = (typeof opt === 'object' && opt !== null) ? (opt.text || '') : String(opt || '');
      return `(${label}) ${text.trim()}`;
    });
    optionsText = `Options:\n${lines.join('\n')}`;
  } else if (q.options && typeof q.options === 'object') {
    const lines = Object.entries(q.options).map(([k, v]) => `(${String(k).toLowerCase()}) ${String(v || '').trim()}`);
    optionsText = `Options:\n${lines.join('\n')}`;
  }

  const sections = [header, stem, optionsText].filter(s => s && s.trim());
  return sections.join('\n\n');
}

/**
 * Evaluates whether a question already has a complete, lecture-grade deep dive
 * (has analysis with breakdown, keywords, or core takeaway).
 */
export function isDeepDiveReady(q) {
  if (!q) return false;
  const { analysis } = getStructuredExplanation(q);
  if (!analysis || typeof analysis !== 'object') return false;

  const hasKeywords = Array.isArray(analysis.keywords) && analysis.keywords.length > 0;
  const hasOptions = Array.isArray(analysis.optionBreakdown) && analysis.optionBreakdown.length > 0;
  const hasStatements = Array.isArray(analysis.statementBreakdown) && analysis.statementBreakdown.length > 0;
  const hasTakeaway = Boolean(analysis.coreTakeaway && typeof analysis.coreTakeaway === 'string' && analysis.coreTakeaway.trim().length > 10);
  const hasValueAddition = Boolean(
    (Array.isArray(analysis.valueAddition) && analysis.valueAddition.length > 0) ||
    (typeof analysis.valueAddition === 'string' && analysis.valueAddition.trim().length > 20)
  );

  return (hasOptions || hasStatements) && (hasKeywords || hasTakeaway || hasValueAddition);
}
