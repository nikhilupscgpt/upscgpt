'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Copy,
  Check,
  ArrowUp,
  ArrowDown,
  X,
  Mic,
  Monitor,
  Play,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { PageHeader, MetaLine, StatusBadge } from '@/components/pyq-studio';
import { moveArrayItem } from '@/lib/pyq/deck-helpers';

export default function RecordCheckClient({
  userRole = 'FACULTY',
  initialSessionId = '',
  initialSubject = '',
  initialTopic = '',
  initialIncludeCds = false,
  initialPart = 1,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recSession, setRecSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [brokenQuestions, setBrokenQuestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [uploadPack, setUploadPack] = useState(null);

  const [partSize, setPartSize] = useState(20);
  const [part, setPart] = useState(initialPart);
  const [title, setTitle] = useState('');
  const [micReady, setMicReady] = useState('checking');
  const [copiedField, setCopiedField] = useState('');

  const [noteOpenId, setNoteOpenId] = useState(null);
  const [noteBody, setNoteBody] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadExistingSession = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/recordings/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load session');
      setRecSession(data.session);
      setQuestions(data.questions || []);
      setUploadPack(data.uploadPack || null);
      setTitle(data.session?.title || '');
      setPart(data.session?.part || 1);
    } catch (e) {
      setError(e.message || 'Could not load recording session');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDraftSession = useCallback(async (nextPart = part, nextPartSize = partSize) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: initialSubject || undefined,
          topic: initialTopic || undefined,
          includeCds: initialIncludeCds,
          part: nextPart,
          partSize: nextPartSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create recording draft');
      setRecSession(data.session);
      setQuestions(data.questionsPreview || []);
      setBrokenQuestions(data.brokenQuestions || []);
      setSummary(data.summary || null);
      setTitle(data.session?.title || '');
    } catch (e) {
      setError(e.message || 'Failed to prepare recording');
    } finally {
      setLoading(false);
    }
  }, [initialSubject, initialTopic, initialIncludeCds, part, partSize]);

  useEffect(() => {
    if (initialSessionId) {
      loadExistingSession(initialSessionId);
    } else {
      createDraftSession(initialPart, 20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSessionId]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      setMicReady('manual');
      return;
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then((devs) => {
        const hasAudio = devs.some((d) => d.kind === 'audioinput');
        setMicReady(hasAudio ? 'ready' : 'missing');
      })
      .catch(() => setMicReady('manual'));
  }, []);

  const handleReorder = async (idx, dir) => {
    const nextQ = moveArrayItem(questions, idx, idx + dir);
    setQuestions(nextQ);
    if (recSession) {
      await fetch(`/api/admin/recordings/${encodeURIComponent(recSession.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: nextQ.map((q) => q.id) }),
      });
    }
  };

  const handleDropQuestion = async (id) => {
    const nextQ = questions.filter((q) => q.id !== id);
    setQuestions(nextQ);
    if (recSession) {
      await fetch(`/api/admin/recordings/${encodeURIComponent(recSession.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds: nextQ.map((q) => q.id) }),
      });
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteOpenId || !noteBody.trim()) return;
    setSavingNote(true);
    try {
      await fetch('/api/admin/pyq/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: noteOpenId, body: noteBody.trim() }),
      });
      setNoteOpenId(null);
      setNoteBody('');
    } finally {
      setSavingNote(false);
    }
  };

  const handleStartRecording = async () => {
    if (!recSession) return;
    await fetch(`/api/admin/recordings/${encodeURIComponent(recSession.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'recording',
        title,
        questionIds: questions.map((q) => q.id),
      }),
    });
    window.location.href = `/admin/studio/present?mode=pyq&sessionId=${encodeURIComponent(recSession.id)}&record=1`;
  };

  const handleCopy = async (field, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 1800);
    } catch {
      // ignore
    }
  };

  const handleRerecordQuestion = async (qId, idx) => {
    if (!recSession) return;
    const prevTs = Array.isArray(recSession.timestamps) ? recSession.timestamps : [];
    const clipName = `retake_${recSession.id}_q${idx + 1}.webm`;
    const nextTs = prevTs.map((t) =>
      t.questionId === qId
        ? { ...t, replacedBy: { videoRef: clipName, recordedAt: new Date().toISOString() } }
        : t,
    );
    await fetch(`/api/admin/recordings/${encodeURIComponent(recSession.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamps: nextTs }),
    });
    window.open(`/admin/studio/present?mode=pyq&ids=${encodeURIComponent(qId)}&record=1`, '_blank');
  };

  const sectionLabel =
    recSession?.sectionPath ||
    [initialSubject, initialTopic].filter(Boolean).join(' › ') ||
    'All PYQs';

  return (
    <div className="pq-pyq-studio-root">
      <PageHeader
        breadcrumbs={[
          { label: 'Studio', href: '/admin/studio' },
          { label: 'PYQ Studio', href: '/admin/studio/pyq' },
          { label: `Record: ${sectionLabel}` },
        ]}
        primaryAction={
          recSession && recSession.status !== 'done' && questions.length > 0 ? (
            <button type="button" onClick={handleStartRecording} className="pyq-ui-primary-btn">
              <Video size={15} />
              <span>
                {recSession.status === 'paused' && recSession.lastIndex > 0
                  ? `Resume from Q${recSession.lastIndex + 1}`
                  : 'Start recording'}
              </span>
            </button>
          ) : null
        }
      />

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          Preparing recording session...
        </div>
      ) : error ? (
        <div style={{ padding: 20, borderRadius: 12, border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
          {error}
        </div>
      ) : recSession?.status === 'done' && uploadPack ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#34d399' }}>
              Part {recSession.part} of {recSession.totalParts} recorded
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
              {questions.length} questions · {recSession.durationSec ? `${Math.round(recSession.durationSec / 60)} min` : 'Completed'} {recSession.videoRef ? `· File: ${recSession.videoRef}` : ''}
            </div>
          </div>

          <section style={{ display: 'grid', gap: 14, padding: 18, borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#0f172a' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Upload Pack</h2>
            {[
              { key: 'title', label: 'Title', value: uploadPack.title },
              { key: 'chapters', label: 'YouTube Chapters', value: uploadPack.chapters, multiline: true },
              { key: 'description', label: 'Description', value: uploadPack.description, multiline: true },
              { key: 'tags', label: 'Tags', value: uploadPack.tags },
            ].map((item) => (
              <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#94a3b8' }}>{item.label}</span>
                  <button
                    type="button"
                    className="pyq-ui-secondary-btn"
                    onClick={() => handleCopy(item.key, item.value)}
                  >
                    {copiedField === item.key ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedField === item.key ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                {item.multiline ? (
                  <pre style={{ margin: 0, padding: 10, borderRadius: 8, background: '#020617', color: '#e2e8f0', fontSize: 12.5, whiteSpace: 'pre-wrap' }}>
                    {item.value}
                  </pre>
                ) : (
                  <div style={{ padding: 10, borderRadius: 8, background: '#020617', color: '#e2e8f0', fontSize: 13 }}>
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section style={{ padding: 18, borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#0f172a' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>Re-record one question</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.14)' }}>
                  <MetaLine parts={[`Q${idx + 1}`, `${q.examName || 'UPSC CSE'} ${q.examYear || ''}`, q.questionNo ? `Q${q.questionNo}` : null]} />
                  <button
                    type="button"
                    className="pyq-ui-secondary-btn"
                    onClick={() => handleRerecordQuestion(q.id, idx)}
                  >
                    <RotateCcw size={13} />
                    <span>Re-record clip</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {recSession.part < recSession.totalParts && (
            <Link
              href={`/admin/studio/pyq/record?subject=${encodeURIComponent(initialSubject)}&topic=${encodeURIComponent(initialTopic)}&part=${recSession.part + 1}`}
              className="pyq-ui-primary-btn"
              style={{ alignSelf: 'flex-start' }}
            >
              <Play size={14} fill="currentColor" />
              <span>Next: Part {recSession.part + 1} of {recSession.totalParts}</span>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Summary + Part settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, padding: 16, borderRadius: 12, border: '1px solid rgba(148,163,184,0.18)', background: '#0f172a' }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Session scope</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                {questions.length} questions · ~{summary?.estMinutes ?? Math.max(1, Math.round((questions.length * 75) / 60))} min
              </div>
              {summary && (
                <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
                  Part {recSession?.part || 1} of {summary.totalParts} ({summary.totalUsable} usable total)
                </div>
              )}
            </div>

            <div>
              <label htmlFor="rec-part-size" className="pyq-ui-filter-label" style={{ display: 'block', marginBottom: 4 }}>
                Questions per part
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="rec-part-size"
                  type="number"
                  min={1}
                  max={100}
                  value={partSize}
                  onChange={(e) => setPartSize(Number(e.target.value) || 20)}
                  className="pyq-ui-filter-input"
                  style={{ width: 90 }}
                />
                <button
                  type="button"
                  className="pyq-ui-secondary-btn"
                  onClick={() => createDraftSession(1, partSize)}
                >
                  Re-split
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Hardware & stage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: micReady === 'ready' ? '#34d399' : '#cbd5e1' }}>
                  <Mic size={14} /> Mic: {micReady}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#34d399' }}>
                  <Monitor size={14} /> 1080p Stage Ready
                </span>
              </div>
            </div>
          </div>

          {/* Title preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="rec-title-preview" className="pyq-ui-filter-label">
              Title preview
            </label>
            <input
              id="rec-title-preview"
              type="text"
              className="pyq-ui-filter-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Warnings */}
          {(summary?.needsExplanationCount > 0 || brokenQuestions.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 12, border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.07)', fontSize: 13 }}>
              {summary?.needsExplanationCount > 0 && (
                <div style={{ color: '#fbbf24' }}>
                  {summary.needsExplanationCount} questions need explanation — add an inline teacher note below or record anyway.
                </div>
              )}
              {brokenQuestions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, color: '#f87171' }}>
                  <span>{brokenQuestions.length} broken questions excluded automatically.</span>
                  {userRole === 'ADMIN' && (
                    <Link href="/admin/pyq?answerStatus=MISSING_ANSWER" target="_blank" className="pyq-ui-secondary-btn">
                      <span>Open in Editor</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ordered questions checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.16)',
                  background: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <MetaLine
                    parts={[
                      `${idx + 1}.`,
                      `${q.examName || 'UPSC CSE'} ${q.examYear || ''}`,
                      q.questionNo ? `Q${q.questionNo}` : null,
                      q.srcTopic,
                    ]}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {q.contentStatus !== 'ready' && (
                      <>
                        <StatusBadge status="incomplete" />
                        <button
                          type="button"
                          className="pyq-ui-secondary-btn"
                          style={{ padding: '4px 9px', fontSize: 12 }}
                          onClick={() => setNoteOpenId(noteOpenId === q.id ? null : q.id)}
                        >
                          Teacher note
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, -1)}
                      disabled={idx === 0}
                      className="pyq-ui-icon-btn"
                      aria-label={`Move question ${idx + 1} up`}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, 1)}
                      disabled={idx === questions.length - 1}
                      className="pyq-ui-icon-btn"
                      aria-label={`Move question ${idx + 1} down`}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDropQuestion(q.id)}
                      className="pyq-ui-icon-btn"
                      aria-label={`Drop question ${idx + 1}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.45 }}>
                  {String(q.stem || '').slice(0, 180)}
                  {String(q.stem || '').length > 180 ? '...' : ''}
                </div>
                {noteOpenId === q.id && (
                  <form onSubmit={handleSaveNote} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      className="pyq-ui-filter-input"
                      style={{ flex: 1 }}
                      placeholder="Quick talking point / teacher note..."
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      aria-label="Teacher note"
                    />
                    <button type="submit" disabled={savingNote} className="pyq-ui-primary-btn">
                      {savingNote ? 'Saving...' : 'Save note'}
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
