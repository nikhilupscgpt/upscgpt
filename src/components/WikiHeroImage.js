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
      style={{
        position: 'relative',
        height: 260,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0d1527',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imgData.src ? (
        <>
          {/* Blurred backdrop glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imgData.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.4)',
              transform: 'scale(1.1)',
            }}
          />
          {/* Sharp main image */}
          <img
            src={imgData.src}
            alt={title || 'Species'}
            style={{
              position: 'relative',
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              zIndex: 1,
            }}
          />
          {/* Credit pill */}
          {imgData.credit && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 12,
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.6)',
                background: 'rgba(0, 0, 0, 0.65)',
                padding: '2px 8px',
                borderRadius: 4,
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
