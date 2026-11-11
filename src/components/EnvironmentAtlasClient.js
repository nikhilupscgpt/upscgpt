'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import WikiHeroImage from '@/components/WikiHeroImage';
import EnvironmentMap from '@/components/EnvironmentMap';
import {
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Flame,
  RotateCcw,
} from 'lucide-react';
import './env-atlas.css';

const MODULES = [
  { id: 'SPECIES', label: '🐅 Species Atlas' },
  { id: 'PROTECTED_AREA', label: '🏞️ Protected Areas' },
  { id: 'IN_NEWS', label: '📰 In News' },
  { id: 'CONVENTION', label: '🌐 Conventions & Treaties' },
  { id: 'ACT_ORG', label: '⚖️ Acts & Organisations' },
  { id: 'SCHEME', label: '💡 Schemes & Missions' },
];

const IUCN_METERS = [
  { key: 'LC', label: 'Least Concern', color: '#16a34a' },
  { key: 'NT', label: 'Near Threatened', color: '#ca8a04' },
  { key: 'VU', label: 'Vulnerable', color: '#ea580c' },
  { key: 'EN', label: 'Endangered', color: '#dc2626' },
  { key: 'CR', label: 'Critically Endangered', color: '#991b1b' },
];

export default function EnvironmentAtlasClient() {
  const [activeModule, setActiveModule] = useState('SPECIES');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // Data states
  const [items, setItems] = useState([]);
  const [networks, setNetworks] = useState({});
  const [news, setNews] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  // User mastery state (localStorage)
  const [learnedMap, setLearnedMap] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('env_atlas_learned');
      if (saved) setLearnedMap(JSON.parse(saved));
    } catch (_) {}
  }, []);

  const toggleLearned = (slug) => {
    const updated = { ...learnedMap, [slug]: !learnedMap[slug] };
    setLearnedMap(updated);
    try {
      localStorage.setItem('env_atlas_learned', JSON.stringify(updated));
    } catch (_) {}
  };

  // Fetch items
  useEffect(() => {
    setLoading(true);
    fetch(`/api/environment/items?module=${activeModule}&category=${activeCategory}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setNetworks(data.networks || {});
        setNews(data.news || []);
        if (data.items?.length > 0) {
          setSelectedSlug((curr) => {
            const exists = data.items.some((i) => i.slug === curr);
            return exists ? curr : data.items[0].slug;
          });
        }
      })
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));
  }, [activeModule, activeCategory]);

  // Active item
  const activeItem = useMemo(() => {
    return items.find((i) => i.slug === selectedSlug) || items[0] || null;
  }, [items, selectedSlug]);

  // Categories list based on active items
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [items]);

  // Starters vs Remaining
  const { starters, remaining } = useMemo(() => {
    const filtered = items.filter((i) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        (i.subtitle || '').toLowerCase().includes(q) ||
        (i.places || []).some((p) => (p.name || '').toLowerCase().includes(q) || (p.state || '').toLowerCase().includes(q))
      );
    });

    return {
      starters: filtered.filter((i) => i.isStarter),
      remaining: filtered.filter((i) => !i.isStarter),
    };
  }, [items, search]);

  const learnedCount = useMemo(() => {
    return items.filter((i) => learnedMap[i.slug]).length;
  }, [items, learnedMap]);

  return (
    <div className="env-atlas-wrapper">
      {/* 1. Top Sub-Nav Bar */}
      <header className="env-topbar">
        <div className="env-topbar-title">
          <Link href="/environment" className="env-back-link" title="Return to Environment Hub">
            <ChevronLeft size={15} />
            <span>Hub</span>
          </Link>
          <span className="env-brand-pill">PRELIMS 2025–26</span>
          <h1>Environment Atlas</h1>
        </div>

        {/* Module Sub-Tabs (Pixel-perfect to mock: Species active, others route to Hub) */}
        <div className="env-tablist" role="tablist">
          {MODULES.map((m) => {
            const isSpecies = m.id === 'SPECIES';
            return (
              <Link
                key={m.id}
                href={isSpecies ? '/environment/species' : '/environment'}
                style={{ textDecoration: 'none' }}
              >
                <button
                  type="button"
                  className={`env-tab-btn ${isSpecies ? 'active' : ''}`}
                  title={isSpecies ? 'Current: Species Atlas' : `View ${m.label} in Hub`}
                >
                  {m.label}
                </button>
              </Link>
            );
          })}
        </div>

        {/* User Mastery Pill */}
        <div className="env-mastery-status">
          <span>
            Learnt <strong>{learnedCount}</strong> of {items.length}
          </span>
          <div className="env-progress-bar">
            <div
              className="env-progress-fill"
              style={{
                width: `${items.length > 0 ? (learnedCount / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* 2. Three-Panel Main Stage */}
      <main className="env-main-grid">
        {/* LEFT COLUMN: Filterable Card Deck */}
        <aside className="env-sidebar-deck">
          <div className="env-search-box">
            <Search size={15} className="env-search-icon" />
            <input
              type="text"
              placeholder="Search by name, park, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter Chips */}
          <div className="env-category-chips">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`env-chip ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c === 'ALL' ? 'All' : c}
              </button>
            ))}
          </div>

          <div className="env-deck-scroll">
            {/* Starters Section */}
            {starters.length > 0 && (
              <div className="env-deck-group">
                <div className="env-deck-group-header">
                  <Flame size={13} color="#f59e0b" />
                  <span>START WITH THESE {starters.length}</span>
                </div>
                {starters.map((item) => (
                  <DeckCard
                    key={item.slug}
                    item={item}
                    isSelected={selectedSlug === item.slug}
                    isLearned={!!learnedMap[item.slug]}
                    onClick={() => setSelectedSlug(item.slug)}
                  />
                ))}
              </div>
            )}

            {/* Remaining Section */}
            {remaining.length > 0 && (
              <div className="env-deck-group">
                <div className="env-deck-group-header">
                  <span>THEN THE REST ({remaining.length})</span>
                </div>
                {remaining.map((item) => (
                  <DeckCard
                    key={item.slug}
                    item={item}
                    isSelected={selectedSlug === item.slug}
                    isLearned={!!learnedMap[item.slug]}
                    onClick={() => setSelectedSlug(item.slug)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: The Core Study Card */}
        <section className="env-center-card">
          {activeItem ? (
            <div className="env-study-scroll">
              {/* Wikimedia Live Photo Hero */}
              <WikiHeroImage
                wikiTitle={activeItem.wikiTitle}
                fallbackName={activeItem.title}
                title={activeItem.title}
              />

              <div className="env-study-body">
                {/* Title & One-liner */}
                <div className="env-study-header">
                  <div className="env-study-title-row">
                    <h2>{activeItem.title}</h2>
                    {activeItem.subtitle && <span className="env-study-subtitle">{activeItem.subtitle}</span>}
                  </div>
                  {activeItem.habitatType && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '3px 10px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', marginTop: '4px', marginBottom: '6px' }}>
                      <span>🌿 Habitat:</span> <strong>{activeItem.habitatType}</strong>
                    </div>
                  )}
                  {activeItem.oneline && <p className="env-study-oneline">{activeItem.oneline}</p>}
                </div>

                {/* Status Badges & Meter */}
                {activeItem.statusBadges && (
                  <div className="env-protection-card">
                    <div className="env-card-sublabel">How protected is it?</div>
                    <div className="env-meter-grid">
                      {IUCN_METERS.map((m) => {
                        const isMatch = activeItem.statusBadges.iucn === m.key;
                        return (
                          <div
                            key={m.key}
                            className={`env-meter-cell ${isMatch ? 'active' : ''}`}
                            style={{ '--meter-color': m.color }}
                          >
                            <span className="env-meter-key">{m.key}</span>
                            <span className="env-meter-desc">{m.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="env-schedule-chips">
                      {activeItem.statusBadges.wpa && (
                        <div className="env-badge-chip">
                          <strong>WPA 1972:</strong> {activeItem.statusBadges.wpa}
                        </div>
                      )}
                      {activeItem.statusBadges.cites && (
                        <div className="env-badge-chip">
                          <strong>CITES:</strong> {activeItem.statusBadges.cites}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3 High-Yield "Remember These" Bullets */}
                {activeItem.rememberBullets?.length > 0 && (
                  <div className="env-remember-box">
                    <div className="env-card-sublabel">Remember these 3 facts</div>
                    <ul className="env-remember-list">
                      {activeItem.rememberBullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Yellow "Don't Get Confused" Exam Trap Box */}
                {activeItem.confusionTrap && (
                  <div className="env-confuse-card">
                    <div className="env-confuse-header">
                      <AlertTriangle size={15} color="#d97706" />
                      <span>DON’T GET CONFUSED IN PRELIMS</span>
                    </div>
                    <p className="env-confuse-body">{activeItem.confusionTrap}</p>
                  </div>
                )}

                {/* Behaviour & Ecology */}
                {activeItem.behaviour && (
                  <div className="env-remember-box" style={{ marginTop: '16px' }}>
                    <div className="env-card-sublabel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🐾 Behaviour & Ecology
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.88rem', lineHeight: '1.5', color: '#cbd5e1' }}>
                      {activeItem.behaviour}
                    </p>
                  </div>
                )}

                {/* UPSC Previous Years Questions (PYQ) */}
                {activeItem.similarPYQ?.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      <BookOpen size={14} />
                      <span>UPSC PREVIOUS YEARS QUESTIONS (PYQ)</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {activeItem.similarPYQ.map((q, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sticky Bottom Actions */}
              <div className="env-card-bottom-bar">
                <button
                  type="button"
                  className={`env-action-btn ${learnedMap[activeItem.slug] ? 'learned' : ''}`}
                  onClick={() => toggleLearned(activeItem.slug)}
                >
                  <CheckCircle2 size={16} />
                  <span>{learnedMap[activeItem.slug] ? 'Learnt ✓' : 'I’ve learnt this'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="env-empty-state">No item selected.</div>
          )}
        </section>

        {/* RIGHT COLUMN: Interactive Context Rail (Map, In-News, Lives Alongside) */}
        <aside className="env-context-rail">
          {activeItem && (
            <div className="env-rail-scroll">
              {/* 1. Habitat & Interactive D3 India Map */}
              <div className="env-rail-section">
                <div className="env-card-sublabel">Where does it live?</div>
                <EnvironmentMap
                  places={activeItem.places || []}
                  highlightedStates={activeItem.states || []}
                  network={activeItem.networkKey ? networks[activeItem.networkKey] : null}
                />

                {/* Place List */}
                <div className="env-places-list">
                  {(activeItem.places || []).map((p, idx) => (
                    <div key={idx} className="env-place-row">
                      <span className="env-place-num">{idx + 1}</span>
                      <div className="env-place-meta">
                        <div className="env-place-name">{p.name}</div>
                        <div className="env-place-state">{p.state}</div>
                      </div>
                      {p.primary && <span className="env-primary-pill">Primary</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. In News Triggers */}
              {activeItem.newsTriggers?.length > 0 && (
                <div className="env-rail-section">
                  <div className="env-card-sublabel">In News</div>
                  <div className="env-news-feed">
                    {activeItem.newsTriggers.map((n, idx) => (
                      <div key={idx} className="env-news-card">
                        <div className="env-news-tag-row">
                          <span className="env-news-tag">{n.tag}</span>
                          <span className="env-news-date">{n.date}</span>
                        </div>
                        <div className="env-news-what">{n.what}</div>
                        <div className="env-news-why">
                          <strong>Why it matters:</strong> {n.whyItMatters}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Lives Alongside */}
              <div className="env-rail-section">
                <div className="env-card-sublabel">Lives alongside</div>
                <div className="env-alongside-chips">
                  {items
                    .filter(
                      (other) =>
                        other.slug !== activeItem.slug &&
                        (other.places || []).some((op) =>
                          (activeItem.places || []).some((ap) => ap.name === op.name)
                        )
                    )
                    .map((other) => (
                      <button
                        key={other.slug}
                        type="button"
                        className="env-alongside-btn"
                        onClick={() => setSelectedSlug(other.slug)}
                      >
                        {other.title} →
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function DeckCard({ item, isSelected, isLearned, onClick }) {
  return (
    <div
      className={`env-deck-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="env-deck-card-content">
        <div className="env-deck-card-title">{item.title}</div>
        <div className="env-deck-card-sub">{item.subtitle}</div>
      </div>
      <div className="env-deck-card-badges">
        {item.statusBadges?.iucn && (
          <span className={`env-iucn-badge ${item.statusBadges.iucn.toLowerCase()}`}>
            {item.statusBadges.iucn}
          </span>
        )}
        {isLearned && <span className="env-learned-check">✓</span>}
      </div>
    </div>
  );
}
