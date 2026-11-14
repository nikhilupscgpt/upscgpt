'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link as RemoteLink } from '@/lib/remote/link';
import { ChevronLeft, ChevronRight, Circle, Pause, Play, Square, Clock } from 'lucide-react';

function fmtSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function PresenterViewClient({ initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState('waiting');
  const [presenterState, setPresenterState] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState({});
  const linkRef = useRef(null);

  useEffect(() => {
    if (!code) return;
    const link = new RemoteLink('control');
    linkRef.current = link;
    const unsubStatus = link.watch((s) => setStatus(s));
    const unsubMsg = link.on((msg) => {
      if (msg?.t === 'presenter_meta') {
        setPresenterState(msg.payload || null);
      }
    });
    link.join(code).catch(() => {});
    return () => {
      unsubStatus();
      unsubMsg();
      link.close();
      linkRef.current = null;
    };
  }, [code]);

  const sendCmd = (action, extra = {}) => {
    linkRef.current?.send({ t: 'cmd', action, ...extra });
  };

  const qId = presenterState?.currentQ?.id || `q_${presenterState?.qIndex ?? 0}`;
  const noteText = teacherNotes[qId] ?? (() => {
    if (typeof window === 'undefined') return '';
    try { return localStorage.getItem(`pq_teacher_note_${qId}`) || ''; } catch { return ''; }
  })();

  const updateNote = (val) => {
    setTeacherNotes((prev) => ({ ...prev, [qId]: val }));
    try { localStorage.setItem(`pq_teacher_note_${qId}`, val); } catch {}
  };

  const qSec = presenterState?.qElapsedSec || 0;
  const targetSec = presenterState?.targetSecPerQuestion || 120;
  const isOverTarget = qSec > targetSec;
  const recStatus = presenterState?.recStatus || 'idle'; // 'idle' | 'countdown' | 'recording' | 'paused' | 'rehearsal'

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 20, display: 'grid', gap: 16, gridTemplateRows: 'auto 1fr' }}>
      {/* Top Status & Recording Bar */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Presenter View</span>
          <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, background: status === 'connected' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: status === 'connected' ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
            {status === 'connected' ? `Synced (${code})` : `Sync: ${status}`}
          </span>
          {(recStatus === 'recording' || recStatus === 'paused') && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: recStatus === 'recording' ? '#f87171' : '#fbbf24' }}>
              <Circle size={10} fill="currentColor" />
              {recStatus === 'recording' ? 'REC' : 'PAUSED'} {fmtSec(presenterState?.recElapsedSec || 0)}
            </span>
          )}
          {recStatus === 'rehearsal' && (
            <span style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>
              REHEARSAL {fmtSec(presenterState?.totalElapsedSec || 0)}
            </span>
          )}
        </div>

        {/* Timers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: isOverTarget ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.9)', color: isOverTarget ? '#fbbf24' : '#e2e8f0', fontSize: 13, fontWeight: 700 }}>
            <Clock size={14} />
            <span>Q: {fmtSec(qSec)} / {fmtSec(targetSec)}</span>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(30,41,59,0.9)', fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
            Total: {fmtSec(presenterState?.totalElapsedSec || 0)}
          </div>
        </div>

        {/* Remote Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => sendCmd('prev')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.25)', background: '#1e293b', color: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>
            <ChevronLeft size={16} /> Prev
          </button>
          <button type="button" onClick={() => sendCmd('next')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Next <ChevronRight size={16} />
          </button>
          {(recStatus === 'recording' || recStatus === 'paused') && (
            <>
              <button type="button" onClick={() => sendCmd('toggle_pause')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' }}>
                {recStatus === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                {recStatus === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button type="button" onClick={() => sendCmd('stop_after_q')} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', background: presenterState?.stopAfterQuestion ? '#dc2626' : 'rgba(239,68,68,0.15)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                {presenterState?.stopAfterQuestion ? 'Stopping after Q' : 'Stop after Q'}
              </button>
              <button type="button" onClick={() => sendCmd('stop_rec')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                <Square size={14} /> Stop
              </button>
            </>
          )}
        </div>
      </header>

      {!code && (
        <div style={{ padding: 24, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}>
          <p style={{ margin: '0 0 12px', color: '#94a3b8' }}>Enter pairing code from stage window:</p>
          <input
            type="text"
            placeholder="4-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, background: '#1e293b', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
          />
        </div>
      )}

      {/* Main 3-Column Presenter Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.9fr', gap: 16, minHeight: 0 }}>
        {/* Col 1: Current Step + Next Step Preview */}
        <section style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(56,189,248,0.35)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 6 }}>
              Current Step ({(presenterState?.stepIndex ?? 0) + 1} / {presenterState?.totalSteps ?? 1})
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {presenterState?.currentStepTitle || 'Waiting for stage sync...'}
            </div>
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
              {presenterState?.currentStepSummary || ''}
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
              Next Step Preview
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#e2e8f0' }}>
              {presenterState?.nextStepTitle || 'End of current question'}
            </div>
            {presenterState?.nextStepSummary && (
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
                {presenterState.nextStepSummary}
              </div>
            )}
          </div>
        </section>

        {/* Col 2: Answer Key, Explanation & Teacher Notes */}
        <section style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(16,185,129,0.35)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: 6 }}>
              Answer Key & Explanation
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399', marginBottom: 8 }}>
              Answer: {presenterState?.currentQ?.correctOption || 'N/A'}
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.55, maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {presenterState?.currentQ?.explanation || 'No explanation provided.'}
            </div>
          </div>

          <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 6 }}>
              Teacher Notes (Private)
            </div>
            <textarea
              rows={6}
              value={noteText}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="Write private talking points or reminders for this question..."
              style={{ width: '100%', padding: 10, borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)', fontSize: 13, resize: 'vertical' }}
            />
          </div>
        </section>

        {/* Col 3: Question List & Chapter Timestamps */}
        <section style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
              Question List ({presenterState?.questions?.length || 0})
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {(presenterState?.questions || []).map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => sendCmd('jump', { qIndex: idx })}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: idx === presenterState?.qIndex ? '1px solid #38bdf8' : '1px solid rgba(148,163,184,0.15)',
                    background: idx === presenterState?.qIndex ? 'rgba(56,189,248,0.14)' : '#1e293b',
                    color: '#f8fafc',
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  <strong>#{idx + 1}</strong> {q.label}
                </button>
              ))}
            </div>
          </div>

          {Array.isArray(presenterState?.chapters) && presenterState.chapters.length > 0 && (
            <div style={{ padding: 16, borderRadius: 12, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', maxHeight: 200, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Chapters
              </div>
              {presenterState.chapters.map((ch, idx) => (
                <div key={idx} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 4 }}>
                  <code style={{ color: '#38bdf8' }}>{fmtSec(ch.sec)}</code> {ch.title}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
