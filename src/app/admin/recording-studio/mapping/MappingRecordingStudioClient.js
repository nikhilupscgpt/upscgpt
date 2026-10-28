'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  Image as ImageIcon,
  X,
  ArrowLeft,
  MapPin,
  Globe,
  Radio,
} from 'lucide-react';
import '../../studio/mapping/mapping-studio.css';

const MAPPING_CATEGORIES = [
  { value: 'ALL', label: 'All Mapping Categories' },
  { value: 'rivers', label: 'Rivers, Lakes & Glaciers' },
  { value: 'hills', label: 'Mountains, Hills & Passes' },
  { value: 'protected', label: 'National Parks & Sanctuaries' },
  { value: 'ramsar', label: 'Ramsar Wetlands' },
  { value: 'ports', label: 'Ports, Straits & Corridors' },
  { value: 'minerals', label: 'Minerals & Industrial Belts' },
  { value: 'world physical', label: 'World Physical (Seas, Deserts, Plateaus)' },
  { value: 'places in news', label: 'Places in News (Geopolitical)' },
];

export default function MappingRecordingStudioClient() {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [limit, setLimit] = useState(50);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ staticCount: 0, pinCount: 0, pyqCount: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);
  const [customAttachments, setCustomAttachments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pq_studio_attachments');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const [activeAttachItem, setActiveAttachItem] = useState(null);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachCaption, setAttachCaption] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope !== 'ALL') params.set('scope', scope);
      if (type !== 'ALL') params.set('type', type);
      if (category !== 'ALL') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/studio/mapping?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch mapping items');
      const data = await res.json();

      setItems(data.items || []);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error('[Mapping Recording Studio] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [scope, type, category, search, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveAttachment = () => {
    if (!activeAttachItem) return;
    const updated = {
      ...customAttachments,
      [activeAttachItem.id]: {
        imageUrl: attachUrl.trim(),
        imageCaption: attachCaption.trim() || `${activeAttachItem.place || activeAttachItem.title} Spatial Map`,
      },
    };
    setCustomAttachments(updated);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pq_studio_attachments', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setActiveAttachItem(null);
  };

  const handleRemoveAttachment = (id) => {
    const updated = { ...customAttachments };
    delete updated[id];
    setCustomAttachments(updated);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pq_studio_attachments', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const openAttachModal = (item) => {
    const existing = customAttachments[item.id] || {};
    setAttachUrl(existing.imageUrl || item.imageUrl || '');
    setAttachCaption(existing.imageCaption || item.imageCaption || '');
    setActiveAttachItem(item);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = items.map((i) => i.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const getLaunchUrl = (ids = selectedIds) => {
    return `/admin/recording-studio/present?mode=mapping&mappingIds=${ids.join(',')}`;
  };

  const handleLaunchRecording = (ids = selectedIds) => {
    if (ids.length === 0) return;
    window.open(getLaunchUrl(ids), '_blank');
  };

  return (
    <div className="pq-map-studio-root">
      <header className="pq-map-studio-head">
        <div className="pq-map-head-left">
          <div
            className="pq-map-badge-icon"
            style={{
              background: 'rgba(244, 63, 94, 0.2)',
              color: '#fb7185',
              border: '1px solid rgba(244, 63, 94, 0.4)',
            }}
          >
            <Radio size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="pq-map-studio-title">Mapping Recording Studio</h1>
              <span
                style={{
                  padding: '2px 9px',
                  borderRadius: 999,
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fb7185',
                  fontSize: 10.5,
                  fontWeight: 900,
                }}
              >
                IN-BROWSER RECORDER
              </span>
            </div>
            <p className="pq-map-studio-sub">
              Record River Systems, Static Atlas, Places in News (PIN), and Mapping PYQs with Live Webcam PiP &amp; Auto Chapters
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/recording-studio"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ArrowLeft size={16} />
            <span>Recording Studio Hub</span>
          </Link>
        </div>
      </header>

      <div className="pq-map-filter-container">
        <div className="pq-map-search-row">
          <div className="pq-map-search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by place name, tributary, national park, coordinates, border, or news hook..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pq-map-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="pq-map-filter-grid">
          <div className="pq-map-filter-group">
            <label className="pq-map-filter-label">Regional Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="pq-map-select"
            >
              <option value="ALL">All Regions (India &amp; World)</option>
              <option value="India">India Only</option>
              <option value="World">World Only</option>
            </select>
          </div>

          <div className="pq-map-filter-group">
            <label className="pq-map-filter-label">Data Source</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="pq-map-select"
            >
              <option value="ALL">All Sources ({stats.staticCount + stats.pinCount + stats.pyqCount})</option>
              <option value="STATIC">Curated Static Atlas ({stats.staticCount})</option>
              <option value="PIN">Places in News / PIN ({stats.pinCount})</option>
              <option value="PYQ">Official Mapping PYQs ({stats.pyqCount})</option>
            </select>
          </div>

          <div className="pq-map-filter-group">
            <label className="pq-map-filter-label">Syllabus Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pq-map-select"
            >
              {MAPPING_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pq-map-filter-group">
            <label className="pq-map-filter-label">Display Limit</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="pq-map-select"
              style={{ minWidth: 100 }}
            >
              <option value={25}>25 Items</option>
              <option value={50}>50 Items</option>
              <option value={100}>100 Items</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setScope('ALL');
              setType('ALL');
              setCategory('ALL');
            }}
            className="pq-map-btn-outline"
            style={{ marginTop: 18 }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="pq-map-action-bar">
        <div className="pq-map-action-left">
          <button
            type="button"
            onClick={selectAllVisible}
            className="pq-map-btn-outline"
          >
            <CheckSquare size={14} />
            <span>Select Visible ({items.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="pq-map-btn-clear"
            >
              <Square size={14} />
              <span>Clear Selection ({selectedIds.length})</span>
            </button>
          )}

          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginLeft: 8 }}>
            Showing {items.length} of {total} locations
          </span>
        </div>

        <div>
          <button
            type="button"
            onClick={() => handleLaunchRecording()}
            disabled={selectedIds.length === 0}
            className="pq-map-launch-btn"
          >
            <Play size={16} fill="currentColor" />
            <span>Open in Mapping Recording Studio ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Loading spatial features...</div>
          <div style={{ fontSize: 13 }}>Fetching static atlas nodes, places in news, and PYQs</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No mapping nodes found</div>
          <div style={{ fontSize: 13 }}>Try broadening your search query or reset the category filters.</div>
        </div>
      ) : (
        <div className="pq-map-cards-list">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const hasAttachment = Boolean(customAttachments[item.id]?.imageUrl || item.imageUrl);
            const isIndia = (item.regionScope || '').toLowerCase() === 'india';

            return (
              <div
                key={item.id}
                className={`pq-map-card ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="pq-map-card-head">
                  <div className="pq-map-card-meta">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: isSelected ? '#34d399' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <span className={`pq-badge ${isIndia ? 'pq-badge-scope-india' : 'pq-badge-scope-world'}`}>
                      {item.regionScope || 'India'}
                    </span>

                    <span className={`pq-badge pq-badge-source-${item.sourceType.toLowerCase()}`}>
                      {item.sourceType === 'STATIC' ? 'Static Atlas' : item.sourceType === 'PIN' ? 'Places in News' : 'Mapping PYQ'}
                    </span>

                    {Array.isArray(item.category) && item.category[0] && (
                      <span className="pq-badge pq-badge-category">
                        {item.category[0]}
                      </span>
                    )}
                  </div>

                  {item.coordinates && (
                    <div className="pq-map-coord-pill">
                      <Globe size={13} />
                      <span>{Number(item.coordinates.lat).toFixed(2)}° N, {Number(item.coordinates.lng).toFixed(2)}° E</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="pq-map-place-title">
                    <MapPin size={20} color="#34d399" />
                    <span>{item.place || item.title}</span>
                  </h3>
                  <div className="pq-map-location-sub">
                    <span>{item.locationText || item.placeType || 'Geographical feature'}</span>
                    {Array.isArray(item.aliases) && item.aliases.length > 0 && (
                      <span style={{ color: '#64748b' }}>
                        · Also known as / tributaries: {item.aliases.slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {(item.staticFacts?.length > 0 || item.newsHook || item.stem) && (
                  <div className="pq-map-facts-preview">
                    {item.stem && (
                      <div>
                        <strong>Stem:</strong> {item.stem.substring(0, 220)}...
                      </div>
                    )}
                    {item.newsHook && (
                      <div style={{ color: '#f87171' }}>
                        <strong>Contemporary Context:</strong> {item.newsHook}
                      </div>
                    )}
                    {Array.isArray(item.staticFacts) && item.staticFacts.length > 0 && (
                      <div>
                        <strong>Key Physical Facts:</strong> {item.staticFacts[0]}
                      </div>
                    )}
                  </div>
                )}

                <div className="pq-map-card-foot">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => openAttachModal(item)}
                      className={`pq-map-attach-btn ${hasAttachment ? 'has-attachment' : ''}`}
                    >
                      <ImageIcon size={14} />
                      <span>{hasAttachment ? 'Map Slide Attached ✓' : 'Attach Map Slide / Diagram'}</span>
                    </button>

                    {hasAttachment && customAttachments[item.id] && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handleLaunchRecording([item.id])}
                      className="pq-map-present-solo-btn"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Record Solo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <aside className="pq-map-floating-dock" aria-label="Selected locations queue">
          <div className="pq-map-floating-info">
            <div className="pq-map-floating-count">{selectedIds.length}</div>
            <span>Locations queued for recording</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={clearSelection}
              className="pq-map-btn-clear"
              style={{ padding: '8px 14px' }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleLaunchRecording()}
              className="pq-map-launch-btn"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              <Play size={15} fill="currentColor" />
              <span>Open in Mapping Recording Studio</span>
            </button>
          </div>
        </aside>
      )}

      {activeAttachItem && (
        <div className="pq-map-modal-overlay" onClick={() => setActiveAttachItem(null)}>
          <div className="pq-map-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pq-map-modal-head">
              <h3 className="pq-map-modal-title">
                Attach Map Slide: {activeAttachItem.place || activeAttachItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveAttachItem(null)}
                className="pq-map-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pq-map-modal-field">
              <label className="pq-map-modal-label">Image or Diagram URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={attachUrl}
                onChange={(e) => setAttachUrl(e.target.value)}
                className="pq-map-modal-input"
              />
            </div>

            <div className="pq-map-modal-field">
              <label className="pq-map-modal-label">Slide Caption</label>
              <input
                type="text"
                placeholder="e.g. Ganga River Basin"
                value={attachCaption}
                onChange={(e) => setAttachCaption(e.target.value)}
                className="pq-map-modal-input"
              />
            </div>

            <div className="pq-map-modal-actions">
              <button
                type="button"
                onClick={() => setActiveAttachItem(null)}
                className="pq-map-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttachment}
                disabled={!attachUrl.trim()}
                className="pq-map-launch-btn"
                style={{ padding: '8px 18px', fontSize: 13.5 }}
              >
                Save Attachment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
