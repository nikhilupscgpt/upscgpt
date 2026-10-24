'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Target, Compass, Globe } from 'lucide-react';

const MappingCanvas = dynamic(() => import('@/components/MappingCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0f1d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: '#38bdf8',
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(56, 189, 248, 0.2)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span>Loading UPSC Spatial Mapping Engine…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function StudioPresenterMap({ currentQ, theme = 'dark' }) {
  const [basemap, setBasemap] = useState('topo'); // 'topo' | 'satellite' | 'light' | 'natgeo'
  const [cameraTrigger, setCameraTrigger] = useState(0);

  const lat = currentQ?.lat != null ? Number(currentQ.lat) : 22.5;
  const lng = currentQ?.lng != null ? Number(currentQ.lng) : 80.5;
  const isWorld = (currentQ?.regionScope || '').toLowerCase() === 'world';

  // Build active node payload for MappingCanvas
  const activeNode = useMemo(() => {
    if (!currentQ) return null;
    return {
      id: currentQ.id || 'current_node',
      place: currentQ.place || currentQ.title || 'Location',
      placeType: currentQ.placeType || 'Geographical Feature',
      regionScope: currentQ.regionScope || (isWorld ? 'World' : 'India'),
      locatedIn: currentQ.locatedIn || {
        stateOrProvince: currentQ.locationText || 'India',
      },
      lat,
      lng,
      shape: Array.isArray(currentQ.shape) && currentQ.shape.length > 1 ? currentQ.shape : null,
      mapCategory: Array.isArray(currentQ.mapCategory)
        ? currentQ.mapCategory
        : [currentQ.mapCategory || currentQ.category || 'India – rivers, lakes, reservoirs & glaciers'],
      staticFacts: currentQ.staticFacts || [],
    };
  }, [currentQ, lat, lng, isWorld]);

  const nodes = useMemo(() => {
    return activeNode ? [activeNode] : [];
  }, [activeNode]);

  const cameraTarget = useMemo(() => {
    return {
      center: [lat, lng],
      zoom: isWorld ? 4.5 : 6,
      ts: `${lat}-${lng}-${cameraTrigger}`,
    };
  }, [lat, lng, isWorld, cameraTrigger]);

  const handleRecenter = () => {
    setCameraTrigger((prev) => prev + 1);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#060913',
      }}
    >
      {/* Floating Basemap Controls & Recenter Button (Top Left) */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          padding: '4px 6px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <button
          type="button"
          onClick={() => setBasemap('topo')}
          style={{
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: basemap === 'topo' ? '#0284c7' : 'transparent',
            color: basemap === 'topo' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
          title="Topographic Physical Map (Contours & Rivers)"
        >
          Topo
        </button>

        <button
          type="button"
          onClick={() => setBasemap('satellite')}
          style={{
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: basemap === 'satellite' ? '#0284c7' : 'transparent',
            color: basemap === 'satellite' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
          title="Satellite Imagery"
        >
          Satellite
        </button>

        <button
          type="button"
          onClick={() => setBasemap('light')}
          style={{
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: basemap === 'light' ? '#0284c7' : 'transparent',
            color: basemap === 'light' ? '#ffffff' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
          title="Clean Light Canvas"
        >
          Light
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.2)', margin: '0 2px' }} />

        <button
          type="button"
          onClick={handleRecenter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            transition: 'all 0.15s ease',
          }}
          title="Focus on this location"
        >
          <Target size={13} />
          <span>Focus</span>
        </button>
      </div>

      {/* Floating Spatial Engine Watermark (Top Right of Map) */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '5px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#34d399',
          pointerEvents: 'none',
        }}
      >
        <Compass size={14} />
        <span>UPSC SPATIAL ENGINE</span>
      </div>

      {/* Bottom Coordinates HUD Pill (Bottom Left of Map) */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: 12,
          fontWeight: 800,
          fontFamily: 'monospace',
          color: '#f1f5f9',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
        }}
      >
        <Globe size={14} color="#34d399" />
        <span>{lat.toFixed(2)}° N, {lng.toFixed(2)}° E</span>
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
        <span style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#94a3b8' }}>
          {currentQ?.place || 'Location'}
        </span>
      </div>

      {/* Interactive Leaflet Map Canvas */}
      <MappingCanvas
        nodes={nodes}
        selectedNode={activeNode}
        basemap={basemap}
        showIndiaStates={true}
        showGraticules={true}
        cameraTarget={cameraTarget}
      />
    </div>
  );
}
