'use client';

import React, { useEffect, useMemo, useState } from 'react';
import EnvironmentMap from '@/components/EnvironmentMap';
import { adaptSpecies } from '@/lib/environment/species-adapter';

export default function RightPanel({
  activeItem,
  activeNetwork,
  newsItems = [],
  mates = [],
  onSelectSpecies,
}) {
  const [showAllNews, setShowAllNews] = useState(false);
  const [activePlaceIndex, setActivePlaceIndex] = useState(null);
  const [hoveredPlaceIndex, setHoveredPlaceIndex] = useState(null);

  useEffect(() => {
    setShowAllNews(false);
    setActivePlaceIndex(null);
    setHoveredPlaceIndex(null);
  }, [activeItem?.slug]);

  const sourcedNews = useMemo(() => {
    const fallback = adaptSpecies(activeItem)?.news || [];
    const list = newsItems.length > 0 ? newsItems : fallback;
    return list.filter((n) => Boolean(String(n?.src || n?.source || '').trim()));
  }, [activeItem, newsItems]);

  if (!activeItem) return null;

  const hasNetworkSlots = Boolean(activeNetwork?.slots?.length);
  const plainPlaces = (activeItem.places || []).slice(0, 6);

  const togglePlace = (idx) => {
    setActivePlaceIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <aside className="rail" aria-label="In news, habitat map, and co-occurring species">
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
          <span>In news</span>
          {sourcedNews.length > 0 && (
            <span className="cnt">{sourcedNews.length} recent</span>
          )}
        </div>

        {sourcedNews.length > 0 ? (
          <>
            {(showAllNews ? sourcedNews : sourcedNews.slice(0, 2)).map((n, idx) => (
              <div key={idx} className="nitem">
                <div className="nmeta">
                  {n.tag && <span className="ntype">{n.tag}</span>}
                  {n.date && <span>{n.date}</span>}
                  {n.via && (
                    <span className="nvia">
                      About its habitat: {n.via}
                    </span>
                  )}
                </div>
                <div className="nwhat">{n.what}</div>
                {n.why && (
                  <div className="nwhy">
                    <b>Why it matters:</b> {n.why}
                  </div>
                )}
                <div className="nsrc">
                  Source:{' '}
                  {n.url ? (
                    <a href={n.url} target="_blank" rel="noreferrer">
                      {n.src || n.source}
                    </a>
                  ) : (
                    <span>{n.src || n.source}</span>
                  )}
                </div>
              </div>
            ))}
            {sourcedNews.length > 2 && (
              <button
                type="button"
                className="nmore"
                onClick={() => setShowAllNews((v) => !v)}
              >
                {showAllNews ? 'Show fewer' : `See all ${sourcedNews.length} recent items`}
              </button>
            )}
          </>
        ) : (
          <div className="news-empty">
            No major news triggers in the last 18 months. Focus on the basics.
          </div>
        )}

        <div className="nfoot">
          Last 18 months. Items reviewed against their sources for Prelims 2025–26.
        </div>
      </div>

      {/* Habitat Map & Ranked Places */}
      <div className="sec">
        <h2>
          {activeNetwork?.label
            ? `${activeNetwork.label}: what to remember`
            : 'Where it lives'}
        </h2>
        <div className="netsum">
          {activeNetwork
            ? `${activeNetwork.total} reserves in ${activeNetwork.states} states. You only need to know these few.`
            : `${(activeItem.places || []).length} key protected areas across India.`}
        </div>

        <div className="where-rail">
          <EnvironmentMap
            places={activeItem.places || []}
            highlightedStates={activeItem.states || []}
            network={activeNetwork}
            activePlaceIndex={activePlaceIndex}
            hoveredPlaceIndex={hoveredPlaceIndex}
            onSelectPlace={togglePlace}
            onHoverPlace={setHoveredPlaceIndex}
          />

          <div className="places">
            {hasNetworkSlots ? (
              <>
                {activeNetwork.slots.map((x, idx) => {
                  const r = activeNetwork.reserves?.[x.r];
                  const isActive = activePlaceIndex === idx;
                  const isHovered = hoveredPlaceIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`place slot place-btn ${isActive ? 'is-active' : ''} ${
                        isHovered ? 'is-hovered' : ''
                      }`}
                      onMouseEnter={() => setHoveredPlaceIndex(idx)}
                      onMouseLeave={() => setHoveredPlaceIndex(null)}
                      onFocus={() => setHoveredPlaceIndex(idx)}
                      onBlur={() => setHoveredPlaceIndex(null)}
                      onClick={() => togglePlace(idx)}
                      aria-pressed={isActive}
                    >
                      <span className="pn">{idx + 1}</span>
                      <span>
                        <span className="sq">{x.q}</span>
                        <b>{r?.n || x.r}</b>
                        <small>{r?.st || ''}</small>
                        <div className="sa">{x.a}</div>
                        {x.more && <div className="smore">{x.more}</div>}
                      </span>
                    </button>
                  );
                })}
                {activeNetwork.stateMost && (
                  <div className="place slot">
                    <span className="pn st">MP</span>
                    <span>
                      <span className="sq">State with the most</span>
                      <b>{activeNetwork.stateMost.st}</b>
                      <div className="sa">{activeNetwork.stateMost.a}</div>
                    </span>
                  </div>
                )}
              </>
            ) : (
              plainPlaces.map((p, idx) => {
                const isActive = activePlaceIndex === idx;
                const isHovered = hoveredPlaceIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`place slot place-btn ${isActive ? 'is-active' : ''} ${
                      isHovered ? 'is-hovered' : ''
                    }`}
                    onMouseEnter={() => setHoveredPlaceIndex(idx)}
                    onMouseLeave={() => setHoveredPlaceIndex(null)}
                    onFocus={() => setHoveredPlaceIndex(idx)}
                    onBlur={() => setHoveredPlaceIndex(null)}
                    onClick={() => togglePlace(idx)}
                    aria-pressed={isActive}
                  >
                    <span className="pn">{idx + 1}</span>
                    <span>
                      <b>{p.name}</b>
                      <small>{p.state}</small>
                      {p.note && <div className="sa">{p.note}</div>}
                    </span>
                  </button>
                );
              })
            )}
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
                onClick={() => onSelectSpecies(m.slug)}
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
  );
}
