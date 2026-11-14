'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import PageBar from '@/components/environment-atlas/PageBar';
import PrevNextRow from '@/components/environment-atlas/PrevNextRow';
import SpeciesList from '@/components/environment-atlas/SpeciesList';
import SpeciesBody from '@/components/environment-atlas/SpeciesBody';
import RightPanel from '@/components/environment-atlas/RightPanel';
import { track, createActiveViewTracker } from '@/lib/analytics/client';
import {
  Search,
  ChevronLeft,
  X,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import './env-atlas.css';

function computeTimeSpentSec(startedAt) {
  const now = Date.now();
  return Math.max(0, Math.min(600, Math.round((now - (startedAt || now)) / 1000)));
}

export default function EnvironmentAtlasClient() {
  const [items, setItems] = useState([]);
  const [networks, setNetworks] = useState({});
  const [news, setNews] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('bengal-tiger');
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // UI State
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [studyTab, setStudyTab] = useState('notes'); // 'notes' | 'pyqs'
  const [quizMode, setQuizMode] = useState(false);
  const [quizState, setQuizState] = useState(null);

  // Hydrate initial filter, search, and #slug from URL so state survives reload
  // Keep URL query & hash synced with active filter, search, and selected species
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    const params = new URLSearchParams(window.location.search);
    if (activeFilter && activeFilter !== 'All') params.set('filter', activeFilter);
    else params.delete('filter');
    if (search.trim()) params.set('q', search.trim());
    else params.delete('q');
    const qs = params.toString();
    const hash = selectedSlug ? `#${selectedSlug}` : '';
    const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${hash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [activeFilter, search, selectedSlug, loading]);

  // Fetch Items & hydrate initial URL filter/search/#slug post-fetch
  useEffect(() => {
    fetch('/api/environment/items?module=SPECIES&category=ALL')
      .then((r) => r.json())
      .then((data) => {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const f = params.get('filter');
          const q = params.get('q');
          const hashSlug = window.location.hash ? window.location.hash.slice(1) : '';
          if (f) setActiveFilter(f);
          if (q) setSearch(q);
          if (hashSlug) setSelectedSlug(hashSlug);
        }
        const rawList = data.items || [];
        // Strict deduplication by slug and lowercase title
        const seen = new Set();
        const deduped = rawList.filter((it) => {
          const key = (it.slug || it.title || '').toLowerCase().trim();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(deduped);
        setNetworks(data.networks || {});
        setNews(data.news || []);

        if (deduped.length > 0) {
          setSelectedSlug((curr) => {
            const exists = deduped.some((i) => i.slug === curr);
            return exists ? curr : deduped[0].slug;
          });
        }
      })
      .catch((err) => console.error('Failed to load items:', err))
      .finally(() => setLoading(false));
  }, []);

  // Active Item
  const activeItem = useMemo(() => {
    return items.find((i) => i.slug === selectedSlug) || items[0] || null;
  }, [items, selectedSlug]);

  // Derived News for species
  const activeNews = useMemo(() => {
    if (!activeItem) return [];
    const directTriggers = activeItem.newsTriggers || [];
    if (directTriggers.length > 0) {
      return directTriggers
        .map((t) => ({
          tag: t.tag || t.type || 'Current Affairs',
          date: t.date || t.d || '2024-26',
          what: t.what,
          why: t.why || t.whyItMatters || '',
          src: String(t.src || t.source || '').trim(),
          url: t.url && t.url !== '#' ? t.url : null,
          via: t.via || '',
        }))
        .filter((n) => Boolean(n.src));
    }

    const placeNames = (activeItem.places || []).map((p) => (p.name || '').toLowerCase());
    const matched = news.filter((n) => {
      if (n.species && (n.species.includes(activeItem.slug) || n.species.includes(activeItem.title))) return true;
      const hit = (n.places || []).some((p) => placeNames.some((pn) => pn.includes(p.toLowerCase())));
      return hit;
    });

    return matched
      .map((n) => ({
        tag: n.type || 'Policy update',
        date: n.date || n.d,
        what: n.what,
        why: n.why,
        src: String(n.src || n.source || '').trim(),
        url: n.url && n.url !== '#' ? n.url : null,
        via: n.via,
      }))
      .filter((n) => Boolean(n.src));
  }, [activeItem, news]);

  // Check if an item has news
  const itemHasNews = useCallback((item) => {
    if (item.newsTriggers && item.newsTriggers.length > 0) return true;
    const places = (item.places || []).map((p) => (p.name || '').toLowerCase());
    return news.some((n) => {
      if (n.species && (n.species.includes(item.slug) || n.species.includes(item.title))) return true;
      return (n.places || []).some((p) => places.some((pn) => pn.includes(p.toLowerCase())));
    });
  }, [news]);

  // Filtered Deck
  const { starters, remaining } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = items.filter((i) => {
      // 1. Text search
      if (q) {
        const matchTitle = (i.title || '').toLowerCase().includes(q);
        const matchSub = (i.subtitle || '').toLowerCase().includes(q);
        const matchPlaces = (i.places || []).some(
          (p) => (p.name || '').toLowerCase().includes(q) || (p.state || '').toLowerCase().includes(q)
        );
        if (!matchTitle && !matchSub && !matchPlaces) return false;
      }

      // 2. Chip Filter
      if (activeFilter === 'All') return true;
      if (activeFilter === 'In news') return itemHasNews(i);
      if (['CR', 'EN', 'VU', 'LC'].includes(activeFilter)) {
        return (i.statusBadges?.iucn || '').toUpperCase() === activeFilter;
      }
      return (i.category || '').toLowerCase() === activeFilter.toLowerCase();
    });

    return {
      starters: filtered.filter((i) => i.isStarter),
      remaining: filtered.filter((i) => !i.isStarter),
    };
  }, [items, search, activeFilter, itemHasNews]);

  // Lives Alongside (species that share at least one protected area)
  const mates = useMemo(() => {
    if (!activeItem) return [];
    const myPlaces = new Set((activeItem.places || []).map((p) => (p.name || '').toLowerCase()));
    return items.filter(
      (other) =>
        other.slug !== activeItem.slug &&
        (other.places || []).some((op) => myPlaces.has((op.name || '').toLowerCase()))
    );
  }, [items, activeItem]);

  // Navigation handlers
  const navigateSpecies = (delta) => {
    const list = [...starters, ...remaining];
    const pool = list.length > 0 ? list : items;
    if (pool.length === 0) return;
    const idx = pool.findIndex((i) => i.slug === selectedSlug);
    const baseIdx = idx >= 0 ? idx : 0;
    const nextIndex = (baseIdx + delta + pool.length) % pool.length;
    setSelectedSlug(pool[nextIndex].slug);
    if (quizMode) setQuizMode(false);
    const centerEl = document.getElementById('center-scroll');
    if (centerEl) centerEl.scrollTop = 0;
  };

  // Start Quick Quiz (server-generated & server-graded; no answers sent to browser)
  const startQuiz = async () => {
    track('quiz_start', { slug: activeItem?.slug }, { module: 'env_atlas' });
    try {
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'env_atlas',
          buildQuiz: true,
          count: 5,
          atlasModule: 'SPECIES',
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data?.questions) || data.questions.length === 0) return;

      setQuizState({
        attemptId: data.attemptId,
        questions: data.questions,
        index: 0,
        score: 0,
        selectedLabel: null,
        correctLabel: null,
        explanation: null,
        isAnswered: false,
        submitting: false,
        questionStartedAt: Date.now(),
      });
      setQuizMode(true);
    } catch {
      // ignore transient network errors
    }
  };

  const handleAnswer = async (opt) => {
    if (!quizState || quizState.isAnswered || quizState.submitting) return;
    const currentQ = quizState.questions[quizState.index];
    const timeSpentSec = computeTimeSpentSec(quizState.questionStartedAt);
    const isLast = quizState.index + 1 >= quizState.questions.length;

    setQuizState((prev) => (prev ? { ...prev, submitting: true } : prev));
    try {
      const res = await fetch(`/api/attempts/${quizState.attemptId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'env_atlas',
          sourceId: currentQ.sourceId,
          selectedLabel: opt.label,
          timeSpentSec,
          complete: isLast,
        }),
      });
      if (!res.ok) {
        setQuizState((prev) => (prev ? { ...prev, submitting: false } : prev));
        return;
      }
      const data = await res.json();
      setQuizState((prev) =>
        prev
          ? {
              ...prev,
              selectedLabel: opt.label,
              correctLabel: data.correctLabel,
              explanation: data.explanation || null,
              isAnswered: true,
              submitting: false,
              score: data.isCorrect ? prev.score + 1 : prev.score,
            }
          : prev
      );
    } catch {
      setQuizState((prev) => (prev ? { ...prev, submitting: false } : prev));
    }
  };

  const nextQuizQuestion = () => {
    if (!quizState) return;
    setQuizState((prev) => ({
      ...prev,
      index: prev.index + 1,
      selectedLabel: null,
      correctLabel: null,
      explanation: null,
      isAnswered: false,
      questionStartedAt: Date.now(),
    }));
  };

  const activeNetwork = networks[activeItem?.networkKey || activeItem?.slug];
  const startWithCount = useMemo(
    () => items.filter((item) => item.startWith).length,
    [items]
  );

  // Track module_open on mount and active dwell time per species
  useEffect(() => {
    track('module_open', { module: 'env_atlas' }, { module: 'env_atlas' });
  }, []);

  useEffect(() => {
    if (!activeItem?.slug) return;
    return createActiveViewTracker('species', activeItem.slug, 'env_atlas');
  }, [activeItem?.slug]);

  useEffect(() => {
    const q = search.trim();
    if (!q) return;
    const timer = setTimeout(() => {
      track('search', { queryLength: q.length }, { module: 'env_atlas' });
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const currentIndex = items.findIndex((i) => i.slug === selectedSlug);
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 1;

  // Keyboard navigation shortcuts (ArrowLeft / ArrowRight / Q / Escape)
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        navigateSpecies(1);
      } else if (e.key === 'ArrowLeft') {
        navigateSpecies(-1);
      } else if (e.key.toLowerCase() === 'q' && !quizMode && !showHowItWorks) {
        startQuiz();
      } else if (e.key === 'Escape') {
        if (showHowItWorks) setShowHowItWorks(false);
        if (quizMode) setQuizMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="env-atlas-wrapper">
      {/* 1. Page Bar (PRD §3.1) */}
      <PageBar
        displayIndex={displayIndex}
        totalCount={items.length}
        onOpenStudyGuide={() => setShowHowItWorks(true)}
        onStartQuiz={startQuiz}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* 2. Responsive Three-Column Stage (PRD §2) */}
      <div className="main-stage">
        {isDrawerOpen && (
          <div
            className="env-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* LEFT LIST / MOBILE DRAWER (280px) */}
        <SpeciesList
          items={items}
          starters={starters}
          remaining={remaining}
          selectedSlug={selectedSlug}
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={(nextFilter) => {
            setActiveFilter(nextFilter);
            track('filter_change', { filter: nextFilter }, { module: 'env_atlas' });
          }}
          onSelectSpecies={(slug) => {
            setSelectedSlug(slug);
            setIsDrawerOpen(false);
            if (quizMode) setQuizMode(false);
          }}
          itemHasNews={itemHasNews}
          isDrawerOpen={isDrawerOpen}
          onCloseDrawer={() => setIsDrawerOpen(false)}
        />

        {/* CENTER STUDY STAGE & RIGHT RAIL */}
        <main className="center-scroll" id="center-scroll">
          {quizMode && quizState ? (
            /* Quiz Card */
            <div className="card" style={{ gridTemplateColumns: 'minmax(0, 720px)', justifyContent: 'center' }}>
              <div className="maincol">
                {quizState.index < quizState.questions.length ? (
                  <>
                    <div className="photo" style={{ height: 320 }}>
                      <div
                        className="blur"
                        style={{
                          backgroundImage: `url(${quizState.questions[quizState.index].imageUrl || `/species/${quizState.questions[quizState.index].speciesSlug}.webp`})`,
                        }}
                      />
                      <img
                        src={
                          quizState.questions[quizState.index].imageUrl ||
                          `/species/${quizState.questions[quizState.index].speciesSlug}.webp`
                        }
                        alt="Quiz question"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, color: 'var(--muted)', fontSize: 14 }}>
                      <span>Question <b>{quizState.index + 1}</b> of {quizState.questions.length}</span>
                      <span>Score <b>{quizState.score}</b></span>
                    </div>

                    <h2 style={{ fontSize: 20, margin: '10px 0 16px', color: 'var(--text)' }}>
                      {quizState.questions[quizState.index].text}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {quizState.questions[quizState.index].options.map((opt) => {
                        const isCorrect = quizState.isAnswered && opt.label === quizState.correctLabel;
                        const isSelected = opt.label === quizState.selectedLabel;
                        let btnStyle = {
                          textAlign: 'left',
                          border: '1px solid var(--line)',
                          background: 'var(--panel)',
                          borderRadius: 12,
                          padding: '13px 16px',
                          fontSize: 15,
                          cursor: quizState.isAnswered ? 'default' : 'pointer',
                          color: 'var(--text)',
                          fontWeight: 500,
                        };

                        if (quizState.isAnswered) {
                          if (isCorrect) {
                            btnStyle.borderColor = 'var(--good)';
                            btnStyle.background = 'var(--goodSoft)';
                            btnStyle.color = 'var(--good)';
                            btnStyle.fontWeight = 700;
                          } else if (isSelected) {
                            btnStyle.borderColor = 'var(--cr)';
                            btnStyle.background = 'var(--warn)';
                            btnStyle.color = 'var(--warnText)';
                          }
                        }

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            style={btnStyle}
                            onClick={() => handleAnswer(opt)}
                            disabled={quizState.isAnswered || quizState.submitting}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>

                    {quizState.isAnswered && (
                      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn dark"
                          onClick={nextQuizQuestion}
                        >
                          {quizState.index + 1 >= quizState.questions.length ? 'See Result' : 'Next Question →'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '30px 0', textAlign: 'center' }}>
                    <Award size={48} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: 24, margin: '0 0 8px', color: 'var(--text)' }}>
                      Quiz Complete!
                    </h2>
                    <p style={{ fontSize: 16, color: 'var(--muted)', margin: '0 0 24px' }}>
                      You scored {quizState.score} out of {quizState.questions.length}.
                      {quizState.score === 5
                        ? ' Perfect! You have mastered these species.'
                        : ' Good revision. Go through the cards again to solidify your edge.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button type="button" className="btn dark" onClick={startQuiz}>
                        Try another quiz
                      </button>
                      <button type="button" className="btn" onClick={() => setQuizMode(false)}>
                        Back to learning
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeItem ? (
            /* Standard Study View Matching Species_Atlas_v2.html */
            <>
              <div className="card">
                {/* Main Column */}
                <div className="maincol">
                  <SpeciesBody
                    key={activeItem.slug}
                    activeItem={activeItem}
                    displayIndex={displayIndex}
                    totalCount={items.length}
                    startWithCount={startWithCount}
                    studyTab={studyTab}
                    onTabChange={(tab) => {
                      setStudyTab(tab);
                      track('tab_switch', { tab, slug: activeItem?.slug }, { module: 'env_atlas' });
                    }}
                  />
                  {/* In-flow Previous / Next Row (PRD §3.7) */}
                  <PrevNextRow
                    displayIndex={displayIndex}
                    totalCount={items.length}
                    onNavigate={navigateSpecies}
                  />
                </div>

                {/* Right Rail */}
                <RightPanel
                  key={activeItem.slug}
                  activeItem={activeItem}
                  activeNetwork={activeNetwork}
                  newsItems={activeNews}
                  mates={mates}
                  onSelectSpecies={(slug) => {
                    setSelectedSlug(slug);
                    const el = document.getElementById('center-scroll');
                    if (el) el.scrollTop = 0;
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              No species found matching your filter.
            </div>
          )}
        </main>
      </div>

      {/* "How it works" Modal */}
      {showHowItWorks && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
          }}
          onClick={() => setShowHowItWorks(false)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 16,
              maxWidth: 540,
              width: '100%',
              padding: 24,
              color: 'var(--text)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>How to prepare Species for Prelims</h3>
              <button
                type="button"
                onClick={() => setShowHowItWorks(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
              <p style={{ margin: '0 0 10px' }}>
                UPSC tests species on <b>3 recurring patterns</b>:
              </p>
              <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
                <li style={{ marginBottom: 6 }}>
                  <b>Legal & Threat Status:</b> Schedule under WPA 1972 (post-2022 4-schedule rationalisation), IUCN category, and CITES appendix.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <b>Geography & Endemism:</b> Specific Protected Areas (National Parks, Tiger Reserves) and whether it is endemic to Western Ghats, Himalayas, or Terai.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <b>Unique Adaptations:</b> Diurnal vs nocturnal, herbivore vs apex carnivore, and diagnostic physical traits that eliminate trap statements.
                </li>
              </ul>
              <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: 13 }}>
                Use <b>←</b> / <b>→</b> to flip between species and press <b>Q</b> anytime for a quick <b>Quiz me</b> recall check.
              </p>
              <button
                type="button"
                className="btn dark"
                style={{ width: '100%' }}
                onClick={() => setShowHowItWorks(false)}
              >
                Got it, let&apos;s learn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
