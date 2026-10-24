'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  RefreshCw,
  Sparkles,
  Inbox,
  X,
} from 'lucide-react';

const SUBJECT_TEMPLATES = [
  { label: 'Studio & Lectures', subject: '🚀 New UPSC Lecture Studio & PYQ Breakdowns Available on UPSCGPT' },
  { label: 'Mapping & Atlas', subject: '🗺️ Interactive Mapping Atlas & River Systems Updated for Prelims 2026' },
  { label: 'Prelims Strategy', subject: '📢 High-Yield Topic Revision & Prelims Pass Features' },
  { label: 'Pro Access Notice', subject: '✨ Welcome to UPSCGPT Pro · Your Subscription is Active' },
];

export default function CommsAdminClient({ prefillEmail = '', onClearPrefill = null }) {
  const [data, setData] = useState({
    counts: { ALL: 0, PRO: 0, FREE: 0 },
    provider: { provider: 'SIMULATION', configured: false, sender: '' },
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Composer Form
  const [recipientType, setRecipientType] = useState(prefillEmail ? 'CUSTOM' : 'ALL');
  const [customEmail, setCustomEmail] = useState(prefillEmail);
  const [type, setType] = useState('ANNOUNCEMENT');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Sync if prefillEmail changes from outside
  useEffect(() => {
    if (prefillEmail) {
      setRecipientType('CUSTOM');
      setCustomEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const fetchCommsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/comms/send');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load comms data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommsData();
  }, [fetchCommsData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please enter message content.');
      return;
    }
    if (recipientType === 'CUSTOM' && !customEmail.trim()) {
      alert('Please provide a valid recipient email address.');
      return;
    }

    const targetLabel = recipientType === 'CUSTOM'
      ? customEmail
      : `${recipientType} users (${data.counts[recipientType] || 0} recipients)`;

    const confirmMsg = `Send email to ${targetLabel}?\n\nSubject: ${subject || 'Default Subject'}`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setSending(true);
      setStatusMessage(null);

      const payload = {
        channel: 'EMAIL',
        type,
        subject: subject.trim() || undefined,
        content: content.trim(),
        recipients: recipientType === 'CUSTOM' ? [customEmail.trim()] : recipientType,
      };

      const res = await fetch('/api/admin/comms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: result.simulatedCount > 0
            ? `Dispatched! ${result.totalCount} emails processed (${result.simulatedCount} in Simulation Mode). Terminal logs generated.`
            : `Dispatched successfully to ${result.sentCount} recipients!`,
        });
        // Clear message body
        setContent('');
        setSubject('');
        fetchCommsData();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to dispatch emails.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error sending emails.',
      });
    } finally {
      setSending(false);
    }
  };

  const isSimulated = !data.provider?.configured;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Banner / Provider Configuration Status */}
      <div style={{
        padding: '20px 24px',
        borderRadius: 20,
        background: isSimulated ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: `1.5px solid ${isSimulated ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isSimulated ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSimulated ? '#fbbf24' : '#34d399',
            flexShrink: 0,
          }}>
            {isSimulated ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                {isSimulated ? 'Email Engine: Simulation Mode Active' : `Email Engine: Connected (${data.provider.provider})`}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 6,
                background: isSimulated ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                color: isSimulated ? '#fde047' : '#6ee7b7',
              }}>
                {isSimulated ? 'LOCAL TEST MOCK' : 'LIVE DELIVERY READY'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5 }}>
              {isSimulated ? (
                <>
                  All outgoing user communications &amp; login OTPs are logged directly to the server terminal &amp; CommunicationLog.
                  Whenever you wish to send real emails to student inboxes, simply provide your <strong>GMAIL_USER / GMAIL_PASS</strong> (Google App Password) or <strong>RESEND_API_KEY</strong> in <code>.env</code>.
                </>
              ) : (
                <>
                  Outbound email sender configured as <code>{data.provider.sender}</code>. Real emails will be delivered directly to inboxes.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={fetchCommsData}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
          }}
          title="Refresh Data"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {statusMessage && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 14,
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700 }}>
            {statusMessage.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Composer & Log Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
        {/* Left Column: Email Composer */}
        <section style={{
          background: 'var(--bg-secondary)',
          padding: '30px',
          borderRadius: 24,
          border: '1px solid var(--card-border)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={22} color="#3b82f6" />
              <span>Compose Outbound Email</span>
            </h2>
            <button
              type="button"
              onClick={() => setPreviewMode(p => !p)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: previewMode ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Eye size={14} />
              <span>{previewMode ? 'Edit Mode' : 'Preview Email'}</span>
            </button>
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Audience Segment Selection */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Target Audience Segment
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { key: 'ALL', label: 'All Users', count: data.counts.ALL },
                  { key: 'PRO', label: 'Pro Pass', count: data.counts.PRO },
                  { key: 'FREE', label: 'Free Tier', count: data.counts.FREE },
                  { key: 'CUSTOM', label: 'Individual', count: null },
                ].map((aud) => (
                  <button
                    key={aud.key}
                    type="button"
                    onClick={() => {
                      setRecipientType(aud.key);
                      if (aud.key !== 'CUSTOM' && onClearPrefill) onClearPrefill();
                    }}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 12,
                      border: `1.5px solid ${recipientType === aud.key ? '#3b82f6' : 'var(--card-border)'}`,
                      background: recipientType === aud.key ? 'rgba(59, 130, 246, 0.18)' : 'rgba(0,0,0,0.15)',
                      color: recipientType === aud.key ? '#60a5fa' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{aud.label}</span>
                    {aud.count !== null && (
                      <span style={{ fontSize: 11, opacity: 0.75 }}>({aud.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Email Input (if individual selected) */}
            {recipientType === 'CUSTOM' && (
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                  Student Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="e.g. aspirant@example.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--card-border)',
                    background: 'rgba(0,0,0,0.25)',
                    color: '#ffffff',
                    fontSize: 14,
                  }}
                />
              </div>
            )}

            {/* Category / Type Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Communication Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--card-border)',
                  background: 'rgba(0,0,0,0.25)',
                  color: '#ffffff',
                  fontSize: 14,
                }}
              >
                <option value="ANNOUNCEMENT">Platform Announcement &amp; Strategy</option>
                <option value="FEATURE_UPDATE">New Feature / Lecture Release</option>
                <option value="STUDY_MATERIAL">Study Material &amp; PYQ Update</option>
                <option value="EXAM_ALERT">UPSC Prelims Notification / Alert</option>
                <option value="DIRECT_SUPPORT">Direct Student Communication</option>
              </select>
            </div>

            {/* Quick Templates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                <Sparkles size={13} color="#f59e0b" />
                <span>Quick Subject Presets</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SUBJECT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSubject(tmpl.subject)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#cbd5e1',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Line Input */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Email Subject
              </label>
              <input
                required
                type="text"
                placeholder="Subject of the email"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--card-border)',
                  background: 'rgba(0,0,0,0.25)',
                  color: '#ffffff',
                  fontSize: 14.5,
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Content / Message Body */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Message Content
              </label>

              {previewMode ? (
                /* Interactive Preview */
                <div style={{
                  padding: '24px',
                  borderRadius: 16,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  background: '#0b1120',
                  color: '#f1f5f9',
                  minHeight: 220,
                }}>
                  <div style={{ paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>To: {recipientType === 'CUSTOM' ? customEmail : `${recipientType} Users`}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
                      {subject || '(No Subject)'}
                    </div>
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                    {content || 'Message preview will appear here...'}
                  </div>
                  <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#64748b' }}>
                    UPSCGPT Knowledge Systems · upscgpt.in
                  </div>
                </div>
              ) : (
                <textarea
                  required
                  rows={8}
                  placeholder="Write your email announcement or message to users here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 14,
                    border: '1px solid var(--card-border)',
                    background: 'rgba(0,0,0,0.25)',
                    color: '#ffffff',
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              )}
            </div>

            {/* Send Action Button */}
            <button
              type="submit"
              disabled={sending}
              style={{
                padding: '16px 24px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 800,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Send size={18} />
              <span>{sending ? 'Dispatching...' : `Dispatch ${recipientType === 'CUSTOM' ? 'Email' : 'Broadcast'}`}</span>
            </button>
          </form>
        </section>

        {/* Right Column: Communication History / Audit Logs */}
        <section style={{
          background: 'var(--bg-secondary)',
          padding: '30px',
          borderRadius: 24,
          border: '1px solid var(--card-border)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          maxHeight: 740,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={20} color="#38bdf8" />
              <span>Recent Activity ({data.recentLogs?.length || 0})</span>
            </h2>
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
            {!data.recentLogs || data.recentLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                <Inbox size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 13.5 }}>No communications dispatched yet.</p>
              </div>
            ) : (
              data.recentLogs.map((log) => {
                const isSent = log.status === 'SENT';
                const isSim = log.status === 'SIMULATED' || log.status === 'SENT_MOCK';
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--card-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#f1f5f9' }}>
                        {log.recipient}
                      </span>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 6,
                        background: isSent ? 'rgba(34, 197, 94, 0.2)' : (isSim ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
                        color: isSent ? '#4ade80' : (isSim ? '#facc15' : '#f87171'),
                        textTransform: 'uppercase',
                      }}>
                        {log.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.4 }}>
                      {log.content}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      <span>{log.type} · {log.channel}</span>
                      <span>{new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
