'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  UploadCloud,
  Plus,
  Edit3,
  Trash2,
  Search,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SAMPLE_PIN_JSONL = JSON.stringify({
  id: 'PIN-2026-10-001',
  slug: 'sauj-jheel-uttar-pradesh',
  date: '2026-10-15',
  targetExamYear: 2027,
  subject: 'Environment',
  mapCategory: ['Wetlands & Ramsar sites', 'India – rivers, lakes, reservoirs & glaciers'],
  hookCategory: '3. New or changed protected area',
  priority: 'High',
  place: 'Sauj Jheel',
  aliases: ['Sauj Lake'],
  placeType: 'Ramsar site',
  regionScope: 'India',
  locatedIn: {
    country: 'India',
    stateOrProvince: 'Uttar Pradesh',
    district: 'Mainpuri',
  },
  coordinates: {
    lat: 27.0167,
    lng: 79.1333,
  },
  neighbours: [
    'Saman Bird Sanctuary (Mainpuri district, UP)',
    'Ganga River floodplain (Upper Ganga Basin)',
  ],
  staticFacts: [
    'Shallow freshwater depressional wetland located in the Ganga River floodplain',
    'Makes Mainpuri the only district in Uttar Pradesh to house two Ramsar sites',
  ],
  newsTriggers: [
    {
      date: '2026-10-15',
      source: 'PIB',
      url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2324120',
      newsHook:
        "Designated as a Ramsar site of international importance, taking India's tally to 103.",
    },
  ],
  upscAngle: {
    preferredFormat: 'Pair-matching | How-many',
    framing:
      'Consider the following pairs (Wetland/Lake : Location in State) on the exact pattern of UPSC 2022.',
    distractorPool: [
      'Bihar',
      'Madhya Pradesh',
      'Bakhira Wildlife Sanctuary',
      'Haiderpur Wetland',
    ],
  },
  similarPYQ: ['ENV-UPSC-2022-01', 'ENV-UPSC-2014-09', 'ENV-UPSC-2019-18'],
});

const EMPTY_FORM = {
  place: '',
  slug: '',
  pinId: '',
  isPin: true,
  pillar: 'PIN',
  date: new Date().toISOString().split('T')[0],
  targetExamYear: 2027,
  regionScope: 'India',
  priority: 'High',
  subject: 'Geography',
  placeType: '',
  hookCategory: '',
  lat: '',
  lng: '',
  country: 'India',
  stateOrProvince: '',
  district: '',
  mapCategory: [],
  aliasesText: '',
  neighboursText: '',
  staticFactsText: '',
  newsTriggers: [
    {
      date: new Date().toISOString().split('T')[0],
      source: 'PIB',
      url: '',
      newsHook: '',
    },
  ],
  preferredFormat: 'Pair-matching | Statement-based',
  framing: '',
  distractorPoolText: '',
  similarPyqText: '',
};

export default function PinAdminClient({ embedded = false }) {
  const [jsonlText, setJsonlText] = useState('');
  const [bulkOpen, setBulkOpen] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  const [statusData, setStatusData] = useState({
    pinCount: 0,
    staticCount: 0,
    totalCount: 0,
    pyqCount: 0,
    recentPins: [],
    taxonomy: { subjects: [], mapCategories: [] },
  });
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Registry Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [pillarFilter, setPillarFilter] = useState('ALL'); // 'ALL' | 'PIN' | 'STATIC'

  // Individual Editor Form State
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savingForm, setSavingForm] = useState(false);
  const [formBanner, setFormBanner] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/pin/ingest');
      const data = await res.json();
      if (res.ok) {
        setStatusData(data);
      }
    } catch (err) {
      console.error('Failed to fetch PIN status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setJsonlText(text);
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleIngest = async () => {
    if (!jsonlText.trim()) return;
    setIngesting(true);
    setIngestResult(null);

    try {
      const res = await fetch('/api/admin/pin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pin',
          jsonl: jsonlText,
        }),
      });
      const data = await res.json();
      setIngestResult({ ok: res.ok, ...data });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      setIngestResult({ ok: false, error: err.message });
    } finally {
      setIngesting(false);
    }
  };

  const handleEditEntry = (item) => {
    setEditingSlug(item.slug);
    setFormBanner(null);
    setForm({
      place: item.place || '',
      slug: item.slug || '',
      pinId: item.pinId || '',
      isPin: item.isPin !== false,
      pillar: item.pillar || (item.isPin !== false ? 'PIN' : 'INDIA_STATIC'),
      date: item.date || new Date().toISOString().split('T')[0],
      targetExamYear: item.targetExamYear || 2027,
      regionScope: item.regionScope || 'India',
      priority: item.priority || 'High',
      subject: item.subject || 'Geography',
      placeType: item.placeType || '',
      hookCategory: item.hookCategory || '',
      lat: item.lat !== null && item.lat !== undefined ? String(item.lat) : '',
      lng: item.lng !== null && item.lng !== undefined ? String(item.lng) : '',
      country: item.locatedIn?.country || (item.regionScope === 'World' ? '' : 'India'),
      stateOrProvince: item.locatedIn?.stateOrProvince || '',
      district: item.locatedIn?.district || '',
      mapCategory: Array.isArray(item.mapCategory) ? item.mapCategory : [],
      aliasesText: (item.aliases || []).join(', '),
      neighboursText: (item.neighbours || []).join('\n'),
      staticFactsText: (item.staticFacts || []).join('\n'),
      newsTriggers:
        Array.isArray(item.newsTriggers) && item.newsTriggers.length > 0
          ? item.newsTriggers.map((t) => ({
              date: t.date || '',
              source: t.source || '',
              url: t.url || '',
              newsHook: t.newsHook || '',
            }))
          : [
              {
                date: item.date || new Date().toISOString().split('T')[0],
                source: 'PIB',
                url: '',
                newsHook: '',
              },
            ],
      preferredFormat: item.upscAngle?.preferredFormat || '',
      framing: item.upscAngle?.framing || '',
      distractorPoolText: (item.upscAngle?.distractorPool || []).join(', '),
      similarPyqText: (item.similarPYQ || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFormBanner(null);
  };

  const handleToggleMapCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.mapCategory.includes(cat);
      return {
        ...prev,
        mapCategory: exists
          ? prev.mapCategory.filter((c) => c !== cat)
          : [...prev.mapCategory, cat],
      };
    });
  };

  const handleTriggerChange = (idx, field, value) => {
    setForm((prev) => {
      const copy = [...prev.newsTriggers];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, newsTriggers: copy };
    });
  };

  const handleAddTrigger = () => {
    setForm((prev) => ({
      ...prev,
      newsTriggers: [
        ...prev.newsTriggers,
        {
          date: new Date().toISOString().split('T')[0],
          source: 'The Hindu',
          url: '',
          newsHook: '',
        },
      ],
    }));
  };

  const handleRemoveTrigger = (idx) => {
    setForm((prev) => ({
      ...prev,
      newsTriggers: prev.newsTriggers.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!form.place.trim()) return;

    setSavingForm(true);
    setFormBanner(null);

    const payload = {
      place: form.place.trim(),
      slug:
        form.slug.trim() ||
        form.place
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      pinId: form.pinId.trim(),
      isPin: form.isPin,
      pillar: form.pillar,
      date: form.date,
      targetExamYear: Number(form.targetExamYear) || 2027,
      regionScope: form.regionScope,
      priority: form.priority,
      subject: form.subject,
      placeType: form.placeType.trim(),
      hookCategory: form.hookCategory.trim(),
      lat: form.lat !== '' ? Number(form.lat) : null,
      lng: form.lng !== '' ? Number(form.lng) : null,
      locatedIn: {
        country: form.country.trim(),
        stateOrProvince: form.stateOrProvince.trim(),
        district: form.district.trim(),
      },
      mapCategory: form.mapCategory,
      aliases: form.aliasesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      neighbours: form.neighboursText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      staticFacts: form.staticFactsText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      newsTriggers: form.newsTriggers.filter(
        (t) => t.newsHook?.trim() || t.url?.trim()
      ),
      upscAngle: {
        preferredFormat: form.preferredFormat.trim(),
        framing: form.framing.trim(),
        distractorPool: form.distractorPoolText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      similarPYQ: form.similarPyqText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch('/api/admin/pin/ingest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFormBanner({
          ok: true,
          msg: editingSlug
            ? `Updated "${payload.place}" (${payload.slug}) successfully!`
            : `Created "${payload.place}" (${payload.slug}) successfully!`,
        });
        setEditingSlug(payload.slug);
        await fetchStatus();
      } else {
        setFormBanner({
          ok: false,
          msg: data.error || 'Failed to save entry.',
        });
      }
    } catch (err) {
      setFormBanner({
        ok: false,
        msg: err.message || 'Network error while saving.',
      });
    } finally {
      setSavingForm(false);
    }
  };

  const handleDeletePin = async (item) => {
    const label = item.isStaticOverride
      ? `Reset custom DB edits for Static Foundation entry "${item.place}" back to default?`
      : `Delete Place in News "${item.place}" (${item.slug})?`;
    if (!window.confirm(label)) return;
    try {
      const res = await fetch(`/api/admin/pin/ingest?slug=${encodeURIComponent(item.slug)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (editingSlug === item.slug) {
          handleResetForm();
        }
        await fetchStatus();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleNuclearWipe = async () => {
    if (
      !window.confirm(
        '⚠️ ATTENTION: This will PERMANENTLY delete all ingested Places in News (PIN) and custom DB overrides. Are you sure?'
      )
    )
      return;
    if (!window.confirm('FINAL CONFIRMATION: Wipe the entire PIN database registry?')) return;

    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch('/api/admin/pin/ingest?all=true', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.deletedAll) {
        handleResetForm();
        setIngestResult({
          ok: true,
          wiped: true,
          deletedCount: data.deletedCount,
        });
        await fetchStatus();
      } else {
        setIngestResult({ ok: false, error: data.error || 'Wipe failed' });
      }
    } catch (err) {
      setIngestResult({ ok: false, error: err.message });
    } finally {
      setIngesting(false);
    }
  };

  const filteredPins = (statusData.recentPins || []).filter((p) => {
    if (pillarFilter === 'PIN' && !p.isPin) return false;
    if (pillarFilter === 'STATIC' && p.isPin) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      (p.place || '').toLowerCase().includes(q) ||
      (p.slug || '').toLowerCase().includes(q) ||
      (p.subject || '').toLowerCase().includes(q) ||
      (p.placeType || '').toLowerCase().includes(q) ||
      (p.locatedIn?.stateOrProvince || '').toLowerCase().includes(q) ||
      (p.similarPYQ || []).some((id) => id.toLowerCase().includes(q))
    );
  });

  const subjectsList =
    statusData.taxonomy?.subjects?.length > 0
      ? statusData.taxonomy.subjects
      : [
          'Geography',
          'Environment',
          'Art & Culture',
          'Ancient History',
          'International Relations',
          'Agriculture',
          'Modern History',
          'Economy',
          'Medieval History',
        ];

  const categoriesList =
    statusData.taxonomy?.mapCategories?.length > 0
      ? statusData.taxonomy.mapCategories
      : [
          'World – places in news',
          'World – countries, borders & seas',
          'World – physical features',
          'India – relief, hills, coasts & islands',
          'India – rivers, lakes, reservoirs & glaciers',
          'Protected areas (NPs, WLS, tiger reserves)',
          'Wetlands & Ramsar sites',
          'Landforms & volcanoes',
          'Minerals & resources by place',
          'Energy & industrial sites',
          'Ports, highways & corridors',
          'Strategic projects abroad',
          'Tribes, communities & cultural places',
          'Historical & archaeological sites',
        ];

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: '#090d16',
    color: '#f8fafc',
    fontSize: 13,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
    marginBottom: 5,
  };

  return (
    <div
      style={
        embedded
          ? { color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }
          : {
              minHeight: '100vh',
              background: '#0b0f19',
              color: '#f8fafc',
              padding: '28px 32px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }
      }
    >
      <div style={{ maxWidth: embedded ? '100%' : 1360, margin: '0 auto' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#38bdf8',
                marginBottom: 4,
              }}
            >
              MAPPING & PLACES IN NEWS (PIN) ENGINE
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Geographic & PIN Content Studio
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>
              Create, edit, or bulk-ingest Places in News (PIN) and Static Foundation mapping nodes with live PYQ linkages.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!embedded && (
              <Link
                href="/admin"
                style={{
                  padding: '9px 15px',
                  borderRadius: 9,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0',
                  textDecoration: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                ← Control Center
              </Link>
            )}
            <button
              type="button"
              onClick={() => setBulkOpen((v) => !v)}
              style={{
                padding: '9px 16px',
                borderRadius: 9,
                background: bulkOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <UploadCloud size={15} />
              <span>Bulk JSONL UPSERT</span>
              {bulkOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <Link
              href="/atlas"
              style={{
                padding: '9px 16px',
                borderRadius: 9,
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🗺️ Open Live Atlas</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Places in News (PIN)
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
              {loadingStatus ? '...' : statusData.pinCount}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
              Current affairs triggers
            </div>
          </div>

          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Static Foundation Nodes
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#a855f7', marginTop: 4 }}>
              {loadingStatus ? '...' : statusData.staticCount}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
              India, World & IR core sites
            </div>
          </div>

          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Active Map Nodes
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {loadingStatus ? '...' : statusData.totalCount}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
              All editable in Registry
            </div>
          </div>
        </div>

        {/* Collapsible Bulk JSONL Ingestion Panel */}
        {bulkOpen && (
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#38bdf8' }}>
                  📦 Bulk Places in News (.jsonl) UPSERT Pipeline
                </h3>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Matches on <code>slug</code>. Appends new <code>newsTriggers</code>, merges <code>staticFacts</code> &amp; <code>similarPYQ</code>, and updates priority.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setJsonlText(SAMPLE_PIN_JSONL)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 7,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#cbd5e1',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Load Sample (Sauj Jheel)
                </button>
                <label
                  style={{
                    padding: '6px 13px',
                    borderRadius: 7,
                    border: '1px dashed rgba(56, 189, 248, 0.5)',
                    background: 'rgba(56, 189, 248, 0.08)',
                    color: '#38bdf8',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📂 Upload .jsonl File
                  <input
                    type="file"
                    accept=".jsonl,.json,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <textarea
              value={jsonlText}
              onChange={(e) => setJsonlText(e.target.value)}
              placeholder="Paste minified .jsonl lines (one JSON object per line) or upload daily_pin_ingest.jsonl..."
              rows={6}
              style={{
                width: '100%',
                background: '#090d16',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: 12,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                lineHeight: 1.5,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                disabled={ingesting}
                onClick={handleNuclearWipe}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: ingesting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                <span>Wipe PIN Registry (Nuclear)</span>
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                {jsonlText && (
                  <button
                    type="button"
                    onClick={() => {
                      setJsonlText('');
                      setIngestResult(null);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  disabled={ingesting || !jsonlText.trim()}
                  onClick={handleIngest}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: ingesting || !jsonlText.trim() ? '#334155' : '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: ingesting || !jsonlText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {ingesting ? 'Running UPSERT...' : '🚀 Run Bulk PIN UPSERT'}
                </button>
              </div>
            </div>

            {ingestResult && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 9,
                  background: ingestResult.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.12)',
                  border: ingestResult.ok
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: 13,
                }}
              >
                {ingestResult.error ? (
                  <div style={{ color: '#f87171', fontWeight: 600 }}>❌ Error: {ingestResult.error}</div>
                ) : ingestResult.wiped ? (
                  <div style={{ fontWeight: 700, color: '#34d399' }}>
                    🗑️ PIN Registry Wiped — Removed {ingestResult.deletedCount} database entries.
                  </div>
                ) : (
                  <div style={{ fontWeight: 700, color: '#34d399' }}>
                    ✅ PIN Ingestion Complete — Parsed: {ingestResult.totalParsed} | New Inserted:{' '}
                    {ingestResult.insertedCount} | Existing Merged: {ingestResult.updatedCount} | Errors:{' '}
                    {ingestResult.errorCount}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main 2-Column Workspace: Left = Visual Editor Form, Right = Live Registry */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: FULL VISUAL EDITOR FORM */}
          <div
            style={{
              background: '#111827',
              border: editingSlug
                ? '1.5px solid rgba(56, 189, 248, 0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 22,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editingSlug ? (
                  <Edit3 size={18} color="#38bdf8" />
                ) : (
                  <Plus size={18} color="#10b981" />
                )}
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                    {editingSlug ? `Editing: ${form.place}` : 'Create New Mapping / PIN Entry'}
                  </h2>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    {editingSlug
                      ? `Slug: ${editingSlug} • Changes save directly to live Atlas`
                      : 'Fill out geographical pointers, triggers, and linked PYQ IDs'}
                  </div>
                </div>
              </div>

              {editingSlug && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#cbd5e1',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Plus size={13} /> New Entry
                </button>
              )}
            </div>

            {formBanner && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: formBanner.ok
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                  border: formBanner.ok
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                  color: formBanner.ok ? '#34d399' : '#f87171',
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {formBanner.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{formBanner.msg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Row 1: Entry Mode (PIN vs Static) + Scope + Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Entry Pillar</label>
                  <select
                    value={form.isPin ? 'PIN' : form.pillar || 'INDIA_STATIC'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'PIN') {
                        setForm({ ...form, isPin: true, pillar: 'PIN' });
                      } else {
                        setForm({ ...form, isPin: false, pillar: val });
                      }
                    }}
                    style={inputStyle}
                  >
                    <option value="PIN">📍 Place in News (PIN)</option>
                    <option value="INDIA_STATIC">🇮🇳 India Static Foundation</option>
                    <option value="WORLD_STATIC">🌍 World Static Foundation</option>
                    <option value="IR">🌐 IR & Strategic Geopolitics</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Region Scope</label>
                  <select
                    value={form.regionScope}
                    onChange={(e) => setForm({ ...form, regionScope: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="India">India</option>
                    <option value="World">World</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="High">🔥 High</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">📌 Low</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Place Name + Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Place / Feature Name *</label>
                  <input
                    required
                    placeholder="e.g. Bannerghatta National Park"
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Slug (Unique URL Key)</label>
                  <input
                    placeholder="Auto-generated if blank"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
              </div>

              {/* Row 3: Subject + Place Type + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 0.9fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    style={inputStyle}
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Place Type</label>
                  <input
                    placeholder="e.g. National Park, Ramsar site, Strait"
                    value={form.placeType}
                    onChange={(e) => setForm({ ...form, placeType: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Trigger Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 4: Coordinates + Location Hierarchy */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.8fr 1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="12.800"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="77.577"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input
                    placeholder="India"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>State / Province</label>
                  <input
                    placeholder="Karnataka"
                    value={form.stateOrProvince}
                    onChange={(e) => setForm({ ...form, stateOrProvince: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>District / Basin</label>
                  <input
                    placeholder="Bengaluru Urban"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 5: Map Categories Multi-Select Pills */}
              <div>
                <label style={labelStyle}>
                  Map Categories ({form.mapCategory.length} selected)
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: 10,
                    borderRadius: 10,
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {categoriesList.map((cat) => {
                    const active = form.mapCategory.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleMapCategory(cat)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 6,
                          border: active
                            ? '1px solid #38bdf8'
                            : '1px solid rgba(255,255,255,0.1)',
                          background: active
                            ? 'rgba(56, 189, 248, 0.2)'
                            : 'rgba(255,255,255,0.03)',
                          color: active ? '#38bdf8' : '#94a3b8',
                          fontSize: 11,
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Static Geographical Pointers */}
              <div>
                <label style={labelStyle}>
                  Static Geographical Pointers (One bullet point per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Located in the hills of the Anekal range along the Suvarnamukhi stream (Cauvery basin)&#10;Forms a critical wildlife corridor connecting the Biligiriranga Hills (BR Hills) and Sathyamangalam Tiger Reserve"
                  value={form.staticFactsText}
                  onChange={(e) => setForm({ ...form, staticFactsText: e.target.value })}
                  style={{ ...inputStyle, lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>

              {/* Row 7: Surrounding / Neighbours & Aliases */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Surrounding / Neighbours (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Cauvery Wildlife Sanctuary (South)&#10;Sathyamangalam Tiger Reserve"
                    value={form.neighboursText}
                    onChange={(e) => setForm({ ...form, neighboursText: e.target.value })}
                    style={{ ...inputStyle, lineHeight: 1.45, resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Aliases / Alternate Names (Comma separated)</label>
                  <textarea
                    rows={3}
                    placeholder="Bannerghatta Biological Park, BBP"
                    value={form.aliasesText}
                    onChange={(e) => setForm({ ...form, aliasesText: e.target.value })}
                    style={{ ...inputStyle, lineHeight: 1.45, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Row 8: News Triggers */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <label style={{ ...labelStyle, color: '#fbbf24', marginBottom: 0 }}>
                    📰 Why in News Triggers ({form.newsTriggers.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTrigger}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Trigger
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {form.newsTriggers.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        background: '#090d16',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 1fr auto', gap: 8 }}>
                        <input
                          type="date"
                          value={t.date}
                          onChange={(e) => handleTriggerChange(idx, 'date', e.target.value)}
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                        />
                        <input
                          placeholder="Source (PIB / TH)"
                          value={t.source}
                          onChange={(e) => handleTriggerChange(idx, 'source', e.target.value)}
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                        />
                        <input
                          placeholder="Source URL (optional)"
                          value={t.url}
                          onChange={(e) => handleTriggerChange(idx, 'url', e.target.value)}
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: 12 }}
                        />
                        {form.newsTriggers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTrigger(idx)}
                            style={{
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#f87171',
                              borderRadius: 6,
                              padding: '0 8px',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        placeholder="News hook summary (e.g. MoEFCC rationalized Eco-Sensitive Zone around Bannerghatta National Park)..."
                        value={t.newsHook}
                        onChange={(e) => handleTriggerChange(idx, 'newsHook', e.target.value)}
                        style={{ ...inputStyle, padding: '7px 10px', fontSize: 12.5 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 9: UPSC Framing & Curated PYQ IDs */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div>
                  <label style={{ ...labelStyle, color: '#34d399' }}>
                    📖 Linked PYQ Question IDs (Comma-separated 1:1 Curated IDs)
                  </label>
                  <input
                    placeholder="e.g. ENV-UPSC-2020-13, ENV-UPSC-2017-11, GEO-UPSC-2023-09"
                    value={form.similarPyqText}
                    onChange={(e) => setForm({ ...form, similarPyqText: e.target.value })}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12.5 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>UPSC Preferred Format</label>
                    <input
                      placeholder="Pair-matching | Basin-identification"
                      value={form.preferredFormat}
                      onChange={(e) => setForm({ ...form, preferredFormat: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Distractor Pool (Comma-separated)</label>
                    <input
                      placeholder="Nagarhole, Bandipur, Mudumalai"
                      value={form.distractorPoolText}
                      onChange={(e) => setForm({ ...form, distractorPoolText: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>UPSC Question Framing Angle</label>
                  <textarea
                    rows={2}
                    placeholder="How UPSC frames questions on this place / feature..."
                    value={form.framing}
                    onChange={(e) => setForm({ ...form, framing: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={savingForm}
                  style={{
                    flex: 1,
                    padding: '13px 20px',
                    borderRadius: 11,
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: savingForm ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Save size={16} />
                  <span>
                    {savingForm
                      ? 'Saving to Database...'
                      : editingSlug
                        ? 'Save Changes to Entry'
                        : 'Create Mapping Entry'}
                  </span>
                </button>
                {editingSlug && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    style={{
                      padding: '13px 18px',
                      borderRadius: 11,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: LIVE REGISTRY WITH SEARCH, PILLAR TABS, EDIT & DELETE */}
          <div
            style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 1150,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Live Map Registry ({filteredPins.length})
              </h2>
              <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                Click ✏️ to load &amp; edit
              </span>
            </div>

            {/* Pillar Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[
                { id: 'ALL', label: `All (${statusData.totalCount || 0})` },
                { id: 'PIN', label: `📍 PIN (${statusData.pinCount || 0})` },
                { id: 'STATIC', label: `🏛️ Static (${statusData.staticCount || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPillarFilter(tab.id)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: 8,
                    border:
                      pillarFilter === tab.id
                        ? '1px solid #38bdf8'
                        : '1px solid rgba(255,255,255,0.08)',
                    background:
                      pillarFilter === tab.id
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(255,255,255,0.03)',
                    color: pillarFilter === tab.id ? '#38bdf8' : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search place, state, subject, or PYQ ID (e.g. Bannerghatta)..."
                style={{
                  ...inputStyle,
                  paddingLeft: 36,
                }}
              />
            </div>

            {/* Scrollable Registry Cards */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingRight: 4,
              }}
            >
              {filteredPins.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: 13,
                  }}
                >
                  No matching entries found.
                </div>
              ) : (
                filteredPins.map((p) => {
                  const isSelected = editingSlug === p.slug;
                  return (
                    <div
                      key={p.slug}
                      style={{
                        padding: '13px 14px',
                        borderRadius: 12,
                        background: isSelected
                          ? 'rgba(56, 189, 248, 0.1)'
                          : 'rgba(255,255,255,0.025)',
                        border: isSelected
                          ? '1.5px solid #38bdf8'
                          : '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc' }}>
                            {p.place}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: p.isPin
                                ? 'rgba(56, 189, 248, 0.16)'
                                : 'rgba(168, 85, 247, 0.16)',
                              color: p.isPin ? '#38bdf8' : '#c084fc',
                            }}
                          >
                            {p.isPin ? 'PIN' : p.pillar || 'STATIC'}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background:
                                p.priority === 'High'
                                  ? 'rgba(239, 68, 68, 0.18)'
                                  : 'rgba(245, 158, 11, 0.18)',
                              color: p.priority === 'High' ? '#f87171' : '#fbbf24',
                            }}
                          >
                            {p.priority}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: 11.5,
                            color: '#94a3b8',
                            marginTop: 4,
                          }}
                        >
                          {p.subject} • {p.placeType || p.regionScope}
                          {p.locatedIn?.stateOrProvince
                            ? ` • ${p.locatedIn.stateOrProvince}`
                            : ''}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 5,
                            marginTop: 6,
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            📌 {(p.staticFacts || []).length} facts
                          </span>
                          {p.isPin && (
                            <span style={{ fontSize: 11, color: '#64748b' }}>
                              • 📰 {Array.isArray(p.newsTriggers) ? p.newsTriggers.length : 0} triggers
                            </span>
                          )}
                          {(p.similarPYQ || []).length > 0 && (
                            <span
                              style={{
                                fontSize: 10.5,
                                color: '#34d399',
                                background: 'rgba(16, 185, 129, 0.12)',
                                padding: '1px 6px',
                                borderRadius: 4,
                                fontFamily: 'monospace',
                              }}
                            >
                              📖 {p.similarPYQ.length} PYQs
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          title="Edit Entry"
                          onClick={() => handleEditEntry(p)}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        {(p.isPin || p.isStaticOverride) && (
                          <button
                            type="button"
                            title={
                              p.isStaticOverride
                                ? 'Reset Static Override'
                                : 'Delete PIN Entry'
                            }
                            onClick={() => handleDeletePin(p)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#f87171',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
