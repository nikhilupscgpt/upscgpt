'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const MappingCanvas = dynamic(() => import('./MappingCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0b0f19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      Loading map...
    </div>
  ),
});

const STATIC_INDIA_FOLDERS = [
  {
    id: 'india-rivers',
    title: 'Rivers & Drainage Systems',
    emoji: '🏞️',
    color: '#0ea5e9',
    categories: ['India – rivers, lakes, reservoirs & glaciers'],
  },
  {
    id: 'india-relief',
    title: 'Mountain Ranges, Passes & Islands',
    emoji: '⛰️',
    color: '#8b5cf6',
    categories: ['India – relief, hills, coasts & islands'],
  },
  {
    id: 'india-protected',
    title: 'National Parks & Tiger Reserves',
    emoji: '🐅',
    color: '#10b981',
    categories: ['Protected areas (NPs, WLS, tiger reserves)'],
  },
  {
    id: 'india-wetlands',
    title: 'Ramsar Wetlands & Lakes',
    emoji: '🦩',
    color: '#14b8a6',
    categories: ['Wetlands & Ramsar sites'],
  },
  {
    id: 'india-ports',
    title: 'Ports & Strategic Corridors',
    emoji: '⚓',
    color: '#3b82f6',
    categories: ['Ports, highways & corridors'],
  },
  {
    id: 'india-minerals-heritage',
    title: 'Minerals, Energy & Heritage',
    emoji: '⛏️',
    color: '#f59e0b',
    categories: [
      'Minerals & resources by place',
      'Energy & industrial sites',
      'Historical & archaeological sites',
      'Tribes, communities & cultural places',
    ],
  },
];

const STATIC_WORLD_FOLDERS = [
  {
    id: 'world-physical',
    title: 'Major Rivers, Mountains & Lakes',
    emoji: '🏔️',
    color: '#0ea5e9',
    categories: ['World – physical features'],
  },
  {
    id: 'world-landforms',
    title: 'Volcanoes, Deserts & Plateaus',
    emoji: '🌋',
    color: '#e11d48',
    categories: ['Landforms & volcanoes'],
  },
  {
    id: 'world-minerals',
    title: 'Global Mineral & Resource Belts',
    emoji: '⛏️',
    color: '#f59e0b',
    categories: ['Minerals & resources by place'],
  },
];

const IR_FOLDERS = [
  {
    id: 'ir-groupings',
    title: 'International Groupings & Blocs',
    emoji: '🏛️',
    color: '#f59e0b',
    isOrgFolder: true,
    categories: [],
  },
  {
    id: 'ir-chokepoints',
    title: 'Maritime Chokepoints, Straits & Seas',
    emoji: '🌊',
    color: '#6366f1',
    categories: ['World – countries, borders & seas'],
  },
  {
    id: 'ir-projects',
    title: 'Strategic Projects & Ports Abroad',
    emoji: '🛰️',
    color: '#f97316',
    categories: ['Strategic projects abroad'],
  },
  {
    id: 'ir-flashpoints',
    title: 'Conflict Zones & Flashpoints',
    emoji: '⚔️',
    color: '#ef4444',
    categories: ['World – places in news'],
  },
];

const PIN_THEMATIC_FOLDERS = [
  {
    id: 'pin-protected',
    title: 'Protected Areas & Corridors',
    emoji: '🐅',
    color: '#10b981',
    categories: ['Protected areas (NPs, WLS, tiger reserves)'],
  },
  {
    id: 'pin-wetlands',
    title: 'Wetlands & Ramsar Sites',
    emoji: '🦩',
    color: '#14b8a6',
    categories: ['Wetlands & Ramsar sites'],
  },
  {
    id: 'pin-india-phys',
    title: 'India Rivers, Dams & Relief',
    emoji: '🏞️',
    color: '#0ea5e9',
    categories: [
      'India – rivers, lakes, reservoirs & glaciers',
      'India – relief, hills, coasts & islands',
      'Ports, highways & corridors',
      'Minerals & resources by place',
      'Energy & industrial sites',
    ],
  },
  {
    id: 'pin-world-seas',
    title: 'World Borders, Seas & Landforms',
    emoji: '🌊',
    color: '#6366f1',
    categories: [
      'World – countries, borders & seas',
      'World – physical features',
      'Landforms & volcanoes',
    ],
  },
  {
    id: 'pin-world-news',
    title: 'Global Flashpoints & Strategic Projects',
    emoji: '⚔️',
    color: '#ef4444',
    categories: ['World – places in news', 'Strategic projects abroad'],
  },
  {
    id: 'pin-heritage',
    title: 'Heritage, Cultural & Tribal Sites',
    emoji: '🏛️',
    color: '#ec4899',
    categories: [
      'Historical & archaeological sites',
      'Tribes, communities & cultural places',
    ],
  },
];

export default function MappingWorkspace({
  initialMode = null, // null (Landing) | 'STATIC_INDIA' | 'STATIC_WORLD' | 'PIN' | 'IR'
}) {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [staticExpanded, setStaticExpanded] = useState(false);

  // Filters inside the map view
  const [pinScope, setPinScope] = useState('ALL'); // ALL | India | World
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [spatialSort, setSpatialSort] = useState('DEFAULT'); // DEFAULT | N_TO_S | S_TO_N | E_TO_W | W_TO_E
  const [searchQuery, setSearchQuery] = useState('');
  const [basemap, setBasemap] = useState('topo');

  // Data
  const [allNodes, setAllNodes] = useState([]);
  const [allPyqs, setAllPyqs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection & Progressive Disclosure states
  const [selectedNode, setSelectedNode] = useState(null); // NULL by default -> drawer closed!
  const [activeOrg, setActiveOrg] = useState(null);
  const [pyqExpanded, setPyqExpanded] = useState(false); // Collapsed by default inside drawer
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});

  const [cameraTarget, setCameraTarget] = useState({
    center: [22.5, 80.5],
    zoom: 5,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkspace() {
      setLoading(true);
      try {
        const res = await fetch('/api/mapping/workspace');
        const data = await res.json();
        if (!cancelled && res.ok) {
          setAllNodes(Array.isArray(data.nodes) ? data.nodes : []);
          setAllPyqs(Array.isArray(data.pyqs) ? data.pyqs : []);
          setOrganizations(Array.isArray(data.organizations) ? data.organizations : []);
        }
      } catch (err) {
        console.error('Failed to load mapping workspace:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  // Base nodes belonging strictly to the active mode (no cross-pillar bleed!)
  const modeBaseNodes = useMemo(() => {
    if (!activeMode) return [];
    if (activeMode === 'STATIC_INDIA') {
      return allNodes.filter(
        (n) => !n.isPin && n.pillar === 'STATIC' && (n.regionScope || '').toLowerCase() === 'india'
      );
    }
    if (activeMode === 'STATIC_WORLD') {
      return allNodes.filter(
        (n) => !n.isPin && n.pillar === 'STATIC' && (n.regionScope || '').toLowerCase() === 'world'
      );
    }
    if (activeMode === 'PIN') {
      return allNodes.filter((n) => {
        if (!n.isPin) return false;
        if (pinScope === 'ALL') return true;
        return (n.regionScope || '').toLowerCase() === pinScope.toLowerCase();
      });
    }
    if (activeMode === 'IR') {
      return allNodes.filter((n) => !n.isPin && n.pillar === 'IR');
    }
    return [];
  }, [allNodes, activeMode, pinScope]);

  const sortNodes = (list) => {
    const copy = [...list];
    copy.sort((a, b) => {
      if (spatialSort === 'N_TO_S') return (b.lat ?? -999) - (a.lat ?? -999);
      if (spatialSort === 'S_TO_N') return (a.lat ?? 999) - (b.lat ?? 999);
      if (spatialSort === 'E_TO_W') return (b.lng ?? -999) - (a.lng ?? -999);
      if (spatialSort === 'W_TO_E') return (a.lng ?? 999) - (b.lng ?? 999);
      return (a.place || '').localeCompare(b.place || '');
    });
    return copy;
  };

  // Build Thematic Folders for the Left Sidebar Accordion ("One Layer at a Time")
  const folders = useMemo(() => {
    if (!activeMode) return [];

    if (activeMode === 'STATIC_INDIA') {
      return STATIC_INDIA_FOLDERS.map((f) => ({
        ...f,
        items: sortNodes(
          modeBaseNodes.filter((n) =>
            (n.mapCategory || []).some((c) => f.categories.includes(c))
          )
        ),
      })).filter((f) => f.items.length > 0);
    }

    if (activeMode === 'STATIC_WORLD') {
      return STATIC_WORLD_FOLDERS.map((f) => ({
        ...f,
        items: sortNodes(
          modeBaseNodes.filter((n) =>
            (n.mapCategory || []).some((c) => f.categories.includes(c))
          )
        ),
      })).filter((f) => f.items.length > 0);
    }

    if (activeMode === 'IR') {
      return IR_FOLDERS.map((f) => {
        if (f.isOrgFolder) {
          return {
            ...f,
            items: organizations,
          };
        }
        return {
          ...f,
          items: sortNodes(
            modeBaseNodes.filter((n) =>
              (n.mapCategory || []).some((c) => f.categories.includes(c))
            )
          ),
        };
      }).filter((f) => f.items.length > 0);
    }

    if (activeMode === 'PIN') {
      return PIN_THEMATIC_FOLDERS.map((f) => ({
        ...f,
        items: sortNodes(
          modeBaseNodes.filter((n) => {
            const primaryCat = (n.mapCategory || [])[0] || '';
            return f.categories.includes(primaryCat);
          })
        ),
      })).filter((f) => f.items.length > 0);
    }

    return [];
  }, [activeMode, modeBaseNodes, organizations, spatialSort]);

  // Keep a valid single folder active when entering a mode or changing scope
  useEffect(() => {
    if (!activeMode || folders.length === 0) return;
    const exists = folders.some((f) => f.id === activeFolderId);
    if (!exists) {
      // In IR mode, default to Maritime Chokepoints or Groupings
      const defaultFolder =
        activeMode === 'IR'
          ? folders.find((f) => f.id === 'ir-chokepoints') || folders[0]
          : folders[0];
      setActiveFolderId(defaultFolder.id);
    }
  }, [activeMode, folders, activeFolderId]);

  const enterMode = (mode) => {
    setActiveMode(mode);
    setSelectedNode(null);
    setActiveOrg(null);
    setSearchQuery('');
    setPyqExpanded(false);
    setActiveFolderId(null); // useEffect will pick the first folder of this mode

    if (mode === 'STATIC_INDIA') {
      setCameraTarget({ center: [22.5, 80.5], zoom: 5 });
    } else if (mode === 'STATIC_WORLD') {
      setCameraTarget({ center: [20.0, 18.0], zoom: 2.4 });
    } else if (mode === 'PIN') {
      setCameraTarget({ center: [24.0, 65.0], zoom: 3.5 });
    } else if (mode === 'IR') {
      setCameraTarget({ center: [24.0, 48.0], zoom: 3 });
    }
  };

  // Active folder object
  const activeFolder = useMemo(
    () => folders.find((f) => f.id === activeFolderId) || folders[0] || null,
    [folders, activeFolderId]
  );

  // Nodes plotted on the map:
  // - If searching, show matching nodes across the active mode.
  // - Otherwise, plot ONLY the nodes inside the single active folder!
  const plottedNodes = useMemo(() => {
    if (!activeMode) return [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return sortNodes(
        modeBaseNodes.filter(
          (n) =>
            (n.place || '').toLowerCase().includes(q) ||
            (n.placeType || '').toLowerCase().includes(q) ||
            (n.locatedIn?.stateOrProvince || '').toLowerCase().includes(q) ||
            (n.locatedIn?.country || '').toLowerCase().includes(q)
        )
      );
    }

    if (!activeFolder || activeFolder.isOrgFolder) {
      return [];
    }

    return activeFolder.items || [];
  }, [activeMode, searchQuery, modeBaseNodes, activeFolder, spatialSort]);

  const pyqsForSelected = useMemo(() => {
    if (!selectedNode) return [];
    return selectedNode.resolvedSimilarPYQs || [];
  }, [selectedNode]);

  const handleSelectNode = (node) => {
    setActiveOrg(null);
    setSelectedNode(node);
    setPyqExpanded(false);
  };

  const handleSelectOrg = (org) => {
    setSelectedNode(null);
    setActiveOrg((prev) => (prev?.id === org.id ? null : org));
  };

  const handleOptionClick = (qId, label) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: label }));
    setRevealedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  // =========================================================================
  // STEP 1: CALM 3-OPTION LANDING SCREEN (When activeMode === null)
  // =========================================================================
  if (!activeMode) {
    const pinCount = allNodes.filter((n) => n.isPin).length;

    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: '#0b0f19',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 960, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Mapping
            </h1>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Choose a mapping module to open the interactive canvas
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {/* Card 1: Static Mapping */}
            <div
              onClick={() => setStaticExpanded((prev) => !prev)}
              style={{
                background: '#111827',
                border: staticExpanded
                  ? '1.5px solid #10b981'
                  : '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  🗺️
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  Static Mapping
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Rivers, mountain ranges, passes, Ramsar wetlands, protected areas, ports, and mineral belts.
                </p>
              </div>

              {staticExpanded ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 22,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => enterMode('STATIC_INDIA')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(16,185,129,0.4)',
                      background: 'rgba(16,185,129,0.14)',
                      color: '#34d399',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    🇮🇳 India
                  </button>
                  <button
                    type="button"
                    onClick={() => enterMode('STATIC_WORLD')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(56,189,248,0.4)',
                      background: 'rgba(56,189,248,0.14)',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    🌍 World
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 22,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#34d399',
                  }}
                >
                  Select India or World →
                </div>
              )}
            </div>

            {/* Card 2: PIN (Places in News) */}
            <div
              onClick={() => enterMode('PIN')}
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  📍
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  PIN (Places in News)
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Curated current-affairs locations enriched with static geographical pointers and linked UPSC PYQs.
                </p>
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#38bdf8',
                }}
              >
                Explore {pinCount > 0 ? `${pinCount} Places in News` : 'Places in News'} →
              </div>
            </div>

            {/* Card 3: IR Mapping */}
            <div
              onClick={() => enterMode('IR')}
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  🌐
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  IR Mapping
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  International groupings, maritime chokepoints, bordering seas, and strategic projects abroad.
                </p>
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fbbf24',
                }}
              >
                Open IR Map →
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 2: CALM, LAYER-BY-LAYER INTERACTIVE MAP VIEW
  // =========================================================================
  const modeTitle =
    activeMode === 'STATIC_INDIA'
      ? '🇮🇳 India Static Mapping'
      : activeMode === 'STATIC_WORLD'
        ? '🌍 World Static Mapping'
        : activeMode === 'PIN'
          ? '📍 Places in News (PIN)'
          : '🌐 IR Mapping';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        width: '100%',
        background: '#0b0f19',
        color: '#f8fafc',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Clean Minimal Top Bar (50px) */}
      <div
        style={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          background: '#0f172a',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          zIndex: 20,
        }}
      >
        {/* Left: Back to Mapping + Current Track Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={() => {
              setActiveMode(null);
              setSelectedNode(null);
              setActiveOrg(null);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#cbd5e1',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← All Mapping Tracks
          </button>

          <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
            {modeTitle}
          </span>

          {/* Quick India/World switch if inside Static Mapping */}
          {(activeMode === 'STATIC_INDIA' || activeMode === 'STATIC_WORLD') && (
            <div
              style={{
                display: 'inline-flex',
                background: '#090d16',
                padding: 2,
                borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <button
                type="button"
                onClick={() => enterMode('STATIC_INDIA')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 5,
                  border: 'none',
                  background: activeMode === 'STATIC_INDIA' ? '#1e293b' : 'transparent',
                  color: activeMode === 'STATIC_INDIA' ? '#34d399' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                India
              </button>
              <button
                type="button"
                onClick={() => enterMode('STATIC_WORLD')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 5,
                  border: 'none',
                  background: activeMode === 'STATIC_WORLD' ? '#1e293b' : 'transparent',
                  color: activeMode === 'STATIC_WORLD' ? '#38bdf8' : '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                World
              </button>
            </div>
          )}

          {/* Simple All / India / World toggle if inside PIN mode */}
          {activeMode === 'PIN' && (
            <div
              style={{
                display: 'inline-flex',
                background: '#090d16',
                padding: 2,
                borderRadius: 7,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {['ALL', 'India', 'World'].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => {
                    setPinScope(sc);
                    setSelectedNode(null);
                    if (sc === 'India') setCameraTarget({ center: [22.5, 80.5], zoom: 5 });
                    else if (sc === 'World') setCameraTarget({ center: [20.0, 18.0], zoom: 2.4 });
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: 'none',
                    background: pinScope === sc ? '#1e293b' : 'transparent',
                    color: pinScope === sc ? '#38bdf8' : '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {sc === 'ALL' ? 'All' : sc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Layer Indicator + Compass Sort + Basemap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeFolder && !searchQuery.trim() && (
            <span
              style={{
                fontSize: 12,
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              Active Layer: <strong style={{ color: '#f8fafc' }}>{activeFolder.emoji} {activeFolder.title}</strong>
            </span>
          )}

          <select
            value={spatialSort}
            onChange={(e) => setSpatialSort(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 7,
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              fontSize: 12,
            }}
          >
            <option value="DEFAULT">Order: Alphabetical</option>
            <option value="N_TO_S">North → South</option>
            <option value="S_TO_N">South → North</option>
            <option value="E_TO_W">East → West</option>
            <option value="W_TO_E">West → East</option>
          </select>

          <select
            value={basemap}
            onChange={(e) => setBasemap(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 7,
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              fontSize: 12,
            }}
          >
            <option value="topo">Topographic Map</option>
            <option value="natgeo">National Geographic</option>
            <option value="satellite">Satellite</option>
            <option value="light">Minimal Light</option>
          </select>
        </div>
      </div>

      {/* Main Body: Left Thematic Folder Accordion (290px) + Map Canvas + Slide-Over Drawer */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* Left Sidebar: Thematic Folder Accordion ("One Layer at a Time") */}
        <div
          style={{
            width: 295,
            minWidth: 295,
            background: '#0f172a',
            borderRight: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              padding: '12px 12px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place in this track..."
              style={{
                width: '100%',
                padding: '8px 11px',
                borderRadius: 8,
                background: '#090d16',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8fafc',
                fontSize: 12.5,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Folder Accordion OR Search Results */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 18px' }}>
            {loading ? (
              <div style={{ fontSize: 12, color: '#64748b', padding: 8 }}>Loading layers...</div>
            ) : searchQuery.trim() ? (
              /* Search Results View */
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#94a3b8',
                    padding: '2px 4px 8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{plottedNodes.length} matching places</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: 11,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {plottedNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const locationLabel =
                      node.locatedIn?.stateOrProvince ||
                      node.locatedIn?.country ||
                      node.regionScope;
                    return (
                      <div
                        key={node.id}
                        onClick={() => handleSelectNode(node)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255,255,255,0.02)',
                          border: isSelected
                            ? '1px solid rgba(56, 189, 248, 0.45)'
                            : '1px solid transparent',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#38bdf8' : '#f1f5f9' }}>
                          {node.place}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                          {node.placeType} • {locationLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Thematic Folders Accordion (One Open Layer at a Time) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', padding: '0 4px 2px' }}>
                  Select a layer folder to plot on the map:
                </div>

                {folders.map((folder) => {
                  const isOpen = activeFolder?.id === folder.id;

                  return (
                    <div
                      key={folder.id}
                      style={{
                        borderRadius: 10,
                        background: isOpen ? '#111827' : 'rgba(255,255,255,0.02)',
                        border: isOpen
                          ? `1px solid ${folder.color}66`
                          : '1px solid rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Folder Header Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFolderId(folder.id);
                          setSelectedNode(null);
                          if (!folder.isOrgFolder) {
                            setActiveOrg(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: '#f8fafc',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                          <span style={{ fontSize: 15 }}>{folder.emoji}</span>
                          <span
                            style={{
                              fontSize: 12.5,
                              fontWeight: isOpen ? 700 : 600,
                              color: isOpen ? '#ffffff' : '#cbd5e1',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {folder.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 999,
                              background: isOpen ? `${folder.color}26` : 'rgba(255,255,255,0.06)',
                              color: isOpen ? folder.color : '#94a3b8',
                            }}
                          >
                            {folder.items.length}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {isOpen ? '▾' : '▸'}
                          </span>
                        </div>
                      </button>

                      {/* Folder Entries (Shown ONLY for the single active folder) */}
                      {isOpen && (
                        <div
                          style={{
                            padding: '4px 8px 8px',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          {folder.isOrgFolder
                            ? folder.items.map((org) => {
                                const isOrgSelected = activeOrg?.id === org.id;
                                return (
                                  <div
                                    key={org.id}
                                    onClick={() => handleSelectOrg(org)}
                                    style={{
                                      padding: '8px 10px',
                                      borderRadius: 7,
                                      cursor: 'pointer',
                                      background: isOrgSelected
                                        ? 'rgba(245, 158, 11, 0.16)'
                                        : 'transparent',
                                      border: isOrgSelected
                                        ? '1px solid rgba(245, 158, 11, 0.5)'
                                        : '1px solid transparent',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        color: isOrgSelected ? '#fbbf24' : '#f1f5f9',
                                      }}
                                    >
                                      {org.shortName}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                                      {org.name}
                                    </div>
                                  </div>
                                );
                              })
                            : folder.items.map((node) => {
                                const isSelected = selectedNode?.id === node.id;
                                const locationLabel =
                                  node.locatedIn?.stateOrProvince ||
                                  node.locatedIn?.country ||
                                  node.regionScope;

                                return (
                                  <div
                                    key={node.id}
                                    onClick={() => handleSelectNode(node)}
                                    style={{
                                      padding: '8px 10px',
                                      borderRadius: 7,
                                      cursor: 'pointer',
                                      background: isSelected
                                        ? 'rgba(56, 189, 248, 0.14)'
                                        : 'transparent',
                                      border: isSelected
                                        ? '1px solid rgba(56, 189, 248, 0.45)'
                                        : '1px solid transparent',
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: isSelected ? '#38bdf8' : '#f1f5f9',
                                      }}
                                    >
                                      {node.place}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                                      {node.placeType} • {locationLabel}
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Map Canvas (Plots ONLY the active folder's layer or active IR Grouping!) */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <MappingCanvas
            nodes={plottedNodes}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
            basemap={basemap}
            showIndiaStates={activeMode === 'STATIC_INDIA' || pinScope === 'India'}
            showGraticules={true}
            cameraTarget={cameraTarget}
            activeOrg={activeOrg}
          />
        </div>

        {/* Step 3A: Slide-Over Card for Active IR Grouping (When an Organization is clicked) */}
        {activeOrg && !selectedNode && (
          <div
            style={{
              width: 380,
              minWidth: 350,
              background: '#0f172a',
              borderLeft: '1px solid rgba(255,255,255,0.09)',
              height: '100%',
              overflowY: 'auto',
              padding: '20px 20px 28px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: 30,
              boxShadow: '-8px 0 24px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                  International Grouping
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 700, margin: '4px 0 0', color: '#ffffff' }}>
                  {activeOrg.shortName} — {activeOrg.name}
                </h2>
                <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                  HQ: {activeOrg.hq || 'N/A'} • Est. {activeOrg.established || 'N/A'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrg(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#111827',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 13,
                color: '#e2e8f0',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 6 }}>
                India&apos;s Position
              </div>
              {activeOrg.indiaStatus || 'Key strategic partner'}
            </div>

            <div
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
                Member Countries (Shaded on Map)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(activeOrg.members || '')
                  .split(',')
                  .map((m) => m.trim())
                  .filter(Boolean)
                  .map((member) => (
                    <span
                      key={member}
                      style={{
                        fontSize: 12,
                        padding: '4px 9px',
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fde68a',
                      }}
                    >
                      {member}
                    </span>
                  ))}
              </div>
            </div>

            {activeOrg.upscRelevance && (
              <div
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontSize: 13,
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                  UPSC Prelims Relevance
                </div>
                {activeOrg.upscRelevance}
              </div>
            )}
          </div>
        )}

        {/* Step 3B: Calm Slide-Over Place Card (Renders ONLY when selectedNode is non-null!) */}
        {selectedNode && (
          <div
            style={{
              width: 390,
              minWidth: 360,
              background: '#0f172a',
              borderLeft: '1px solid rgba(255,255,255,0.09)',
              height: '100%',
              overflowY: 'auto',
              padding: '20px 20px 28px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: 30,
              boxShadow: '-8px 0 24px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header with Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: '#ffffff', lineHeight: 1.3 }}>
                  {selectedNode.place}
                </h2>
                <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                  {selectedNode.placeType} •{' '}
                  {[
                    selectedNode.locatedIn?.stateOrProvince,
                    selectedNode.locatedIn?.country,
                  ]
                    .filter(Boolean)
                    .join(', ') || selectedNode.regionScope}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                title="Close panel"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* 1. Why in News (Only if newsTriggers exist) */}
            {Array.isArray(selectedNode.newsTriggers) && selectedNode.newsTriggers.length > 0 && (
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.07)',
                  borderLeft: '3px solid #38bdf8',
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#e2e8f0',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 4 }}>
                  Why in News
                </div>
                {selectedNode.newsTriggers[0].newsHook}{' '}
                {selectedNode.newsTriggers[0].url && (
                  <a
                    href={selectedNode.newsTriggers[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', fontSize: 12 }}
                  >
                    Source ↗
                  </a>
                )}
              </div>
            )}

            {/* 2. Key Map Pointers (Static Facts + Neighbours cleanly combined) */}
            <div
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Key Map Pointers
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 13,
                  color: '#e2e8f0',
                  lineHeight: 1.65,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {(selectedNode.staticFacts || []).map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
                {selectedNode.neighbours?.length > 0 && (
                  <li style={{ color: '#94a3b8' }}>
                    <strong style={{ color: '#cbd5e1' }}>Surrounding / Neighbours:</strong>{' '}
                    {selectedNode.neighbours.join(' • ')}
                  </li>
                )}
              </ul>
            </div>

            {/* 3. Progressive Disclosure PYQ Accordion */}
            {pyqsForSelected.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setPyqExpanded((v) => !v)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📖 Practice Related PYQs</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(16, 185, 129, 0.25)',
                        color: '#34d399',
                        fontWeight: 700,
                      }}
                    >
                      {pyqsForSelected.length}
                    </span>
                  </div>
                  <span>{pyqExpanded ? '▴' : '▾'}</span>
                </button>

                {pyqExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                    {pyqsForSelected.map((q) => {
                      const chosen = selectedAnswers[q.id];
                      const isRevealed = revealedQuestions[q.id];
                      return (
                        <div
                          key={q.id}
                          style={{
                            background: '#111827',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: 10,
                            padding: 13,
                            fontSize: 12.5,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: '#34d399',
                              marginBottom: 6,
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{q.exam} ({q.examYear})</span>
                          </div>
                          <div
                            style={{
                              whiteSpace: 'pre-line',
                              color: '#f1f5f9',
                              lineHeight: 1.55,
                              marginBottom: 10,
                            }}
                          >
                            {q.stem}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(q.options || []).map((opt) => {
                              const isCorrect =
                                (opt.label || '').toLowerCase() ===
                                (q.correctLabel || '').toLowerCase();
                              const isSelected = chosen === opt.label;
                              let border = 'rgba(255,255,255,0.1)';
                              let bg = '#090d16';
                              if (isRevealed) {
                                if (isCorrect) {
                                  border = '#10b981';
                                  bg = 'rgba(16,185,129,0.15)';
                                } else if (isSelected) {
                                  border = '#ef4444';
                                  bg = 'rgba(239,68,68,0.15)';
                                }
                              }
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => handleOptionClick(q.id, opt.label)}
                                  style={{
                                    textAlign: 'left',
                                    padding: '7px 10px',
                                    borderRadius: 7,
                                    border: `1px solid ${border}`,
                                    background: bg,
                                    color: '#e2e8f0',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <strong>({opt.label})</strong> {opt.text}
                                </button>
                              );
                            })}
                          </div>
                          {isRevealed && (
                            <div
                              style={{
                                marginTop: 8,
                                color: '#34d399',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              ✓ Answer: ({q.correctLabel?.toUpperCase()}) {q.answerText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
