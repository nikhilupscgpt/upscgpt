import crypto from 'node:crypto';

function sha1(val) {
  return crypto.createHash('sha1').update(String(val)).digest('hex').slice(0, 16);
}

/**
 * Converts a Prisma QuestionDraft row into D1 doc + Vectorize/FTS5 chunks.
 */
export function formatQuestionDraftForKb(draft) {
  const id = String(draft.id);
  const year = Number(draft.examYear || 0) || null;
  const subject = draft.srcSubject || 'General';
  const theme = draft.srcTheme || draft.srcTopic || 'General';
  const sub = draft.srcTopic || 'General';
  const topic = `${theme} · ${sub}`;
  const stem = String(draft.stem || '').trim();
  const rawOpts = Array.isArray(draft.options) ? draft.options : [];
  const opts = rawOpts.map((o) => ({
    label: String(o.label || '').toUpperCase(),
    text: String(o.text || '').trim(),
  }));
  const answerKey = String(draft.correctLabel || '?').toUpperCase();
  const matchedOpt = opts.find((o) => o.label === answerKey);
  const answerText = matchedOpt?.text || '';

  const expJson = draft.explanationJson && typeof draft.explanationJson === 'object' ? draft.explanationJson : null;
  let solSummary = String(draft.explanation || '').trim();
  if (!solSummary && expJson) {
    const sb = Array.isArray(expJson.statementBreakdown)
      ? expJson.statementBreakdown.map((s) => s.explanation || s.text).filter(Boolean).join(' ')
      : '';
    const ob = Array.isArray(expJson.optionBreakdown)
      ? expJson.optionBreakdown.map((o) => o.explanation || o.text).filter(Boolean).join(' ')
      : '';
    solSummary = [expJson.summary, sb, ob].filter(Boolean).join(' ').trim();
  }

  const hasSolution = Boolean(solSummary.length >= 20);
  const meta = {
    questionNo: draft.questionNo || null,
    contentStatus: draft.contentStatus || 'incomplete',
    updatedAt: draft.updatedAt ? new Date(draft.updatedAt).toISOString() : new Date().toISOString(),
  };

  const doc = {
    id,
    kind: 'pyq',
    year,
    subject,
    topic,
    title: `${year || ''} ${subject} · ${topic}`.trim(),
    stem,
    options_json: JSON.stringify(opts),
    answer_key: answerKey,
    answer_text: answerText,
    explanation: solSummary.slice(0, 2000),
    has_solution: hasSolution ? 1 : 0,
    meta_json: JSON.stringify(meta),
    content_hash: sha1(JSON.stringify({ stem, opts, answerKey, solSummary })),
  };

  const chunks = [];
  const optsLine = opts.map((o) => `(${o.label}) ${o.text}`).join(' | ');
  chunks.push({
    chunk_id: `${id}::q`,
    doc_id: id,
    chunk_type: 'question',
    kind: 'pyq',
    year,
    subject,
    text: `[UPSC ${year} · ${subject} · ${topic}] ${stem}${optsLine ? ` Options: ${optsLine}` : ''}`.slice(0, 1400),
  });

  if (Array.isArray(expJson?.statementBreakdown)) {
    expJson.statementBreakdown.forEach((st, idx) => {
      const stText = [st.statement || st.text, st.isTrue !== undefined ? `(${st.isTrue ? 'TRUE' : 'FALSE'})` : '', st.explanation]
        .filter(Boolean)
        .join(' — ');
      if (stText.trim().length > 12) {
        chunks.push({
          chunk_id: `${id}::st${idx + 1}`,
          doc_id: id,
          chunk_type: 'statement',
          kind: 'pyq',
          year,
          subject,
          text: `[UPSC ${year} · ${subject}] Statement ${idx + 1}: ${stText}`.slice(0, 900),
        });
      }
    });
  }

  if (hasSolution && solSummary) {
    chunks.push({
      chunk_id: `${id}::sol`,
      doc_id: id,
      chunk_type: 'solution',
      kind: 'pyq',
      year,
      subject,
      text: `[UPSC ${year} · ${subject} · Key (${answerKey}) ${answerText}] ${solSummary}`.slice(0, 1400),
    });
  }

  const kws = Array.isArray(expJson?.keywords) ? expJson.keywords : [];
  if (kws.length > 0 || theme || sub) {
    chunks.push({
      chunk_id: `${id}::kw`,
      doc_id: id,
      chunk_type: 'keyword',
      kind: 'pyq',
      year,
      subject,
      text: `${subject} | ${theme} | ${sub} | ${kws.join(', ')}`.slice(0, 600),
    });
  }

  return { doc, chunks };
}
