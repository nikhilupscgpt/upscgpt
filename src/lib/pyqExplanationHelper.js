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
          explanationText = parsed.explanation;
        } else {
          // Clear explanationText so raw JSON string is never printed as text
          explanationText = null;
        }
      } catch (e) {
        // Keep raw text if not valid JSON
      }
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
