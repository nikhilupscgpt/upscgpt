'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import GroupSilhouette from './GroupSilhouette';

const IUCN_CHIPS = ['All', 'CR', 'EN', 'VU', 'NT', 'LC'];

function ThumbnailWithFallback({ src, group, alt }) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <span className="env-thumb-fallback" aria-hidden="true">
        <GroupSilhouette group={group} size={20} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Species List Sidebar / Mobile Drawer (PRD §3.2).
 * - Search + two-row filter chips (zero-count chips hidden)
 * - Sections: "Start with these N" and "The rest (N)"
 * - Rows with 40px thumbnail (silhouette fallback), name, IUCN text pill, group, in-news dot
 * - Keyboard Up/Down moves focus, Enter selects
 */
export default function SpeciesList({
  items = [],
  starters = [],
  remaining = [],
  selectedSlug,
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onSelectSpecies,
  itemHasNews,
  isDrawerOpen,
  onCloseDrawer,
}) {
  const listRef = useRef(null);

  // Derive visible status chips & group chips dynamically so additive species update chips automatically
  const { statusChips, groupChips, hasAnyNews } = useMemo(() => {
    const iucnCounts = new Map();
    const groupCounts = new Map();
    let newsCount = 0;

    for (const item of items) {
      const code = (item.statusBadges?.iucn || '').toUpperCase();
      if (code) iucnCounts.set(code, (iucnCounts.get(code) || 0) + 1);
      if (item.category) {
        groupCounts.set(item.category, (groupCounts.get(item.category) || 0) + 1);
      }
      if (itemHasNews(item)) newsCount += 1;
    }

    const visibleStatus = IUCN_CHIPS.filter(
      (c) => c === 'All' || (iucnCounts.get(c) || 0) > 0
    );
    const visibleGroups = Array.from(groupCounts.keys());

    return {
      statusChips: visibleStatus,
      groupChips: visibleGroups,
      hasAnyNews: newsCount > 0,
    };
  }, [items, itemHasNews]);

  const handleRowKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const buttons = listRef.current?.querySelectorAll('button.item');
    if (!buttons || buttons.length === 0) return;
    const arr = Array.from(buttons);
    const idx = arr.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    const nextIdx =
      e.key === 'ArrowDown'
        ? (idx + 1) % arr.length
        : (idx - 1 + arr.length) % arr.length;
    arr[nextIdx]?.focus();
  };

  const renderRow = (s) => {
    const iucnCode = (s.statusBadges?.iucn || 'EN').toUpperCase();
    return (
      <button
        key={s.slug}
        type="button"
        className={`item ${s.slug === selectedSlug ? 'on' : ''}`}
        onClick={() => onSelectSpecies(s.slug)}
        aria-current={s.slug === selectedSlug ? 'true' : undefined}
      >
        <ThumbnailWithFallback
          src={s.thumb?.url || s.imageUrl || `/species/${s.slug}.webp`}
          group={s.category}
          alt={`${s.title} thumbnail`}
        />
        <span className="item-meta">
          <span className="t">{s.title}</span>
          <span className="item-sub">
            <span className={`iucn-pill iucn-${iucnCode.toLowerCase()}`}>{iucnCode}</span>
            <span>{s.category || 'Species'}</span>
          </span>
        </span>
        {itemHasNews(s) && <span className="news-pulse" title="Recently in news" />}
      </button>
    );
  };

  return (
    <aside className={`left-drawer ${isDrawerOpen ? 'is-open' : ''}`} aria-label="Species list">
      <div className="env-drawer-head">
        <span>Species ({items.length})</span>
        <button
          type="button"
          onClick={onCloseDrawer}
          aria-label="Close species list"
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="search-wrap">
        <Search size={14} color="var(--muted)" aria-hidden="true" />
        <label htmlFor="env-species-search" className="sr-only">
          Find a species, state, or park
        </label>
        <input
          id="env-species-search"
          type="text"
          placeholder="Find a species, state, or park…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Row 1: IUCN status chips; Row 2: Group chips + In news (zero-count chips hidden) */}
      <div className="chips-group">
        <div className="chips" role="group" aria-label="Filter by IUCN status">
          {statusChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`chip ${activeFilter === chip ? 'on' : ''}`}
              onClick={() => onFilterChange(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {(groupChips.length > 0 || hasAnyNews) && (
          <div className="chips" role="group" aria-label="Filter by group or news">
            {groupChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip ${activeFilter === chip ? 'on' : ''}`}
                onClick={() => onFilterChange(chip)}
              >
                {chip}
              </button>
            ))}
            {hasAnyNews && (
              <button
                type="button"
                className={`chip ${activeFilter === 'In news' ? 'on' : ''}`}
                onClick={() => onFilterChange('In news')}
              >
                In news
              </button>
            )}
          </div>
        )}
      </div>

      <div className="scroll-panel" ref={listRef} onKeyDown={handleRowKeyDown}>
        <div className="deck-list">
          {starters.length > 0 && (
            <>
              <div className="lhd">Start with these {starters.length}</div>
              {starters.map(renderRow)}
            </>
          )}

          {remaining.length > 0 && (
            <>
              <div className="lhd">The rest ({remaining.length})</div>
              {remaining.map(renderRow)}
            </>
          )}

          {starters.length === 0 && remaining.length === 0 && (
            <div style={{ padding: '24px 12px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              No species match this filter.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
