'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import EnvironmentMap from '@/components/EnvironmentMap';
import { IucnBadgeSvg, IucnThreatGaugeSvg } from '@/components/IucnBadgeSvg';
import {
  Search,
  ChevronLeft,
  X,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import './env-atlas.css';

const RISK_MAP = {
  CR: { label: 'Critically Endangered', why: 'Extremely high risk of dying out in the wild soon.', color: 'var(--cr)' },
  EN: { label: 'Endangered', why: 'High risk of dying out in the wild.', color: 'var(--en)' },
  VU: { label: 'Vulnerable', why: 'High risk of endangerment in the medium-term.', color: 'var(--vu)' },
  NT: { label: 'Near Threatened', why: 'Close to qualifying for a threatened category.', color: 'var(--nt)' },
  LC: { label: 'Least Concern', why: 'Widespread and abundant in its natural range.', color: 'var(--lc)' },
};

const RISK_ORDER = ['LC', 'NT', 'VU', 'EN', 'CR'];

const LAW_EXPLANATIONS = {
  'Schedule I': 'Highest protection in India. Hunting or trading it is a serious crime.',
  'Schedule II': 'Protected species. Offences carry stringent penalties.',
  'Schedule III': 'Protected species under rationalised WPA Amendment schedules.',
  'Schedule IV': 'Regulated species under CITES Appendix enforcement.',
};

const TRADE_EXPLANATIONS = {
  'Appendix I': 'International trade is banned.',
  'Appendix II': 'Trade is tightly regulated with strict export permits.',
  'Appendix III': 'Protected in at least one country asking CITES for assistance.',
  'Not listed': 'Commercial trade is not regulated under CITES.',
};

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
  const [showExplain, setShowExplain] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizState, setQuizState] = useState(null);

  // Mastery state in LocalStorage
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

  // Fetch Items
  useEffect(() => {
    setLoading(true);
    fetch('/api/environment/items?module=SPECIES&category=ALL')
      .then((r) => r.json())
      .then((data) => {
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
      return directTriggers.map((t) => ({
        tag: t.tag || 'Current Affairs',
        date: t.date || '2024-26',
        what: t.what,
        why: t.whyItMatters || '',
        src: t.source || 'UPSC In-News',
      }));
    }

    const placeNames = (activeItem.places || []).map((p) => (p.name || '').toLowerCase());
    const matched = news.filter((n) => {
      if (n.species && (n.species.includes(activeItem.slug) || n.species.includes(activeItem.title))) return true;
      const hit = (n.places || []).some((p) => placeNames.some((pn) => pn.includes(p.toLowerCase())));
      return hit;
    });

    return matched.map((n) => ({
      tag: n.type || 'Policy update',
      date: n.d,
      what: n.what,
      why: n.why,
      src: n.src,
      url: n.url,
    }));
  }, [activeItem, news]);

  // Check if an item has news
  const itemHasNews = (item) => {
    if (item.newsTriggers && item.newsTriggers.length > 0) return true;
    const places = (item.places || []).map((p) => (p.name || '').toLowerCase());
    return news.some((n) => {
      if (n.species && (n.species.includes(item.slug) || n.species.includes(item.title))) return true;
      return (n.places || []).some((p) => places.some((pn) => pn.includes(p.toLowerCase())));
    });
  };

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
      return (i.category || '').toLowerCase() === activeFilter.toLowerCase();
    });

    return {
      starters: filtered.filter((i) => i.isStarter),
      remaining: filtered.filter((i) => !i.isStarter),
    };
  }, [items, search, activeFilter, news]);

  const learnedCount = useMemo(() => {
    return items.filter((i) => learnedMap[i.slug]).length;
  }, [items, learnedMap]);

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
  const goToNextSpecies = () => {
    const list = [...starters, ...remaining];
    if (list.length === 0) return;
    const currentIndex = list.findIndex((i) => i.slug === selectedSlug);
    const nextIndex = (currentIndex + 1) % list.length;
    setSelectedSlug(list[nextIndex].slug);
    const centerEl = document.getElementById('center-scroll');
    if (centerEl) centerEl.scrollTop = 0;
  };

  // Start Quick Quiz
  const startQuiz = () => {
    const pool = items.length > 0 ? items : [];
    if (pool.length < 3) return;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const questions = shuffled.slice(0, 5).map((s, idx) => {
      const isRiskQ = idx % 2 === 1;
      if (isRiskQ) {
        const correct = RISK_MAP[s.statusBadges?.iucn]?.label || 'Endangered';
        const options = ['Least Concern', 'Vulnerable', 'Endangered', 'Critically Endangered'].sort(
          () => 0.5 - Math.random()
        );
        return {
          species: s,
          text: `How much risk does the ${s.title} face on the IUCN Red List?`,
          answer: correct,
          options,
        };
      }
      const others = pool.filter((p) => p.slug !== s.slug).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [s.title, ...others.map((o) => o.title)].sort(() => 0.5 - Math.random());
      return {
        species: s,
        text: 'Which animal is shown here?',
        answer: s.title,
        options,
      };
    });

    setQuizState({
      questions,
      index: 0,
      score: 0,
      selectedAnswer: null,
      isAnswered: false,
    });
    setQuizMode(true);
  };

  const handleAnswer = (option) => {
    if (!quizState || quizState.isAnswered) return;
    const currentQ = quizState.questions[quizState.index];
    const isCorrect = option === currentQ.answer;
    setQuizState((prev) => ({
      ...prev,
      selectedAnswer: option,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const nextQuizQuestion = () => {
    if (!quizState) return;
    setQuizState((prev) => ({
      ...prev,
      index: prev.index + 1,
      selectedAnswer: null,
      isAnswered: false,
    }));
  };

  // Derived IUCN metadata
  const activeIucnKey = activeItem?.statusBadges?.iucn?.toUpperCase() || 'EN';
  const activeRiskMeta = RISK_MAP[activeIucnKey] || RISK_MAP.EN;
  const activeRiskIdx = RISK_ORDER.indexOf(activeIucnKey);

  // High-yield remember facts
  const rememberItems = useMemo(() => {
    if (!activeItem) return [];
    if (activeItem.uniqueFeatures && activeItem.uniqueFeatures.length > 0) {
      return activeItem.uniqueFeatures.slice(0, 3);
    }
    if (activeItem.rememberBullets && activeItem.rememberBullets.length > 0) {
      return activeItem.rememberBullets.slice(0, 3);
    }
    return [
      'Strict legal protection across Indian landscapes under Wildlife (Protection) Act, 1972.',
      'Specialised ecological niche regulating food web stability in native habitats.',
      'Priority species in national conservation assessments and state biodiversity strategies.',
    ];
  }, [activeItem]);

  const currentIndex = items.findIndex((i) => i.slug === selectedSlug);

  return (
    <div className="env-atlas-wrapper">
      {/* 1. Top Sub-Bar (Progress & Actions) */}
      <div className="env-top-progress">
        <Link href="/environment" className="navbtn ghost" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={14} />
          <span>Hub</span>
        </Link>

        <span className="lbl">
          {learnedCount === 0 ? (
            <>
              <b>{items.length}</b> species to learn. Start with the first one.
            </>
          ) : (
            <>
              <b>{learnedCount}</b> learnt · {items.length - learnedCount} to go
            </>
          )}
        </span>

        <div className="ptrack">
          <i
            style={{
              width: `${items.length > 0 ? (learnedCount / items.length) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="env-top-actions">
          <button
            type="button"
            className="navbtn ghost"
            onClick={() => setShowHowItWorks(true)}
          >
            How it works
          </button>
          <button
            type="button"
            className="navbtn"
            onClick={startQuiz}
          >
            Quiz me
          </button>
        </div>
      </div>

      {/* 2. Main Two-Column View */}
      <div className="main-stage">
        {/* LEFT DRAWER (280px) */}
        <aside className="left-drawer">
          <div className="search-wrap">
            <Search size={14} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search an animal or a state"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="chips">
            {['All', 'Mammals', 'Birds', 'Reptiles', 'In news'].map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip ${activeFilter === chip ? 'on' : ''}`}
                onClick={() => setActiveFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="scroll-panel">
            <div className="deck-list">
              {/* Starters Section */}
              {starters.length > 0 && (
                <>
                  <div className="lhd">Start with these {starters.length}</div>
                  {starters.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      className={`item ${s.slug === selectedSlug ? 'on' : ''}`}
                      onClick={() => {
                        setSelectedSlug(s.slug);
                        if (quizMode) setQuizMode(false);
                      }}
                    >
                      <img
                        src={s.imageUrl || `/species/${s.slug}.webp`}
                        alt={s.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/species/bengal-tiger.webp';
                        }}
                      />
                      <span className="t">{s.title}</span>
                      {itemHasNews(s) && <span className="ndot">In news</span>}
                      {learnedMap[s.slug] && <span className="ok">✓</span>}
                    </button>
                  ))}
                </>
              )}

              {/* Remaining Section */}
              {remaining.length > 0 && (
                <>
                  <div className="lhd">Then the rest ({remaining.length})</div>
                  {remaining.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      className={`item ${s.slug === selectedSlug ? 'on' : ''}`}
                      onClick={() => {
                        setSelectedSlug(s.slug);
                        if (quizMode) setQuizMode(false);
                      }}
                    >
                      <img
                        src={s.imageUrl || `/species/${s.slug}.webp`}
                        alt={s.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/species/bengal-tiger.webp';
                        }}
                      />
                      <span className="t">{s.title}</span>
                      {itemHasNews(s) && <span className="ndot">In news</span>}
                      {learnedMap[s.slug] && <span className="ok">✓</span>}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

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
                          backgroundImage: `url(${quizState.questions[quizState.index].species.imageUrl || `/species/${quizState.questions[quizState.index].species.slug}.webp`})`,
                        }}
                      />
                      <img
                        src={
                          quizState.questions[quizState.index].species.imageUrl ||
                          `/species/${quizState.questions[quizState.index].species.slug}.webp`
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
                        const isCorrect = opt === quizState.questions[quizState.index].answer;
                        const isSelected = opt === quizState.selectedAnswer;
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
                            key={opt}
                            type="button"
                            style={btnStyle}
                            onClick={() => handleAnswer(opt)}
                            disabled={quizState.isAnswered}
                          >
                            {opt}
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
                  {/* Photo Banner with Counter & Credit */}
                  <div className="photo">
                    <div
                      className="blur"
                      style={{
                        backgroundImage: `url(${activeItem.imageUrl || `/species/${activeItem.slug}.webp`})`,
                      }}
                    />
                    <img
                      src={activeItem.imageUrl || `/species/${activeItem.slug}.webp`}
                      alt={activeItem.title}
                      onError={(e) => {
                        e.currentTarget.src = '/species/bengal-tiger.webp';
                      }}
                    />
                    <div className="counter">
                      {currentIndex >= 0 ? currentIndex + 1 : 1} of {items.length}
                    </div>
                    {activeItem.credit && (
                      <div className="credit">
                        Photo: {activeItem.credit.artist || 'Wikimedia'} · {activeItem.credit.lic || 'CC BY-SA'} ·{' '}
                        <a href={activeItem.credit.page || '#'} target="_blank" rel="noreferrer">
                          Source
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Titles */}
                  <h1>{activeItem.title}</h1>
                  <div className="sci">{activeItem.subtitle}</div>
                  <p className="oneline">{activeItem.oneline || activeItem.habitatType}</p>

                  {/* How protected is it? */}
                  <div className="sec">
                    <h2>
                      <span>How protected is it?</span>
                      <button type="button" onClick={() => setShowExplain(!showExplain)}>
                        {showExplain ? 'Hide' : 'What do these mean?'}
                      </button>
                    </h2>

                    {showExplain && (
                      <div className="explain">
                        <p>
                          <b>Risk level</b> comes from the IUCN Red List, a global list that rates how close a species is to dying out.
                        </p>
                        <p>
                          <b>Indian law</b> is the Wildlife (Protection) Act, 1972. Schedule I gives the strongest protection.
                        </p>
                        <p>
                          <b>Trade rules</b> come from CITES, a treaty on buying and selling wildlife between countries.
                        </p>
                      </div>
                    )}

                    <div className="prot">
                      {/* Box 1: IUCN */}
                      <div className="pbox">
                        <div className="q">Risk level (IUCN)</div>
                        <div className="a">{activeRiskMeta.label}</div>
                        <div className="meter">
                          {RISK_ORDER.map((rk, idx) => (
                            <i
                              key={rk}
                              style={{
                                background: idx <= activeRiskIdx ? activeRiskMeta.color : undefined,
                              }}
                            />
                          ))}
                        </div>
                        <div className="meterlbl">
                          <span>Low</span>
                          <span>Very high</span>
                        </div>
                        <div className="why" style={{ marginTop: 6 }}>
                          {activeRiskMeta.why}
                        </div>
                      </div>

                      {/* Box 2: Indian Law (WPA 1972) */}
                      <div className="pbox">
                        <div className="q">Indian law (WPA 1972)</div>
                        <div className="a">{activeItem.statusBadges?.wpa || 'Schedule I'}</div>
                        <div className="why">
                          {LAW_EXPLANATIONS[activeItem.statusBadges?.wpa] ||
                            'Highest protection in India. Hunting or trading it is a serious crime.'}
                        </div>
                      </div>

                      {/* Box 3: Trade Rules (CITES) */}
                      <div className="pbox">
                        <div className="q">Trade rules (CITES)</div>
                        <div className="a">{activeItem.statusBadges?.cites || 'Appendix I'}</div>
                        <div className="why">
                          {TRADE_EXPLANATIONS[activeItem.statusBadges?.cites] ||
                            'International trade is banned.'}
                        </div>
                      </div>
                    </div>

                    {/* Official Authentic IUCN Category SVG Diagram (Image 6) */}
                    <IucnThreatGaugeSvg activeStatus={activeItem.statusBadges?.iucn} />
                  </div>

                  {/* Remember These */}
                  <div className="sec">
                    <h2>Remember these</h2>
                    <div className="remember">
                      <ul>
                        {rememberItems.map((bullet, idx) => (
                          <li key={idx}>
                            <span className="ic" aria-hidden="true">
                              {idx === 0 ? '👁' : '•'}
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {activeItem.confusionTrap && (
                      <div className="confuse">
                        <b>Don’t get confused</b>
                        {activeItem.confusionTrap}
                      </div>
                    )}
                  </div>

                  {/* Behaviour & Ecology */}
                  {activeItem.behaviour && (
                    <div className="sec">
                      <h2>Behaviour & Ecology</h2>
                      <div className="remember" style={{ padding: '12px 16px' }}>
                        <span>{activeItem.behaviour}</span>
                      </div>
                    </div>
                  )}

                  {/* PYQs */}
                  {activeItem.similarPYQ?.length > 0 && (
                    <div className="sec">
                      <h2>Asked in UPSC</h2>
                      <div className="pyqbox">
                        <ul>
                          {activeItem.similarPYQ.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Rail */}
                <aside className="rail">
                  {/* In News */}
                  <div className="newsbox">
                    <div
                      className="lhd"
                      style={{
                        padding: '10px 0 6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>In news</span>
                      {activeNews.length > 0 && <span className="ndot">{activeNews.length} recent</span>}
                    </div>

                    {activeNews.length > 0 ? (
                      activeNews.slice(0, 3).map((n, idx) => (
                        <div key={idx} className="nitem">
                          <div className="nmeta">
                            <span className="ntype">{n.tag}</span>
                            <span>{n.date}</span>
                          </div>
                          <div className="nwhat">{n.what}</div>
                          {n.why && (
                            <div className="nwhy">
                              <b>Why it matters:</b> {n.why}
                            </div>
                          )}
                          {n.src && (
                            <div className="nsrc">
                              Source:{' '}
                              {n.url ? (
                                <a href={n.url} target="_blank" rel="noreferrer">
                                  {n.src}
                                </a>
                              ) : (
                                <span>{n.src}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '14px 0', fontSize: 13.5, color: 'var(--muted)' }}>
                        No major news triggers in the last 18 months.
                      </div>
                    )}
                    <div className="nfoot">
                      Last 18 months. Items reviewed against their sources for Prelims 2025–26.
                    </div>
                  </div>

                  {/* Habitat Map & Places */}
                  <div className="sec">
                    <h2>
                      {activeItem.slug.includes('tiger')
                        ? 'Tiger reserves: what to remember'
                        : 'Where to find it'}
                    </h2>
                    <div className="netsum" style={{ fontSize: 13.5, color: 'var(--muted)', margin: '-4px 0 10px' }}>
                      {activeItem.slug.includes('tiger')
                        ? '58 reserves in 18 states. You only need to know these few.'
                        : `${(activeItem.places || []).length} key protected areas across India.`}
                    </div>

                    <div className="where-rail">
                      <EnvironmentMap
                        places={activeItem.places || []}
                        highlightedStates={activeItem.states || []}
                        network={networks[activeItem.networkKey || activeItem.slug]}
                      />

                      <div className="places">
                        {(activeItem.places || []).slice(0, 6).map((p, idx) => (
                          <div key={idx} className="place">
                            <span className="pn">{idx + 1}</span>
                            <span>
                              <b>{p.name}</b>
                              <small>{p.state}</small>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lives Alongside */}
                  {mates.length > 0 && (
                    <div className="sec">
                      <h2>Lives alongside</h2>
                      <div className="mates-note">Other species in the same parks. Learn them together.</div>
                      <div className="mates">
                        {mates.slice(0, 6).map((m) => (
                          <button
                            key={m.slug}
                            type="button"
                            className="mate"
                            onClick={() => {
                              setSelectedSlug(m.slug);
                              const el = document.getElementById('center-scroll');
                              if (el) el.scrollTop = 0;
                            }}
                          >
                            <img
                              src={m.imageUrl || `/species/${m.slug}.webp`}
                              alt={m.title}
                              onError={(e) => {
                                e.currentTarget.src = '/species/bengal-tiger.webp';
                              }}
                            />
                            <span>{m.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>
              </div>

              {/* Sticky Foot */}
              <div className="foot">
                <button
                  type="button"
                  className={`btn learn ${learnedMap[activeItem.slug] ? 'done' : ''}`}
                  onClick={() => toggleLearned(activeItem.slug)}
                >
                  {learnedMap[activeItem.slug] ? '✓ Learnt' : 'I’ve learnt this'}
                </button>
                <button
                  type="button"
                  className="btn dark"
                  onClick={goToNextSpecies}
                >
                  Next species
                </button>
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
                Use <b>I’ve learnt this</b> to track your progress and <b>Quiz me</b> to test rapid recall under exam pressure.
              </p>
              <button
                type="button"
                className="btn dark"
                style={{ width: '100%' }}
                onClick={() => setShowHowItWorks(false)}
              >
                Got it, let's learn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
