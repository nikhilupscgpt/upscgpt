'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  Layers,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function SimilarPyqModal({
  isOpen,
  onClose,
  questionId,
  currentSimilarPyq,
  onSuccess,
}) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [attached, setAttached] = useState(currentSimilarPyq);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen || !questionId) return;

    let cancelled = false;
    async function loadCandidates() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/pyq/similar?questionId=${encodeURIComponent(questionId)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCandidates(data.candidates || []);
          setAttached(data.target?.currentSimilarPyq || currentSimilarPyq);
          if (data.target?.currentSimilarPyq?.keyTakeaway) {
            setCustomNote(data.target.currentSimilarPyq.keyTakeaway);
          }
        }
      } catch (err) {
        console.error('Failed to load candidate PYQs:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [isOpen, questionId, currentSimilarPyq]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/pyq/similar?q=${encodeURIComponent(searchQuery)}&questionId=${encodeURIComponent(questionId)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAttach = async (targetId, defaultNote = '') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/pyq/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'attach',
          questionId,
          targetId,
          keyTakeaway: customNote || defaultNote,
        }),
      });

      if (!res.ok) throw new Error('Attach failed');
      const data = await res.json();

      setAttached(data.similarPyq);
      setFeedback({ type: 'success', text: 'Similar PYQ attached and verified!' });
      if (onSuccess) onSuccess(data.similarPyq);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDetach = async (targetId) => {
    if (!window.confirm('Detach this similar question?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/pyq/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'detach',
          questionId,
          targetId,
        }),
      });

      if (!res.ok) throw new Error('Detach failed');

      setAttached(null);
      setCustomNote('');
      setFeedback({ type: 'success', text: 'Similar PYQ detached.' });
      if (onSuccess) onSuccess(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          background: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={18} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                Curate Question Family &amp; Similar PYQ
              </h3>
              <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                Question ID: {questionId}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '10px 16px',
              fontSize: 12.5,
              fontWeight: 600,
              background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: feedback.type === 'error' ? '#fca5a5' : '#86efac',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {feedback.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            {feedback.text}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Current Attached */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Current Attached Similar PYQ
            </div>

            {attached ? (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#0284c7', color: '#fff', padding: '2px 7px', borderRadius: 4 }}>
                      {attached.examName || 'UPSC CSE Pre'} {attached.examYear || ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                      {attached.targetId || attached.questionId}
                    </span>
                    {attached.isVerified ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '1px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '1px 6px', borderRadius: 4 }}>
                        ⚠️ AI Suggested
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDetach(attached.targetId || attached.questionId)}
                    disabled={actionLoading}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Detach
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.45 }}>
                  {attached.stem}
                </p>

                {attached.keyTakeaway && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24', fontStyle: 'italic' }}>
                    💡 Takeaway: {attached.keyTakeaway}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: 10, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                No similar question currently attached. Select a candidate below or search.
              </div>
            )}
          </div>

          {/* Pattern Takeaway Note Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
              Pattern Insight / Pedagogical Link (Shown to students):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Tests the statutory power under Article 110 vs. Article 117."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: 13,
              }}
            />
          </div>

          {/* 2. Engine Suggestions */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} color="#f59e0b" />
              Suggested Candidates (Deterministic Concept Overlap)
            </div>

            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                Scanning database for conceptual family matches...
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ padding: 14, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, fontSize: 12.5, color: '#64748b' }}>
                No automatic candidates found. Use the manual search below.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, background: '#1e293b', color: '#cbd5e1', padding: '1px 6px', borderRadius: 4 }}>
                          {cand.examName} {cand.examYear}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                          {cand.dedupHash}
                        </span>
                        <span style={{ fontSize: 11, color: '#f59e0b' }}>
                          ({cand.matchReason})
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8', lineHeight: 1.35 }}>
                        {cand.stem.slice(0, 130)}...
                      </p>
                    </div>

                    <button
                      onClick={() => handleAttach(cand.id, `Pattern predecessor: ${cand.matchReason}.`)}
                      disabled={actionLoading}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#0284c7',
                        border: 'none',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={13} /> Attach
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Manual Search across Platform */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Search Any PYQ by Keyword / Year / DedupHash
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Ramsar, Money Bill, 2018, Basic Structure..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: 13,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, background: '#1e293b', color: '#cbd5e1', padding: '1px 6px', borderRadius: 4 }}>
                          {res.examName} {res.examYear}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                          {res.dedupHash}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                          ({res.subject?.name || 'GS'})
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                        {res.stem.slice(0, 110)}...
                      </p>
                    </div>

                    <button
                      onClick={() => handleAttach(res.id, `Manual family link (${res.dedupHash}).`)}
                      disabled={actionLoading}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#0284c7',
                        border: 'none',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={13} /> Attach
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
