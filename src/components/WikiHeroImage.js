'use client';

import React, { useState, useEffect } from 'react';

export default function WikiHeroImage({ wikiTitle, fallbackName, title }) {
  const [imgData, setImgData] = useState({
    src: null,
    credit: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const term = wikiTitle || fallbackName?.replace(/\s+/g, '_');
    if (!term) return;

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Wiki fetch failed');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const src = data.originalimage?.source || data.thumbnail?.source || null;
        setImgData({
          src,
          credit: data.description || 'Wikimedia Commons',
          loading: false,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setImgData({ src: null, credit: null, loading: false });
      });

    return () => {
      isMounted = false;
    };
  }, [wikiTitle, fallbackName]);

  return (
    <div
      className="env-hero-banner"
      style={{
        position: 'relative',
        height: 320,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-card, #0d1527)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imgData.src ? (
        <>
          {/* Main high-res hero photo filling the banner */}
          <img
            src={imgData.src}
            alt={title || 'Species'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
            }}
          />
          {/* Subtle gradient vignette at bottom */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.7) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* Credit pill */}
          {imgData.credit && (
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 14,
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                padding: '3px 10px',
                borderRadius: 6,
                zIndex: 2,
              }}
            >
              📷 {imgData.credit}
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#64748b', fontSize: 13, zIndex: 1 }}>
          {imgData.loading ? 'Loading real-time Wikimedia photo...' : 'Photo from Wikimedia Commons'}
        </div>
      )}
    </div>
  );
}
