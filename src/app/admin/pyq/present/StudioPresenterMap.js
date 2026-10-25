'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Target, Compass, Globe, Move, PenTool, Tag, Columns } from 'lucide-react';
import { getRiverSpatialNodes, RIVER_GIS_REGISTRY } from '@/lib/riverSpatialLayers';

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

export default function StudioPresenterMap({
  currentQ,
  currentStep,
  theme = 'dark',
  activeTool = 'pen',
  onSetActiveTool,
  mapWidthMode = 'split', // 'split' (58%) | 'wide' (72%) | 'full' (100%)
  onCycleMapWidth,
  spotlightIndex = null,
}) {
  const [basemap, setBasemap] = useState('topo'); // 'topo' | 'satellite' | 'light' | 'natgeo'
  const [showLabels, setShowLabels] = useState(true);
  const [cameraTrigger, setCameraTrigger] = useState(0);

  // Active Spatial Layers
  const [activeLayers, setActiveLayers] = useState({
    spine: true,
    leftBank: false,
    rightBank: false,
    dams: false,
    protectedAreas: false,
  });

  const lat = currentQ?.lat != null ? Number(currentQ.lat) : 22.5;
  const lng = currentQ?.lng != null ? Number(currentQ.lng) : 80.5;
  const isWorld = (currentQ?.regionScope || '').toLowerCase() === 'world';

  const isRiver = Boolean(
    currentQ?.riverDetails ||
    RIVER_GIS_REGISTRY[currentQ?.id] ||
    (currentQ?.category || '').toLowerCase().includes('river') ||
    (currentQ?.placeType || '').toLowerCase().includes('river') ||
    (currentQ?.place || '').toLowerCase().includes('river') ||
    (currentQ?.title || '').toLowerCase().includes('river')
  );

  // Auto-sync map layer when teacher advances slides
  useEffect(() => {
    if (!currentStep) return;
    const type = currentStep.type;
    const stepId = currentStep.id;

    if (stepId === 'river_course' || type === 'mapping_overview') {
      setActiveLayers({ spine: true, leftBank: false, rightBank: false, dams: false, protectedAreas: false });
    } else if (stepId === 'river_left_tributaries') {
      setActiveLayers({ spine: true, leftBank: true, rightBank: false, dams: false, protectedAreas: false });
    } else if (stepId === 'river_right_tributaries') {
      setActiveLayers({ spine: true, leftBank: false, rightBank: true, dams: false, protectedAreas: false });
    } else if (stepId === 'river_dams_confluences') {
      setActiveLayers({ spine: true, leftBank: false, rightBank: false, dams: true, protectedAreas: false });
    } else if (stepId === 'river_ecology_towns') {
      setActiveLayers({ spine: true, leftBank: false, rightBank: false, dams: false, protectedAreas: true });
    } else if (stepId === 'map_pyq') {
      // In PYQ stage, show river spine + both banks to illustrate question options
      setActiveLayers({ spine: true, leftBank: true, rightBank: true, dams: false, protectedAreas: false });
    }
  }, [currentStep?.id, currentStep?.type]);

  const handleToggleLayer = (key) => {
    setActiveLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

  // Compute dynamic GIS nodes based on active layers
  const nodes = useMemo(() => {
    if (!currentQ) return [];
    if (isRiver) {
      return getRiverSpatialNodes(currentQ, activeLayers);
    }
    return activeNode ? [activeNode] : [];
  }, [currentQ, isRiver, activeLayers, activeNode]);

  // If teacher spotlights a numbered card (1..12) on the right slide, spotlight its marker & line on the map.
  // For rivers without an active spotlight, leave selectedNode null so the main river spine stays in clean River Blue (#0284c7) instead of turning red.
  const effectiveSelectedNode = useMemo(() => {
    if (spotlightIndex != null) {
      const matched = nodes.find((n) => n.displayIndex === spotlightIndex);
      if (matched) return matched;
    }
    return isRiver ? null : activeNode;
  }, [spotlightIndex, nodes, isRiver, activeNode]);

  const cameraTarget = useMemo(() => {
    return {
      center: [lat, lng],
      zoom: isWorld ? 4.5 : (isRiver ? 6.0 : 6),
      ts: `${lat}-${lng}-${cameraTrigger}`,
    };
  }, [lat, lng, isWorld, isRiver, cameraTrigger]);

  const handleRecenter = () => {
    setCameraTrigger((prev) => prev + 1);
  };

  const widthLabel =
    mapWidthMode === 'full' ? '100% Map' : mapWidthMode === 'wide' ? '70% Map' : '58% Map';

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
      {/* 1. Interactive Leaflet Map Canvas (Base Map Viewport at z-index 10 below annotation layer) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <MappingCanvas
          nodes={nodes}
          selectedNode={effectiveSelectedNode}
          basemap={basemap}
          showIndiaStates={true}
          showGraticules={true}
          showLabels={showLabels}
          disableClustering={true}
          cameraTarget={cameraTarget}
        />
      </div>

      {/* 2. Floating Basemap Controls & Recenter Button (Top Left - Above Annotation Canvas at z-index 65) */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 65,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 5,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '4px 6px',
          borderRadius: 12,
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          pointerEvents: 'auto',
          maxWidth: 'calc(100% - 28px)',
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
          onClick={() => setShowLabels((prev) => !prev)}
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
            background: showLabels ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.08)',
            color: showLabels ? '#34d399' : '#94a3b8',
            transition: 'all 0.15s ease',
          }}
          title="Toggle numbered name labels on map (Hide labels for student quiz mode)"
        >
          <Tag size={13} />
          <span>{showLabels ? 'Labels: ON' : 'Labels: OFF'}</span>
        </button>

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
            background: 'rgba(56, 189, 248, 0.18)',
            color: '#38bdf8',
            transition: 'all 0.15s ease',
          }}
          title="Focus on this location"
        >
          <Target size={13} />
          <span>Focus</span>
        </button>

        {onSetActiveTool && (
          <button
            type="button"
            onClick={() => onSetActiveTool(activeTool === 'none' ? 'pen' : 'none')}
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
              background: activeTool === 'none' ? '#10b981' : 'rgba(245, 158, 11, 0.2)',
              color: activeTool === 'none' ? '#ffffff' : '#fbbf24',
              transition: 'all 0.15s ease',
            }}
            title={
              activeTool === 'none'
                ? 'Map Pan/Zoom Active — Click to switch back to Stylus Drawing [P]'
                : 'Stylus Drawing Active — Click to Pan/Zoom Map [N]'
            }
          >
            {activeTool === 'none' ? <Move size={13} /> : <PenTool size={13} />}
            <span>{activeTool === 'none' ? 'Panning Map' : 'Draw Mode'}</span>
          </button>
        )}

        {onCycleMapWidth && (
          <button
            type="button"
            onClick={onCycleMapWidth}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              border: '1px solid rgba(168, 85, 247, 0.45)',
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#c084fc',
              transition: 'all 0.15s ease',
            }}
            title="Cycle Map Real Estate: 58% Default Split → 70% Wide Map → 100% Full Screen Map [M]"
          >
            <Columns size={13} />
            <span>{widthLabel}</span>
          </button>
        )}
      </div>

      {/* 3. Floating Teacher Layer Override HUD (Directly Below Basemap Bar - Above Annotation Canvas at z-index 65) */}
      {isRiver && (
        <div
          style={{
            position: 'absolute',
            top: 58,
            left: 14,
            zIndex: 65,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 5,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(12px)',
            padding: '4px 8px',
            borderRadius: 12,
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            maxWidth: 'calc(100% - 28px)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
              color: '#38bdf8',
              paddingRight: 6,
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Layers size={13} />
            <span>Layers:</span>
          </div>

          {/* Spine */}
          <button
            type="button"
            onClick={() => handleToggleLayer('spine')}
            style={{
              padding: '4px 8px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeLayers.spine ? '#0284c7' : 'rgba(255, 255, 255, 0.08)',
              color: activeLayers.spine ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Main River Spine & Origin/Mouth"
          >
            📍 Spine
          </button>

          {/* Left Bank */}
          <button
            type="button"
            onClick={() => handleToggleLayer('leftBank')}
            style={{
              padding: '4px 8px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeLayers.leftBank ? '#06b6d4' : 'rgba(255, 255, 255, 0.08)',
              color: activeLayers.leftBank ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Left-Bank Tributaries (Cyan)"
          >
            ⬅️ Left Bank
          </button>

          {/* Right Bank */}
          <button
            type="button"
            onClick={() => handleToggleLayer('rightBank')}
            style={{
              padding: '4px 8px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeLayers.rightBank ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
              color: activeLayers.rightBank ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Right-Bank Tributaries (Amber)"
          >
            ➡️ Right Bank
          </button>

          {/* Dams & Sangams */}
          <button
            type="button"
            onClick={() => handleToggleLayer('dams')}
            style={{
              padding: '4px 8px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeLayers.dams ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
              color: activeLayers.dams ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Confluences & Major Dams"
          >
            ⚡ Dams &amp; Sangams
          </button>

          {/* Protected Areas & Towns */}
          <button
            type="button"
            onClick={() => handleToggleLayer('protectedAreas')}
            style={{
              padding: '4px 8px',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeLayers.protectedAreas ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
              color: activeLayers.protectedAreas ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
            title="Toggle National Parks & Historic Towns"
          >
            🌿 Parks &amp; Towns
          </button>
        </div>
      )}

      {/* 4. Floating Spatial Engine Watermark (Top Right of Map) */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          padding: '5px 12px',
          borderRadius: 10,
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#34d399',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Compass size={14} />
        <span>UPSC SPATIAL ENGINE</span>
      </div>

      {/* 5. Bottom Coordinates HUD Pill (Bottom Left of Map) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: 10,
          border: '1.5px solid rgba(255, 255, 255, 0.18)',
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
    </div>
  );
}
