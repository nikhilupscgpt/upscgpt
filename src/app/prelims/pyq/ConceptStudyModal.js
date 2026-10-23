'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  BookOpen,
  Sparkles,
  Tag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit3,
  Save,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';
import StemView from './StemView';

function parseStudyPoints(text) {
  if (!text || typeof text !== 'string') return [];
  const rawLines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  const items = [];
  for (const line of rawLines) {
    if (line.includes(' • ')) {
      const parts = line.split(/\s*•\s*/).filter(Boolean);
      for (const p of parts) {
        const cleaned = p.replace(/^[•*\-\s]+/, '').trim();
        if (cleaned) items.push(cleaned);
      }
    } else {
      const cleaned = line.replace(/^[•*\-\s]+/, '').trim();
      if (cleaned) items.push(cleaned);
    }
  }
  return items;
}

export default function ConceptStudyModal({
  isOpen,
  onClose,
  initialConcept, // { slug, term, shortNote, longContent, subject, topic }
  isAdmin = false,
}) {
  const [loading, setLoading] = useState(false);
  const [conceptData, setConceptData] = useState(initialConcept || null);
  const [questions, setQuestions] = useState([]);
  const [pickedOptions, setPickedOptions] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});

  // Admin inline editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editShortNote, setEditShortNote] = useState('');
  const [editLongContent, setEditLongContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (!isOpen || !initialConcept) return;

    setConceptData(initialConcept);
    setEditShortNote(initialConcept.shortNote || '');
    setEditLongContent(initialConcept.longContent || '');
    setIsEditing(false);
    setSaveMessage(null);

    let cancelled = false;
    async function fetchConceptDetails() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (initialConcept.slug) params.set('slug', initialConcept.slug);
        if (initialConcept.term) params.set('term', initialConcept.term);
        if (initialConcept.shortNote) {
          params.set('shortNote', initialConcept.shortNote);
        }

        const res = await fetch(`/api/pyq/concepts?${params.toString()}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          const mergedConcept = {
            ...initialConcept,
            ...data.concept,
            shortNote:
              data.concept?.shortNote || initialConcept.shortNote || '',
            longContent:
              data.concept?.longContent || initialConcept.longContent || '',
          };
          setConceptData(mergedConcept);
          setEditShortNote(mergedConcept.shortNote || '');
          setEditLongContent(mergedConcept.longContent || '');
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
        }
      } catch (err) {
        console.error('Failed to load concept details:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConceptDetails();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialConcept]);

  if (!isOpen || !conceptData) return null;

  const handleSaveConcept = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/pyq/concepts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: conceptData.slug,
          term: conceptData.term,
          shortNote: editShortNote,
          longContent: editLongContent,
          subject: conceptData.subject,
          topic: conceptData.topic,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConceptData(prev => ({
          ...prev,
          shortNote: editShortNote,
          longContent: editLongContent,
        }));
        setIsEditing(false);
        setSaveMessage('Concept notes saved!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(data.error || 'Failed to save (Admin login required)');
      }
    } catch (err) {
      setSaveMessage('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const longPoints = parseStudyPoints(conceptData.longContent);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          height: '100vh',
          background: 'var(--pq-surface, #ffffff)',
          color: 'var(--pq-ink, #0f172a)',
          borderLeft: '1px solid var(--pq-border, #e2e8f0)',
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
        }}
      >
        {/* Top Sticky Header */}
        <div
          style={{
            padding: '20px 26px',
            borderBottom: '1px solid var(--pq-border, #e2e8f0)',
            background: 'var(--pq-card, #f8fafc)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(59, 130, 246, 0.14)',
                  color: '#3b82f6',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <Tag size={12} /> Concept Card
              </span>

              {conceptData.subject && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'var(--pq-pill-bg, rgba(100,116,139,0.12))',
                    color: 'var(--pq-muted, #64748b)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                  }}
                >
                  {conceptData.subject}
                  {conceptData.topic && conceptData.topic !== 'General'
                    ? ` › ${conceptData.topic}`
                    : ''}
                </span>
              )}

              {questions.length > 0 && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    color: '#10b981',
                    fontSize: '11.5px',
                    fontWeight: 800,
                  }}
                >
                  Tested in {questions.length} PYQ
                  {questions.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                lineHeight: 1.3,
                color: 'var(--pq-ink, #0f172a)',
              }}
            >
              {conceptData.term}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditing(v => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--pq-border, #cbd5e1)',
                  background: isEditing
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'transparent',
                  color: 'var(--pq-ink, #0f172a)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={13} />
                {isEditing ? 'Cancel Edit' : 'Edit Notes'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close concept drawer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--pq-border, #cbd5e1)',
                background: 'var(--pq-surface, #ffffff)',
                color: 'var(--pq-muted, #64748b)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 26px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {saveMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10b981',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              ✓ {saveMessage}
            </div>
          )}

          {/* Inline Admin Editor Mode */}
          {isEditing ? (
            <div
              style={{
                padding: '18px 20px',
                borderRadius: '14px',
                border: '1.5px solid rgba(59, 130, 246, 0.4)',
                background: 'rgba(59, 130, 246, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#3b82f6' }}>
                ✏️ Edit Concept Knowledge (Short Capsule &amp; Long Study Note)
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: 'var(--pq-muted)',
                  }}
                >
                  Short Concept Card (Shown inside Question Card):
                </label>
                <textarea
                  rows={3}
                  value={editShortNote}
                  onChange={e => setEditShortNote(e.target.value)}
                  placeholder="1-2 sentence high-yield definition or constitutional/statutory mandate..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--pq-border, #cbd5e1)',
                    background: 'var(--pq-surface, #ffffff)',
                    color: 'var(--pq-ink, #0f172a)',
                    fontSize: '13.5px',
                    lineHeight: 1.55,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '6px',
                    color: 'var(--pq-muted)',
                  }}
                >
                  Long-Form Study Content (Detailed Prelims Revision Notes — bullet points supported):
                </label>
                <textarea
                  rows={8}
                  value={editLongContent}
                  onChange={e => setEditLongContent(e.target.value)}
                  placeholder="• Constitutional / Statutory Basis: ...\n• Key Provisions & Exceptions: ...\n• Common UPSC Examiner Traps: ..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--pq-border, #cbd5e1)',
                    background: 'var(--pq-surface, #ffffff)',
                    color: 'var(--pq-ink, #0f172a)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--pq-border, #cbd5e1)',
                    background: 'transparent',
                    color: 'var(--pq-ink)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConcept}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Concept Note'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Short Concept Card (Core Capsule) */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background:
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.09), rgba(99, 102, 241, 0.06))',
                  border: '1.5px solid rgba(59, 130, 246, 0.28)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#3b82f6',
                    marginBottom: '8px',
                  }}
                >
                  <Sparkles size={13} /> High-Yield Concept Capsule
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.65,
                    fontWeight: 500,
                    color: 'var(--pq-ink, #0f172a)',
                  }}
                >
                  {conceptData.shortNote ||
                    `Core UPSC Prelims concept tested under ${conceptData.subject || 'General Studies'}${conceptData.topic ? ` (${conceptData.topic})` : ''}.`}
                </div>
              </div>

              {/* 2. Long-Form Study Note (Shown when populated) */}
              {conceptData.longContent && conceptData.longContent.trim() ? (
                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: '14px',
                    background: 'var(--pq-card, #f8fafc)',
                    border: '1px solid var(--pq-border, #e2e8f0)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--pq-gold, #d97706)',
                      marginBottom: '14px',
                    }}
                  >
                    <BookOpen size={14} /> Detailed Study Notes
                  </div>

                  {longPoints.length > 1 ? (
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {longPoints.map((pt, idx) => {
                        const colonIdx = pt.indexOf(':');
                        const hasHeading = colonIdx > 0 && colonIdx < 80;
                        const heading = hasHeading
                          ? pt.slice(0, colonIdx).trim()
                          : null;
                        const body = hasHeading
                          ? pt.slice(colonIdx + 1).trim()
                          : pt;

                        return (
                          <li
                            key={idx}
                            style={{
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'flex-start',
                              lineHeight: 1.62,
                              fontSize: '14px',
                            }}
                          >
                            <span
                              style={{
                                color: 'var(--pq-gold, #f59e0b)',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                lineHeight: 1,
                                marginTop: '2px',
                              }}
                            >
                              •
                            </span>
                            <div>
                              {hasHeading ? (
                                <>
                                  <strong style={{ fontWeight: 800 }}>
                                    {heading}:{' '}
                                  </strong>
                                  <span>{body}</span>
                                </>
                              ) : (
                                <span>{body}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.65,
                        fontSize: '14px',
                      }}
                    >
                      {conceptData.longContent}
                    </div>
                  )}
                </div>
              ) : isAdmin ? (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px dashed var(--pq-border, #cbd5e1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'var(--pq-muted)' }}>
                    Long-form study note is not filled yet for this concept.
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    + Add Long Study Note
                  </button>
                </div>
              ) : null}
            </>
          )}

          {/* 3. Associated Previous Year Questions */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--pq-ink, #0f172a)',
                }}
              >
                <Layers size={15} style={{ color: '#3b82f6' }} />
                <span>
                  Associated UPSC PYQs ({loading ? '...' : questions.length})
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--pq-muted)' }}>
                Click any option to test yourself
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  padding: '28px',
                  textAlign: 'center',
                  color: 'var(--pq-muted)',
                  fontSize: '13.5px',
                }}
              >
                Loading associated questions...
              </div>
            ) : questions.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--pq-border, #e2e8f0)',
                  textAlign: 'center',
                  color: 'var(--pq-muted)',
                  fontSize: '13.5px',
                }}
              >
                No associated questions found yet.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {questions.map(q => {
                  const picked = pickedOptions[q.id];
                  const isRevealed = Boolean(picked || revealedQuestions[q.id]);
                  const opts = Array.isArray(q.options) ? q.options : [];
                  const correctOpt = opts.find(
                    o =>
                      (o.label || '').toLowerCase() ===
                      (q.correctLabel || '').toLowerCase()
                  );

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: '1px solid var(--pq-border, #e2e8f0)',
                        background: 'var(--pq-card, #f8fafc)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginBottom: '12px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span className="pq-tag pq-tag-exam">
                            {q.examName} {q.examYear}
                          </span>
                          {q.questionNo ? (
                            <span className="pq-tag pq-tag-q">
                              Q{q.questionNo}
                            </span>
                          ) : null}
                          {q.srcTopic && (
                            <span className="pq-tag pq-tag-topic">
                              {q.srcTopic}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                        <StemView stem={q.stem} />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        {opts.map(o => {
                          const isCorrect =
                            (o.label || '').toLowerCase() ===
                            (q.correctLabel || '').toLowerCase();
                          const isPicked = picked === o.label;

                          let borderColor = 'var(--pq-border, #cbd5e1)';
                          let bgColor = 'var(--pq-surface, #ffffff)';
                          if (isRevealed) {
                            if (isCorrect) {
                              borderColor = '#10b981';
                              bgColor = 'rgba(16, 185, 129, 0.1)';
                            } else if (isPicked && !isCorrect) {
                              borderColor = '#ef4444';
                              bgColor = 'rgba(239, 68, 68, 0.1)';
                            }
                          }

                          return (
                            <button
                              key={o.label}
                              type="button"
                              onClick={() =>
                                setPickedOptions(prev => ({
                                  ...prev,
                                  [q.id]: o.label,
                                }))
                              }
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                border: `1.5px solid ${borderColor}`,
                                background: bgColor,
                                color: 'var(--pq-ink, #0f172a)',
                                textAlign: 'left',
                                fontSize: '13.5px',
                                lineHeight: 1.45,
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 800,
                                  minWidth: '20px',
                                  color: isRevealed && isCorrect
                                    ? '#10b981'
                                    : 'var(--pq-muted)',
                                }}
                              >
                                ({String(o.label).toUpperCase()})
                              </span>
                              <span style={{ flex: 1 }}>{o.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        {isRevealed ? (
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color:
                                picked &&
                                picked.toLowerCase() !==
                                  (q.correctLabel || '').toLowerCase()
                                  ? '#ef4444'
                                  : '#10b981',
                            }}
                          >
                            ✓ Official Key: (
                            {String(q.correctLabel || '').toUpperCase()})
                            {correctOpt ? ` — ${correctOpt.text}` : ''}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedQuestions(prev => ({
                                ...prev,
                                [q.id]: true,
                              }))
                            }
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#3b82f6',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Show Answer Key →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
