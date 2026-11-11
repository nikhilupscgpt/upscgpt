'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Copy,
  Clock,
  RotateCcw,
  TreePine,
  Globe2,
  Scale,
  ShieldCheck,
  Compass,
  ArrowRight,
} from 'lucide-react';
import './env-admin.css';

const MODULE_TABS = [
  { id: 'SPECIES', label: '🐅 Species Atlas', status: 'ACTIVE', badge: 'Live & Ingesting' },
  { id: 'PROTECTED_AREA', label: '🏞️ Protected Areas', status: 'UPCOMING', badge: 'Schema In Design' },
  { id: 'CONVENTION', label: '🌐 Conventions & Treaties', status: 'UPCOMING', badge: 'Schema In Design' },
  { id: 'ACT_ORG', label: '⚖️ Acts & Organisations', status: 'UPCOMING', badge: 'Schema In Design' },
  { id: 'SCHEME', label: '💡 Schemes & Missions', status: 'UPCOMING', badge: 'Schema In Design' },
  { id: 'HOTSPOT', label: '🔥 Hotspots & News', status: 'UPCOMING', badge: 'Schema In Design' },
];

const SAMPLE_TEMPLATES = {
  SPECIES: JSON.stringify(
    {
      slug: 'great-indian-bustard',
      module: 'SPECIES',
      category: 'Birds',
      title: 'Great Indian Bustard',
      subtitle: 'Ardeotis nigriceps',
      wikiTitle: 'Great_Indian_bustard',
      statusBadges: { iucn: 'CR', wpa: 'Schedule I', cites: 'Appendix I', endemic: true },
      rememberBullets: [
        'Flagship grassland bird of India and state bird of Rajasthan.',
        'Heaviest flying bird in India (up to 15 kg); suffers mortality from overhead transmission wires.',
        'Desert National Park (Rajasthan) is its last viable breeding stronghold.'
      ],
      confusionTrap: "Don't confuse: GIB is Critically Endangered (CR); Lesser Florican is also a bustard species but prefers moist grasslands.",
      places: [
        { n: 'Desert National Park', st: 'Rajasthan', lat: 26.9, lon: 70.9, note: 'Primary breeding stronghold' },
        { n: 'Rollapadu WLS', st: 'Andhra Pradesh', lat: 15.7, lon: 78.3, note: 'Southern habitat range' }
      ],
      newsTriggers: [
        {
          tag: 'Supreme Court',
          date: '2024',
          what: 'Supreme Court appointed expert panel on undergrounding power lines in GIB habitats.',
          whyItMatters: 'Balancing renewable green corridors and species survival.'
        }
      ]
    },
    null,
    2
  ),
  PROTECTED_AREA: JSON.stringify(
    {
      slug: 'jim-corbett-national-park',
      module: 'PROTECTED_AREA',
      category: 'National Park',
      title: 'Jim Corbett National Park',
      subtitle: 'Est. 1936 · Ramganga Basin',
      wikiTitle: 'Jim_Corbett_National_Park',
      statusBadges: { designations: ['National Park', 'Tiger Reserve'], establishedYear: 1936, biome: 'Sub-Himalayan Sal Forest' },
      rememberBullets: [
        "India's oldest National Park (originally Hailey NP); Project Tiger launched here in 1973.",
        'Ramganga River flows west through the park before joining the Ganga on its left bank.',
        'Located in the Shivalik foothills and Patli Dun valley.'
      ],
      places: [{ n: 'Jim Corbett NP', st: 'Uttarakhand', lat: 29.53, lon: 78.77 }]
    },
    null,
    2
  ),
  CONVENTION: JSON.stringify(
    {
      slug: 'cites',
      module: 'CONVENTION',
      category: 'Wildlife Trade',
      title: 'CITES (Washington Convention)',
      subtitle: 'Adopted 1973 · In Force 1975',
      wikiTitle: 'CITES',
      statusBadges: { binding: true, indiaParty: true, secretariat: 'Geneva, Switzerland', parties: 184 },
      rememberBullets: [
        'Legally binding on Parties; does not replace national laws but establishes international framework.',
        'Three Appendices: Appendix I (Commercial trade prohibited), Appendix II (Regulated via permits), Appendix III (Unilateral request).',
        'Administered through UNEP.'
      ],
      confusionTrap: "Don't confuse: CITES regulates international wildlife trade; CMS (Bonn Convention) focuses on migratory wild animal species."
    },
    null,
    2
  ),
  ACT_ORG: JSON.stringify(
    {
      slug: 'wpa-1972',
      module: 'ACT_ORG',
      category: 'Parent Legislation',
      title: 'Wildlife (Protection) Act, 1972',
      subtitle: 'Enacted 1972 · Amended 2022',
      wikiTitle: 'Wildlife_Protection_Act,_1972',
      statusBadges: { type: 'Central Act', ministry: 'MoEFCC', rationalizedSchedules: 4 },
      rememberBullets: [
        '2022 Amendment rationalised schedules from 6 down to 4: Schedule I (highest protection), Schedule II (lesser protection), Schedule III (CITES), Schedule IV (plants).',
        'Empowers Central Govt to declare Protected Areas and establishes NTCA, WCCB, and Central Zoo Authority.',
        'Vermin classification power rests exclusively with Central Govt notification.'
      ]
    },
    null,
    2
  ),
  SCHEME: JSON.stringify(
    {
      slug: 'project-tiger',
      module: 'SCHEME',
      category: 'Centrally Sponsored Scheme',
      title: 'Project Tiger',
      subtitle: 'Launched 1973 · 50 Years Milestone',
      wikiTitle: 'Project_Tiger',
      statusBadges: { schemeType: 'Centrally Sponsored', adminBody: 'NTCA', fundingRatio: '60:40 / 90:10' },
      rememberBullets: [
        'Launched on 1 April 1973 from Corbett National Park with 9 initial Tiger Reserves.',
        'Statutory status accorded via 2006 Amendment to WPA 1972 creating NTCA.',
        '54+ Tiger Reserves currently notified across 18 states.'
      ]
    },
    null,
    2
  ),
  HOTSPOT: JSON.stringify(
    {
      slug: 'western-ghats-hotspot',
      module: 'HOTSPOT',
      category: 'Global Biodiversity Hotspot',
      title: 'Western Ghats Hotspot',
      subtitle: 'UNESCO World Heritage Site',
      wikiTitle: 'Western_Ghats',
      statusBadges: { criteria: '>=1500 endemic vascular plants, >70% habitat loss' },
      rememberBullets: [
        'One of the world’s eight "hottest hotspots" of biological diversity.',
        'Spans 6 states: Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu.',
        'Gadgil Commission (2011) vs. Kasturirangan Committee (2013) on ESA zoning.'
      ]
    },
    null,
    2
  )
};

export default function EnvironmentAdminClient({ session }) {
  const [activeTab, setActiveTab] = useState('SPECIES');
  const [jsonlInput, setJsonlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState([]);
  const [kpis, setKpis] = useState({});
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  // Fetch Items
  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/admin/env-atlas/ingest?module=ALL');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setKpis(data.kpiByModule || {});
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Ingest
  const handleIngest = async () => {
    if (!jsonlInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter JSON or JSONL records to ingest.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/env-atlas/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: jsonlInput }),
      });

      const result = await res.json();

      if (result.success || result.inserted > 0 || result.updated > 0) {
        setStatusMsg({
          type: 'success',
          text: `Success! ${result.inserted || 0} inserted, ${result.updated || 0} updated. Total store: ${result.totalCount} items.`,
        });
        setJsonlInput('');
        loadData();
      } else {
        setStatusMsg({
          type: 'error',
          text: (result.errors && result.errors.join('; ')) || 'Ingestion failed.',
        });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Network error during ingestion' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" (${slug})?`)) return;

    try {
      const res = await fetch(`/api/admin/env-atlas/ingest?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Copy Template
  const handleCopyTemplate = () => {
    const tmpl = SAMPLE_TEMPLATES[activeTab] || SAMPLE_TEMPLATES.SPECIES;
    navigator.clipboard.writeText(tmpl);
    setJsonlInput(tmpl);
    setStatusMsg({ type: 'info', text: `Sample ${activeTab} template copied to input!` });
  };

  // Filtered Items for active tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const modMatch = (item.module || 'SPECIES').toUpperCase() === activeTab.toUpperCase();
      if (!modMatch) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.subtitle || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.slug || '').toLowerCase().includes(q)
      );
    });
  }, [items, activeTab, search]);

  const activeTabMeta = MODULE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="env-admin-container">
      {/* Top Header */}
      <div className="env-admin-header">
        <div className="env-admin-brand">
          <span className="env-admin-pill">ADMIN CONSOLE</span>
          <h1>Environment Atlas — Unified Ingestion Hub</h1>
          <p>
            Idempotent multi-domain ingestion engine. Ingest structured JSON / JSONL records across Species, 
            Protected Areas, Conventions, and Statutory Acts.
          </p>
        </div>

        <div className="env-admin-actions">
          <Link href="/environment" className="env-admin-link-btn" target="_blank">
            <span>Environment Hub</span>
            <ExternalLink size={14} />
          </Link>
          <Link href="/environment/species" className="env-admin-link-btn active-link" target="_blank">
            <span>Live Species Atlas</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Domain Tabs Switcher */}
      <div className="env-admin-tabs-bar">
        {MODULE_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const count = kpis[tab.id] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              className={`env-admin-tab ${isSelected ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setStatusMsg(null);
              }}
            >
              <span className="tab-label">{tab.label}</span>
              <span className={`tab-count ${count > 0 ? 'has-data' : ''}`}>{count}</span>
              {tab.status === 'UPCOMING' && (
                <span className="tab-status-pill">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ingestion & KPI Section */}
      <div className="env-admin-grid">
        {/* Left Card: JSONL Ingest Box */}
        <div className="env-admin-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <UploadCloud size={18} className="text-blue-400" />
              <h2>Ingest {activeTabMeta?.label || 'Items'} (JSON / JSONL)</h2>
            </div>
            <button
              type="button"
              className="env-admin-btn-secondary"
              onClick={handleCopyTemplate}
              title="Fill with sample template"
            >
              <Copy size={13} />
              <span>Load Template</span>
            </button>
          </div>

          <p className="panel-desc">
            Paste one JSON object or multiple JSONL lines below. 
            Existing items with the same <code>slug</code> are automatically updated.
          </p>

          <textarea
            className="env-admin-textarea"
            placeholder={`Paste ${activeTab} JSON or JSONL records here...`}
            rows={10}
            value={jsonlInput}
            onChange={(e) => setJsonlInput(e.target.value)}
          />

          <div className="panel-footer">
            <button
              type="button"
              className="env-admin-btn-primary"
              onClick={handleIngest}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock size={15} className="animate-spin" />
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} />
                  <span>Ingest {activeTab} Records</span>
                </>
              )}
            </button>
          </div>

          {statusMsg && (
            <div className={`env-status-alert alert-${statusMsg.type}`}>
              {statusMsg.type === 'success' && <CheckCircle2 size={16} />}
              {statusMsg.type === 'error' && <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Right Card: Domain Status & Guidelines */}
        <div className="env-admin-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Sparkles size={18} className="text-amber-400" />
              <h2>{activeTabMeta?.label} Overview & Rules</h2>
            </div>
          </div>

          <div className="env-guidelines-box">
            <div className="rule-item">
              <strong>Module Identifier:</strong> <code>"{activeTab}"</code>
            </div>
            <div className="rule-item">
              <strong>Primary Key:</strong> <code>slug</code> (lowercase, alphanumeric with hyphens)
            </div>
            {activeTab === 'SPECIES' ? (
              <>
                <div className="rule-item">
                  <strong>IUCN Mapping:</strong> <code>"CR"</code>, <code>"EN"</code>, <code>"VU"</code>, <code>"NT"</code>, <code>"LC"</code>
                </div>
                <div className="rule-item">
                  <strong>WPA 1972 Schedule:</strong> <code>"Schedule I"</code> or <code>"Schedule II"</code> (2022 Amendment)
                </div>
                <div className="rule-item">
                  <strong>Auto Wikimedia Photo:</strong> Provide <code>"wikiTitle"</code> (e.g. <code>"Great_Indian_bustard"</code>) to auto-fetch HD Creative Commons images with zero storage cost.
                </div>
              </>
            ) : (
              <div className="rule-item-notice">
                <Clock size={14} className="text-amber-400 inline mr-1" />
                <span>
                  This domain’s UI is currently in design. Ingestion is fully enabled using the universal schema; 
                  data ingested now will automatically appear as soon as the frontend layout for {activeTabMeta?.label} is launched.
                </span>
              </div>
            )}

            <div className="rule-item">
              <strong>Specification Reference:</strong> See <code>UPSC_ENVIRONMENT_INGESTION_SKILL.md</code> for full prompt prompts & gold-standard examples.
            </div>
          </div>
        </div>
      </div>

      {/* Live Table of Ingested Items */}
      <div className="env-admin-table-card">
        <div className="table-header-bar">
          <div className="table-title-area">
            <h2>Ingested {activeTabMeta?.label} ({filteredItems.length})</h2>
            <span className="table-badge">Store: {items.length} total across all modules</span>
          </div>

          <div className="table-search-box">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTabMeta?.label || 'items'} by name, category, or slug...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {fetching ? (
          <div className="table-loading">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="table-empty">
            <p>No items found for <strong>{activeTab}</strong>.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Load Template" above and then "Ingest Records" to add the first item.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="env-data-table">
              <thead>
                <tr>
                  <th>Item Title & Subtitle</th>
                  <th>Category</th>
                  <th>Status Badges</th>
                  <th>Places / Range</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.slug}>
                    <td>
                      <div className="item-cell-title">
                        <strong>{item.title}</strong>
                        {item.subtitle && <span className="item-cell-sub">{item.subtitle}</span>}
                        <code className="item-cell-slug">{item.slug}</code>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{item.category || 'General'}</span>
                    </td>
                    <td>
                      <div className="badges-cell">
                        {item.statusBadges?.iucn && (
                          <span className={`iucn-tag iucn-${item.statusBadges.iucn.toLowerCase()}`}>
                            {item.statusBadges.iucn}
                          </span>
                        )}
                        {item.statusBadges?.wpa && (
                          <span className="wpa-tag">{item.statusBadges.wpa}</span>
                        )}
                        {item.statusBadges?.binding !== undefined && (
                          <span className="status-tag">
                            {item.statusBadges.binding ? 'Legally Binding' : 'Voluntary'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="places-count">
                        {(item.places || []).length} locations
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        {activeTab === 'SPECIES' && (
                          <Link
                            href={`/environment/species`}
                            className="btn-view"
                            target="_blank"
                            title="Preview in Species Atlas"
                          >
                            <ExternalLink size={13} />
                            <span>Atlas</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(item.slug, item.title)}
                          title="Delete Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
