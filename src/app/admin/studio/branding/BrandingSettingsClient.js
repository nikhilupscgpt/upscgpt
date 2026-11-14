'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BrandingSettingsClient({ initialBranding }) {
  const [form, setForm] = useState(initialBranding);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const res = await fetch('/api/admin/studio/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || 'Failed to save branding');
      } else {
        setForm(data.branding);
        setStatus('Branding settings saved.');
      }
    } catch {
      setStatus('Network error saving branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 20px', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Present Mode Branding (Admin Only)</h1>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 14 }}>
            Controls corner logo, faculty label, and opening/closing cards across all recordings.
          </p>
        </div>
        <Link href="/admin/studio" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          ← Studio Hub
        </Link>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 16, background: '#0f172a', padding: 24, borderRadius: 16, border: '1px solid rgba(148,163,184,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Light stage logo ref
            <input
              type="text"
              value={form.logoLightRef}
              onChange={(e) => update('logoLightRef', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Dark stage logo ref
            <input
              type="text"
              value={form.logoDarkRef}
              onChange={(e) => update('logoDarkRef', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Opacity (0.15 – 1.0)
            <input
              type="number"
              step="0.05"
              min="0.15"
              max="1"
              value={form.opacity}
              onChange={(e) => update('opacity', Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Height (% of stage)
            <input
              type="number"
              step="0.5"
              min="2"
              max="8"
              value={form.heightPct}
              onChange={(e) => update('heightPct', Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Corner
            <select
              value={form.corner}
              onChange={(e) => update('corner', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.showUrl} onChange={(e) => update('showUrl', e.target.checked)} />
            Show upscgpt.in URL under logo
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.facultyMayToggleCards} onChange={(e) => update('facultyMayToggleCards', e.target.checked)} />
            Allow faculty to toggle opening/closing cards
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.facultyLabel} onChange={(e) => update('facultyLabel', e.target.checked)} />
            Show faculty name label for first {form.facultyLabelSec}s
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Faculty label duration (s)
            <input
              type="number"
              min="1"
              max="15"
              value={form.facultyLabelSec}
              onChange={(e) => update('facultyLabelSec', Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.openingCard} onChange={(e) => update('openingCard', e.target.checked)} />
            Enable opening card
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Opening card seconds
            <input
              type="number"
              min="1"
              max="10"
              value={form.openingSec}
              onChange={(e) => update('openingSec', Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
            <input type="checkbox" checked={form.closingCard} onChange={(e) => update('closingCard', e.target.checked)} />
            Enable closing card
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
            Closing card seconds (max 20)
            <input
              type="number"
              min="3"
              max="20"
              value={form.closingSec}
              onChange={(e) => update('closingSec', Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
          Closing card message
          <input
            type="text"
            value={form.closingText}
            onChange={(e) => update('closingText', e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.25)' }}
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save Branding Settings'}
          </button>
          {status && <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 600 }}>{status}</span>}
        </div>
      </form>
    </div>
  );
}
