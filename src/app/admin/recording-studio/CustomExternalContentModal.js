'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Play,
  Smartphone,
  Video,
  Plus,
  Trash2,
  Wand2,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

/**
 * Smart client-side parser that converts any raw pasted UPSC MCQ / Current Affairs text
 * into a structured PYQ / Reel item ready for both 16:9 Lecture Studio and 9:16 Reels Studio.
 */
export function parseRawExternalTextToItem(rawText) {
  const text = (rawText || '').trim();
  if (!text) return null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const options = [];
  const statements = [];
  const stemLines = [];
  let correctLabel = 'A';
  const explanationLines = [];
  const keywordLines = [];

  let section = 'stem'; // 'stem' | 'explanation' | 'keywords'

  for (const line of lines) {
    // Detect explicit section headers
    if (/^(explanation|analysis|solution|answer\s*explanation)\s*[:\-]?/i.test(line)) {
      section = 'explanation';
      const rest = line.replace(/^(explanation|analysis|solution|answer\s*explanation)\s*[:\-]?\s*/i, '');
      if (rest) explanationLines.push(rest);
      continue;
    }
    if (/^(keywords?|high[-\s]*yield|takeaway|value\s*addition)\s*[:\-]?/i.test(line)) {
      section = 'keywords';
      const rest = line.replace(/^(keywords?|high[-\s]*yield|takeaway|value\s*addition)\s*[:\-]?\s*/i, '');
      if (rest) keywordLines.push(rest);
      continue;
    }

    // Detect Answer line e.g. "Answer: (b)" or "Correct Answer: C"
    const ansMatch = line.match(/^(?:correct\s*)?(?:answer|ans|key)\s*[:\-]?\s*\(?([A-Da-d])\)?/i);
    if (ansMatch) {
      correctLabel = ansMatch[1].toUpperCase();
      continue;
    }

    if (section === 'explanation') {
      explanationLines.push(line);
      continue;
    }
    if (section === 'keywords') {
      keywordLines.push(line);
      continue;
    }

    // Detect Option lines: (a) ..., (b) ..., A. ..., B) ...
    const optMatch = line.match(/^(?:\(([a-dA-D])\)|([a-dA-D])[\.\)])\s+(.+)$/);
    if (optMatch) {
      const label = (optMatch[1] || optMatch[2]).toUpperCase();
      options.push({ label, text: optMatch[3].trim() });
      continue;
    }

    // Detect numbered statement lines: 1. ..., 2. ..., Statement 1: ...
    const stmtMatch = line.match(/^(?:Statement\s*)?([1-5])[\.\:\)]\s+(.+)$/i);
    if (stmtMatch) {
      statements.push({ no: Number(stmtMatch[1]), text: stmtMatch[2].trim() });
    }

    stemLines.push(line);
  }

  // Fallback options if user pasted a topic/concept note instead of an MCQ
  const finalOptions =
    options.length > 0
      ? options
      : [
          { label: 'A', text: '1 only' },
          { label: 'B', text: '2 only' },
          { label: 'C', text: 'Both 1 and 2' },
          { label: 'D', text: 'Neither 1 nor 2' },
        ];

  // Build statementBreakdown from explanation lines or statements
  const statementBreakdown = [];
  if (statements.length > 0) {
    statements.forEach((st, idx) => {
      const expLine = explanationLines[idx] || st.text;
      const lower = expLine.toLowerCase();
      const isIncorrect = lower.includes('incorrect') || lower.includes('false') || lower.includes('not ');
      statementBreakdown.push({
        statementNo: String(st.no || idx + 1),
        verdict: isIncorrect ? 'Incorrect' : 'Correct',
        explanation: expLine,
      });
    });
  } else if (explanationLines.length > 0) {
    explanationLines.forEach((expLine, idx) => {
      const lower = expLine.toLowerCase();
      const isIncorrect = lower.includes('incorrect') || lower.includes('false');
      statementBreakdown.push({
        statementNo: String(idx + 1),
        verdict: isIncorrect ? 'Incorrect' : 'Correct',
        explanation: expLine.replace(/^[1-5][\.\)]\s*/, ''),
      });
    });
  }

  const highYieldKeywords = keywordLines.map((kl) => {
    const parts = kl.split(/[:\-–—]/);
    if (parts.length >= 2) {
      return {
        term: parts[0].replace(/^[\*\•\-\d\.]+\s*/, '').trim(),
        shortNote: parts.slice(1).join(':').trim(),
      };
    }
    return {
      term: 'Core Concept',
      shortNote: kl.replace(/^[\*\•\-]+\s*/, '').trim(),
    };
  });

  return {
    examName: 'UPSC CSE',
    examYear: new Date().getFullYear(),
    srcSubject: 'Current Affairs / GS',
    srcTopic: 'Custom External Deck',
    stem: stemLines.join('\n'),
    options: finalOptions,
    correctLabel,
    statementBreakdown,
    highYieldKeywords,
    coreConceptAnchor: explanationLines.join(' ') || 'Key concept analysis for UPSC Prelims.',
  };
}

export default function CustomExternalContentModal({ isOpen, onClose, defaultTarget = 'reels' }) {
  const [rawPaste, setRawPaste] = useState('');
  const [badgeTag, setBadgeTag] = useState('UPSC CSE 2026 · Current Affairs');
  const [topicTitle, setTopicTitle] = useState('High-Yield Prelims Challenge');
  const [stemText, setStemText] = useState(
    'Consider the following statements:\n1. Statement one goes here.\n2. Statement two goes here.\nWhich of the statements given above is/are correct?'
  );
  const [options, setOptions] = useState([
    { label: 'A', text: '1 only' },
    { label: 'B', text: '2 only' },
    { label: 'C', text: 'Both 1 and 2' },
    { label: 'D', text: 'Neither 1 nor 2' },
  ]);
  const [correctLabel, setCorrectLabel] = useState('C');

  // Slide 2: Statement / Point Analysis
  const [analysisItems, setAnalysisItems] = useState([
    {
      statementNo: '1',
      verdict: 'Correct',
      explanation: 'Explain why Statement 1 is correct or incorrect here.',
    },
    {
      statementNo: '2',
      verdict: 'Correct',
      explanation: 'Explain why Statement 2 is correct or incorrect here.',
    },
  ]);

  // Slide 3: High-Yield Keywords / Takeaways
  const [keywords, setKeywords] = useState([
    {
      term: 'Constitutional / Statutory Anchor',
      shortNote: 'Key article, body, or geographical fact examiners test repeatedly.',
    },
    {
      term: 'UPSC Examiner Trap',
      shortNote: 'Watch out for extreme words or ministry swap traps.',
    },
  ]);

  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleAutoParseRaw = () => {
    const parsed = parseRawExternalTextToItem(rawPaste);
    if (!parsed) return;
    if (parsed.stem) setStemText(parsed.stem);
    if (parsed.options?.length) setOptions(parsed.options);
    if (parsed.correctLabel) setCorrectLabel(parsed.correctLabel);
    if (parsed.statementBreakdown?.length) setAnalysisItems(parsed.statementBreakdown);
    if (parsed.highYieldKeywords?.length) setKeywords(parsed.highYieldKeywords);
  };

  const buildCustomPayload = () => {
    const customItem = {
      id: `custom_${Date.now()}`,
      type: 'pyq',
      examName: badgeTag.split('·')[0]?.trim() || 'UPSC Special',
      examYear: '',
      questionNo: '1',
      srcSubject: badgeTag.split('·')[1]?.trim() || badgeTag,
      srcTopic: topicTitle || 'External Content',
      stem: stemText,
      options,
      correctLabel,
      difficulty: 'High-Yield',
      imageUrl: imageUrl.trim() || null,
      explanation: {
        correctAnswer: {
          option: correctLabel,
          statement: options.find((o) => o.label === correctLabel)?.text || '',
        },
        coreConceptAnchor:
          analysisItems.map((a) => `Statement ${a.statementNo} (${a.verdict}): ${a.explanation}`).join('\n\n') ||
          'Key conceptual breakdown.',
        statementBreakdown: analysisItems.map((a, idx) => ({
          statementNo: a.statementNo || String(idx + 1),
          verdict: a.verdict || 'Correct',
          explanation: a.explanation || '',
        })),
        optionBreakdown: [],
        highYieldKeywords: keywords.filter((k) => k.term.trim() || k.shortNote.trim()),
        eliminationTechnique:
          keywords[0]?.shortNote || 'Verify constitutional/statutory facts before eliminating options.',
      },
    };
    return [customItem];
  };

  const handleLaunchStudio = (target) => {
    const deck = buildCustomPayload();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pq_custom_recording_deck', JSON.stringify(deck));
        if (imageUrl.trim()) {
          const savedAttach = JSON.parse(sessionStorage.getItem('pq_studio_attachments') || '{}');
          savedAttach[deck[0].id] = {
            imageUrl: imageUrl.trim(),
            imageCaption: topicTitle,
          };
          sessionStorage.setItem('pq_studio_attachments', JSON.stringify(savedAttach));
        }
      } catch (e) {
        console.error('Failed to store custom deck:', e);
      }
      if (target === 'reels') {
        window.open('/admin/recording-studio/reels/present?mode=custom', '_blank');
      } else {
        window.open('/admin/recording-studio/present?mode=custom', '_blank');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.86)',
        backdropFilter: 'blur(10px)',
        zIndex: 100005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0f172a',
          border: '1.5px solid rgba(168, 85, 247, 0.45)',
          borderRadius: 22,
          padding: 26,
          color: '#f8fafc',
          boxShadow: '0 24px 90px rgba(0, 0, 0, 0.75)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f43f5e, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
                1-Click External / Custom Content Studio
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#94a3b8' }}>
                Paste any question, news event, or concept from outside the platform and launch directly into the 9:16 Reel or 16:9 Lecture Studio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Fast Raw Paste Box */}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px dashed rgba(168, 85, 247, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#e879f9', textTransform: 'uppercase' }}>
              ⚡ Quick Smart Paste (Optional — Paste Raw MCQ + Answer + Notes &amp; Click Auto-Fill)
            </span>
            <button
              type="button"
              onClick={handleAutoParseRaw}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Wand2 size={14} />
              <span>Auto-Fill Slides from Raw Text</span>
            </button>
          </div>
          <textarea
            rows={3}
            placeholder="Paste any raw question with 1. / 2. statements, (a) (b) (c) (d) options, Answer: B, Explanation: ..., Keywords: ... and click 'Auto-Fill Slides'!"
            value={rawPaste}
            onChange={(e) => setRawPaste(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 10,
              background: '#020617',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#e2e8f0',
              fontSize: 12.5,
              lineHeight: 1.45,
            }}
          />
        </div>

        {/* Main 3-Slide Structured Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Left Column: Slide 1 (Header, Question Stem & Options) */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase' }}>
              Slide 1 · Question / Hook &amp; Options
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Top Badge Pill</label>
                <input
                  type="text"
                  value={badgeTag}
                  onChange={(e) => setBadgeTag(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12.5 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Topic / Headline</label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12.5 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                Question Stem &amp; Numbered Statements (`1.`, `2.`, `3.`)
              </label>
              <textarea
                rows={5}
                value={stemText}
                onChange={(e) => setStemText(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, lineHeight: 1.45 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Options (A / B / C / D)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#34d399', fontWeight: 800 }}>Correct Key:</span>
                  {['A', 'B', 'C', 'D'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setCorrectLabel(lbl)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: 'none',
                        background: correctLabel === lbl ? '#10b981' : 'rgba(255,255,255,0.08)',
                        color: correctLabel === lbl ? '#022c22' : '#cbd5e1',
                        fontWeight: 900,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {options.map((opt, idx) => (
                <div key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: correctLabel === opt.label ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.15)',
                      color: correctLabel === opt.label ? '#34d399' : '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {opt.label}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = { ...opt, text: e.target.value };
                      setOptions(next);
                    }}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12.5 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Slide 2 (Statement Analysis) & Slide 3 (Keywords) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Slide 2 */}
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: '#34d399', textTransform: 'uppercase' }}>
                  Slide 2 · Statement / Option Analysis
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAnalysisItems((prev) => [
                      ...prev,
                      { statementNo: String(prev.length + 1), verdict: 'Correct', explanation: '' },
                    ])
                  }
                  style={{
                    padding: '4px 9px',
                    borderRadius: 6,
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Add Statement
                </button>
              </div>

              {analysisItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 10, borderRadius: 10, background: '#020617', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#cbd5e1' }}>
                      Statement #{item.statementNo}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...analysisItems];
                          next[idx] = { ...item, verdict: item.verdict === 'Correct' ? 'Incorrect' : 'Correct' };
                          setAnalysisItems(next);
                        }}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          border: 'none',
                          background: item.verdict === 'Correct' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: item.verdict === 'Correct' ? '#34d399' : '#fb7185',
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {item.verdict} (Click to Toggle)
                      </button>
                      {analysisItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAnalysisItems(analysisItems.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Why is this statement correct/incorrect?"
                    value={item.explanation}
                    onChange={(e) => {
                      const next = [...analysisItems];
                      next[idx] = { ...item, explanation: e.target.value };
                      setAnalysisItems(next);
                    }}
                    style={{ width: '100%', padding: '6px 9px', borderRadius: 6, background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12 }}
                  />
                </div>
              ))}
            </div>

            {/* Slide 3 */}
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 900, color: '#e879f9', textTransform: 'uppercase' }}>
                  Slide 3 · High-Yield Keywords &amp; Takeaways
                </span>
                <button
                  type="button"
                  onClick={() => setKeywords((prev) => [...prev, { term: '', shortNote: '' }])}
                  style={{
                    padding: '4px 9px',
                    borderRadius: 6,
                    background: 'rgba(168, 85, 247, 0.18)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#e879f9',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Add Keyword
                </button>
              </div>

              {keywords.map((kw, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 6, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Keyword / Term"
                    value={kw.term}
                    onChange={(e) => {
                      const next = [...keywords];
                      next[idx] = { ...kw, term: e.target.value };
                      setKeywords(next);
                    }}
                    style={{ padding: '6px 9px', borderRadius: 6, background: '#020617', border: '1px solid rgba(168,85,247,0.35)', color: '#e879f9', fontSize: 12, fontWeight: 800 }}
                  />
                  <input
                    type="text"
                    placeholder="1-line high-yield note..."
                    value={kw.shortNote}
                    onChange={(e) => {
                      const next = [...keywords];
                      next[idx] = { ...kw, shortNote: e.target.value };
                      setKeywords(next);
                    }}
                    style={{ padding: '6px 9px', borderRadius: 6, background: '#020617', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12 }}
                  />
                  {keywords.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Launch Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <ImageIcon size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Optional Image / Map / Diagram URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ width: 280, padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => handleLaunchStudio('lecture')}
              style={{
                padding: '11px 18px',
                borderRadius: 12,
                background: 'rgba(244, 63, 94, 0.16)',
                border: '1.5px solid #f43f5e',
                color: '#fb7185',
                fontSize: 13.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Video size={16} />
              <span>Launch in 16:9 Lecture Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchStudio('reels')}
              style={{
                padding: '11px 22px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                border: 'none',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
              }}
            >
              <Smartphone size={16} />
              <span>Launch in 9:16 Reels Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
