'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Download,
  Trash2,
  Play,
  Copy,
  Check,
  Clock,
  Film,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  listVaultRecordings,
  deleteVaultRecording,
  clearAllVaultRecordings,
  formatDurationTimestamp,
  formatYouTubeChapters,
} from '@/lib/recordingVaultDb';
import CustomExternalContentModal from './CustomExternalContentModal';

export default function RecordingsVaultBanner() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewRec, setPreviewRec] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const loadVault = useCallback(async () => {
    setLoading(true);
    const items = await listVaultRecordings();
    setRecordings(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  useEffect(() => {
    if (!previewRec?.blob) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewRec.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewRec]);

  const handleDownload = (rec) => {
    if (!rec?.blob) return;
    const ext = (rec.mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    const safeTitle = (rec.title || 'UPSC-Recording')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const dateStr = new Date(rec.updatedAt || Date.now()).toISOString().slice(0, 10);
    const filename = `${safeTitle}-${dateStr}.${ext}`;

    const url = URL.createObjectURL(rec.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleCopyChapters = async (rec) => {
    const text = formatYouTubeChapters(rec.chapters || [], rec.title);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(rec.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cached recording from your browser storage?')) return;
    await deleteVaultRecording(id);
    if (previewRec?.id === id) setPreviewRec(null);
    loadVault();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all cached recordings from your browser storage?')) return;
    await clearAllVaultRecordings();
    setPreviewRec(null);
    loadVault();
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      <CustomExternalContentModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
      />

      {/* 1-Click External / Custom Content Studio Banner */}
      <div
        style={{
          marginTop: 28,
          padding: '22px 28px',
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16), rgba(236, 72, 153, 0.12))',
          border: '1.5px solid rgba(168, 85, 247, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17.5, fontWeight: 900, color: '#ffffff' }}>
              Want to Record Content Not on the Platform?
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#cbd5e1' }}>
              Paste any external MCQ, current affairs news, or coaching question and launch a formatted <strong>16:9 Lecture</strong> or <strong>9:16 Reel</strong> in 1 click.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          style={{
            padding: '12px 22px',
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
          <Sparkles size={16} />
          <span>Create 1-Click Custom Lecture / Reel</span>
        </button>
      </div>

      <section
        style={{
          marginTop: 28,
          padding: '28px 32px',
          borderRadius: 20,
          background: 'rgba(15, 23, 42, 0.78)',
          border: '1.5px solid rgba(244, 63, 94, 0.3)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: 'rgba(244, 63, 94, 0.16)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HardDrive size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Local Mac Recordings Vault (IndexedDB)
              </h3>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                0 GB Server Storage · 100% On-Device
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
              Recordings are automatically buffered here every 3 seconds for crash recovery and instant download to your Mac&apos;s Downloads folder.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={loadVault}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          {recordings.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={14} />
              <span>Clear Cache ({recordings.length})</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: 13.5, textAlign: 'center' }}>
          Checking local browser vault...
        </div>
      ) : recordings.length === 0 ? (
        <div
          style={{
            padding: '22px 24px',
            borderRadius: 14,
            background: 'rgba(30, 41, 59, 0.45)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#94a3b8',
            fontSize: 13.5,
          }}
        >
          <span>No cached recordings in browser storage yet. Launch a Recording Studio session above and hit Record!</span>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Max 8 recent takes auto-retained</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recordings.map((rec) => {
            const isRecoverable = rec.status === 'in_progress';
            const ext = (rec.mimeType || '').includes('mp4') ? 'MP4' : 'WEBM';
            return (
              <div
                key={rec.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 14,
                  background: isRecoverable ? 'rgba(245, 158, 11, 0.08)' : 'rgba(30, 41, 59, 0.65)',
                  border: isRecoverable
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: isRecoverable ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      color: isRecoverable ? '#fbbf24' : '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isRecoverable ? <AlertCircle size={20} /> : <Film size={20} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>
                        {rec.title || 'UPSC Studio Recording'}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#38bdf8',
                          fontSize: 10.5,
                          fontWeight: 800,
                        }}
                      >
                        {ext}
                      </span>
                      {isRecoverable && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          CRASH-RECOVERABLE AUTO-SAVE
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontSize: 12,
                        color: '#94a3b8',
                        marginTop: 4,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {formatDurationTimestamp(rec.durationSec)}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(rec.sizeBytes || rec.blob?.size)}</span>
                      <span>•</span>
                      <span>{(rec.chapters || []).length} Question Chapters</span>
                      <span>•</span>
                      <span>{new Date(rec.updatedAt || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewRec(rec)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(56, 189, 248, 0.14)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Play size={14} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyChapters(rec)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: copiedId === rec.id ? '#34d399' : '#cbd5e1',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {copiedId === rec.id ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedId === rec.id ? 'Chapters Copied!' : 'Copy YT Chapters'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(rec)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Download size={14} />
                    <span>Download .{ext.toLowerCase()}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rec.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete from Browser Cache"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewRec && previewUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setPreviewRec(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 920,
              background: '#0f172a',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.65)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {previewRec.title}
                </h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  Duration: {formatDurationTimestamp(previewRec.durationSec)} • Size: {formatBytes(previewRec.sizeBytes || previewRec.blob?.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewRec(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#cbd5e1',
                  width: 34,
                  height: 34,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <video
              src={previewUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                maxHeight: '58vh',
                borderRadius: 12,
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            />

            {Array.isArray(previewRec.chapters) && previewRec.chapters.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 6 }}>
                  Auto-Logged YouTube Chapters
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 10,
                    background: '#020617',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontSize: 12.5,
                    maxHeight: 120,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatYouTubeChapters(previewRec.chapters, previewRec.title)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
      </section>
    </>
  );
}
