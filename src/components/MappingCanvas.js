'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  CircleMarker,
  ZoomControl,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { escapeHtml } from '@/lib/escapeHtml';
import 'leaflet/dist/leaflet.css';

const INDIA_OFFICIAL_GEOJSON_URL =
  'https://raw.githubusercontent.com/AbhinavSwami28/india-official-geojson/main/india-states-simplified.geojson';
const WORLD_COUNTRIES_GEOJSON_URL =
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

let cachedIndiaGeoJson = null;
let cachedWorldGeoJson = null;

const COUNTRY_ALIASES = {
  usa: 'United States of America',
  us: 'United States of America',
  'united states': 'United States of America',
  uk: 'United Kingdom',
  britain: 'United Kingdom',
  russia: 'Russia',
  'russian federation': 'Russia',
  'south korea': 'South Korea',
  'republic of korea': 'South Korea',
  'north korea': 'North Korea',
  'czech republic': 'Czechia',
  'dr congo': 'Dem. Rep. Congo',
  drc: 'Dem. Rep. Congo',
  uae: 'United Arab Emirates',
  turkey: 'Turkey',
  türkiye: 'Turkey',
  eswatini: 'eSwatini',
  palestine: 'Palestine',
  'west bank': 'Palestine',
};

function normalizeCountryName(name) {
  const lower = (name || '').trim().toLowerCase();
  return COUNTRY_ALIASES[lower] || (name || '').trim();
}

export function getCategoryVisual(node) {
  const cats = node?.mapCategory || [];
  const primary = cats[0] || '';

  if (primary.includes('Wetlands & Ramsar')) {
    return {
      color: '#0d9488',
      shortTheme: 'Wetlands',
      emoji: '🦩',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('Protected areas')) {
    return {
      color: '#10b981',
      shortTheme: 'Protected Areas',
      emoji: '🐅',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('rivers, lakes')) {
    return {
      color: '#0284c7',
      shortTheme: 'Rivers & Lakes',
      emoji: '🏞️',
      isRiver: true,
      isMountain: false,
    };
  }
  if (primary.includes('relief, hills')) {
    return {
      color: '#7c3aed',
      shortTheme: 'Relief & Hills',
      emoji: '⛰️',
      isRiver: false,
      isMountain: true,
    };
  }
  if (primary.includes('Ports, highways')) {
    return {
      color: '#2563eb',
      shortTheme: 'Ports & Corridors',
      emoji: '⚓',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('Minerals') || primary.includes('Energy')) {
    return {
      color: '#d97706',
      shortTheme: 'Minerals & Energy',
      emoji: '⛏️',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('Historical') || primary.includes('Tribes')) {
    return {
      color: '#db2777',
      shortTheme: 'Heritage & Culture',
      emoji: '🏛️',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('Strategic projects abroad')) {
    return {
      color: '#ea580c',
      shortTheme: 'Strategic Projects',
      emoji: '🛰️',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('World – places in news')) {
    return {
      color: '#dc2626',
      shortTheme: 'Flashpoints',
      emoji: '⚔️',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('World – countries, borders & seas')) {
    return {
      color: '#2563eb',
      shortTheme: 'Borders & Seas',
      emoji: '🌊',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('Landforms & volcanoes')) {
    return {
      color: '#e11d48',
      shortTheme: 'Landforms',
      emoji: '🌋',
      isRiver: false,
      isMountain: false,
    };
  }
  if (primary.includes('World – physical features')) {
    const isRiv = /river|nile|congo|mekong|danube|amazon/i.test(node?.place || '');
    const isMtn = /mountain|andes|alps|atlas|ural|rocky/i.test(node?.place || '');
    return {
      color: isRiv ? '#0284c7' : '#7c3aed',
      shortTheme: 'Physical Features',
      emoji: isRiv ? '🏞️' : '🏔️',
      isRiver: isRiv,
      isMountain: isMtn,
    };
  }
  return {
    color: '#0284c7',
    shortTheme: 'Places in News',
    emoji: '📍',
    isRiver: false,
    isMountain: false,
  };
}

/**
 * Computes CSS positioning for directional map callout pills so closely-spaced
 * river confluences, dams, and tributaries never pile up on top of each other.
 */
function getLabelDirStyle(dir = 'right') {
  switch (dir) {
    case 'left':
      return 'top:50%;right:30px;transform:translateY(-50%);';
    case 'top':
      return 'bottom:30px;left:50%;transform:translateX(-50%);';
    case 'bottom':
      return 'top:30px;left:50%;transform:translateX(-50%);';
    case 'top-left':
      return 'bottom:27px;right:20px;';
    case 'top-right':
      return 'bottom:27px;left:20px;';
    case 'bottom-left':
      return 'top:27px;right:20px;';
    case 'bottom-right':
      return 'top:27px;left:20px;';
    case 'right':
    default:
      return 'top:50%;left:30px;transform:translateY(-50%);';
  }
}

// ---- River label helpers (shared by icons, label placement and collision culling) ----
const MAJOR_RIVER_SLUGS = new Set([
  'ganga-river', 'indus-river', 'brahmaputra-river', 'yamuna-river',
  'narmada-river', 'tapi-river', 'godavari-river', 'krishna-river',
  'cauvery-river', 'mahanadi-river', 'sutlej-river', 'chambal-river',
  'son-river', 'barak-river', 'jhelum-river', 'chenab-river',
]);

const SELECTED_RIVER_COLOR = '#1d4ed8';
const SELECTED_RIVER_GLOW = '#93c5fd';

function riverLabelFontSize(zoom) {
  return Math.max(9.5, Math.min(15, 9.5 + (zoom - 4.5) * 1.8));
}

function getRiverLabelParts(node) {
  const rawPlace = node.place || '';
  const matchParen = rawPlace.match(/^([^(]+)\(([^)]+)\)$/);
  const mainTitle = matchParen ? matchParen[1].trim() : rawPlace;
  const shortTitle = (node.shortLabel || mainTitle.replace(/\s+(River|Sangam|Barrage|National Park|Tiger Reserve)$/i, '')).trim();
  const cleanMain = mainTitle.length > 24 ? `${mainTitle.slice(0, 22)}…` : mainTitle;
  const cleanShort = shortTitle.length > 18 ? `${shortTitle.slice(0, 16)}…` : shortTitle;
  return { cleanMain, cleanShort };
}

/** Flat list of [lat, lng] points for a river/mountain line, if it has one. */
function getShapePoints(node) {
  const raw = (Array.isArray(node?.shape) && node.shape.length > 1)
    ? node.shape
    : (Array.isArray(node?.polylinePoints) ? node.polylinePoints : []);
  return raw
    .filter((pt) => Array.isArray(pt) && pt.length >= 2)
    .map((pt) => [Number(pt[0]), Number(pt[1])])
    .filter((pt) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
}

/**
 * Where to put a river's name: halfway along its course (not at the source or a confluence,
 * where many rivers meet and names pile up). Falls back to the node's own point.
 */
function getLabelAnchor(node) {
  const pts = getShapePoints(node);
  if (pts.length >= 2) {
    let total = 0;
    const seg = [];
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(d);
      total += d;
    }
    let target = total / 2;
    for (let i = 0; i < seg.length; i++) {
      if (target <= seg[i] && seg[i] > 0) {
        const t = target / seg[i];
        return [
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
        ];
      }
      target -= seg[i];
    }
    return pts[Math.floor(pts.length / 2)];
  }
  return [Number(node.lat), Number(node.lng)];
}

function riverLabelPriority(node, selectedNode) {
  if (selectedNode?.id === node.id) return 1000;
  if (node.focusTier === 'system') return 500;
  if (MAJOR_RIVER_SLUGS.has(node.slug)) return 100;
  return 0;
}

/**
 * Decides which river names fit on screen without overlapping. Higher-priority names
 * (selected river, its system, major rivers) win; the rest stay hidden until you zoom in.
 */
function RiverLabelCollision({ riverNodes, selectedNode, onChange, extraLabels = [], suppressedIds = null, hideNames = false }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;
    const compute = () => {
      const zoom = map.getZoom();
      const fontSize = riverLabelFontSize(zoom);
      const size = map.getSize();
      const candidates = riverNodes
        .filter((n) => !(selectedNode && n.focusTier === 'basin'))
        .filter((n) => !(suppressedIds && suppressedIds.has(n.id)))
        .filter((n) => !(hideNames && selectedNode?.id !== n.id))
        .map((n) => ({ n, prio: riverLabelPriority(n, selectedNode) }));
      // Tributary names from the study panel compete for the same space.
      for (const l of extraLabels) candidates.push({ extra: l, prio: l.prio });
      candidates.sort((a, b) => b.prio - a.prio);

      const placed = [];
      const visible = new Set();
      for (const { n, extra } of candidates) {
        if (extra) {
          const pt = map.latLngToContainerPoint(extra.anchor);
          const w = extra.text.length * fontSize * 0.62 + 10;
          const h = fontSize + 8;
          const box = { x1: pt.x - w / 2, y1: pt.y - h / 2, x2: pt.x + w / 2, y2: pt.y + h / 2 };
          // A river much shorter on screen than its name gets the name only when picked or zoomed in.
          const east = map.latLngToContainerPoint([extra.anchor[0], extra.anchor[1] + 1]);
          const lengthPx = extra.lengthDeg * Math.abs(east.x - pt.x);
          const fits = extra.forced || lengthPx >= w * 1.1;
          const hits = placed.some((b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1);
          if (extra.forced || (fits && !hits)) {
            placed.push(box);
            visible.add(extra.id);
          }
          continue;
        }
        const anchor = getLabelAnchor(n);
        if (!Number.isFinite(anchor[0]) || !Number.isFinite(anchor[1])) continue;
        const pt = map.latLngToContainerPoint(anchor);
        const isSel = selectedNode?.id === n.id;
        const { cleanMain, cleanShort } = getRiverLabelParts(n);
        let box;
        if (isSel) {
          const w = cleanMain.length * 7.4 + 34;
          box = { x1: pt.x - 9, y1: pt.y - 16, x2: pt.x + 14 + w, y2: pt.y + 16 };
        } else {
          const w = cleanShort.length * fontSize * 0.62 + 10;
          const h = fontSize + 8;
          box = { x1: pt.x - w / 2, y1: pt.y - h / 2, x2: pt.x + w / 2, y2: pt.y + h / 2 };
        }
        // Off-screen labels don't block anything.
        if (box.x2 < 0 || box.y2 < 0 || box.x1 > size.x || box.y1 > size.y) {
          visible.add(n.id);
          continue;
        }
        const hits = placed.some(
          (b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1
        );
        if (!hits || isSel) {
          placed.push(box);
          visible.add(n.id);
        }
      }
      onChange(visible);
    };
    compute();
    map.on('zoomend moveend resize', compute);
    return () => map.off('zoomend moveend resize', compute);
  }, [map, riverNodes, selectedNode, onChange, extraLabels, suppressedIds, hideNames]);

  return null;
}

/**
 * Numbered circular map badge with crisp double-ring border; when selected, transforms into a
 * crimson-red glowing & pulsating beacon with dual radar rings + floating title pill.
 */
function createNodeIcon(node, isSelected, showLabels = false, currentZoom = 5, hasSelection = false) {
  const vis = getCategoryVisual(node);
  const color = node.badgeColor || node.customColor || vis.color;
  const emoji = node.customEmoji || vis.emoji;

  const isRiver = Boolean(
    vis.isRiver ||
    node.category === 'river' ||
    (node.mapCategory && node.mapCategory.some((c) => c.includes('rivers'))) ||
    node.riverDetails
  );

  const rawPlace = node.place || '';
  const matchParen = rawPlace.match(/^([^(]+)\(([^)]+)\)$/);
  const mainTitle = matchParen ? matchParen[1].trim() : rawPlace;
  const shortTitle = (node.shortLabel || mainTitle.replace(/\s+(River|Sangam|Barrage|National Park|Tiger Reserve)$/i, '')).trim();
  const stateOrCountry = [node.locatedIn?.stateOrProvince, node.locatedIn?.country]
    .filter(Boolean)
    .join(', ') || node.regionScope || '';
  const subDetail = stateOrCountry || (matchParen ? matchParen[2].trim() : '');

  const cleanMain = mainTitle.length > 24 ? `${mainTitle.slice(0, 22)}…` : mainTitle;
  const cleanShort = shortTitle.length > 18 ? `${shortTitle.slice(0, 16)}…` : shortTitle;
  // Escaped copies for interpolation into the divIcon HTML string.
  const safeMain = escapeHtml(cleanMain);
  const safeShort = escapeHtml(cleanShort);
  const safeSubDetail = escapeHtml(subDetail);
  const safeColor = escapeHtml(color);
  const safeEmoji = escapeHtml(emoji);

  // 1a. SELECTED RIVER: calm blue marker + clean white label (no red alarm beacon)
  if (isSelected && isRiver) {
    return L.divIcon({
      html: `
        <div style="position:relative;width:18px;height:18px;pointer-events:auto;z-index:1000;">
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);
            width:14px;height:14px;border-radius:50%;
            background:${SELECTED_RIVER_COLOR};
            border:2.5px solid #ffffff;
            box-shadow:0 0 0 3px rgba(29,78,216,0.25), 0 2px 6px rgba(15,23,42,0.35);
            cursor:pointer;
          "></div>
          <div style="
            position:absolute;top:50%;left:16px;transform:translateY(-50%);
            background:rgba(255,255,255,0.97);color:#0f172a;
            border:1.5px solid rgba(29,78,216,0.55);
            border-radius:8px;padding:4px 10px;
            font-family:Inter,system-ui,sans-serif;
            white-space:nowrap;max-width:240px;overflow:hidden;
            box-shadow:0 4px 14px rgba(15,23,42,0.18);
            pointer-events:none;z-index:1001;
          ">
            <div style="font-size:12.5px;font-weight:800;color:${SELECTED_RIVER_COLOR};line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${safeMain}</div>
            ${subDetail ? `<div style="font-size:10.5px;font-weight:600;color:#64748b;margin-top:1px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${safeSubDetail}</div>` : ''}
          </div>
        </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      className: '',
    });
  }

  // 1b. ACTIVE / SELECTED STATE (non-river places): beacon with pulsing rings and title pill
  if (isSelected) {
    const activeIcon = isRiver ? '🌊' : (emoji || '📍');
    return L.divIcon({
      html: `
        <div style="position:relative;width:34px;height:34px;pointer-events:auto;z-index:1000;">
          <span class="pin-red-ring-1"></span>
          <span class="pin-red-ring-2"></span>
          <div class="pin-red-core" style="
            position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);
            width:32px;height:32px;border-radius:50%;
            background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border:2.5px solid #ffffff;
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;box-shadow:0 0 16px rgba(239,68,68,0.8);
          ">
            <span style="font-size:14px;line-height:1;">${escapeHtml(activeIcon)}</span>
          </div>
          <div style="
            position:absolute;top:50%;left:38px;transform:translateY(-50%);
            background:rgba(15, 23, 42, 0.96);backdrop-filter:blur(6px);color:#ffffff;
            border:1.5px solid rgba(239,68,68,0.9);
            border-radius:8px;padding:5px 12px;
            font-family:Inter,system-ui,sans-serif;
            white-space:nowrap;max-width:240px;overflow:hidden;
            box-shadow:0 6px 20px rgba(15,23,42,0.6), 0 0 14px rgba(239,68,68,0.45);
            pointer-events:none;z-index:1001;
          ">
            <div style="font-size:13px;font-weight:800;color:#ffffff;line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${safeMain}</div>
            ${subDetail ? `<div style="font-size:10.5px;font-weight:600;color:#94a3b8;margin-top:2px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${safeSubDetail}</div>` : ''}
          </div>
        </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      className: '',
    });
  }

  // 2. RIVERS (Non-selected): Render clean river name text label with halo (NO circular badge!)
  if (isRiver) {
    const isMajor = MAJOR_RIVER_SLUGS.has(node.slug);

    // Zoom-adaptive font sizing:
    // zoom <= 5: 10px
    // zoom == 6: 12px
    // zoom >= 7: 14.5px
    const fontSize = riverLabelFontSize(currentZoom);

    // Dimming: with a river selected, rivers of the same system stay readable; others fade.
    const labelOpacity = hasSelection
      ? (node.focusTier === 'system' ? 0.85 : 0.22)
      : (currentZoom <= 5 ? (isMajor ? 0.95 : 0.6) : 0.92);

    return L.divIcon({
      html: `
        <div style="
          display:inline-flex;align-items:center;justify-content:center;
          font-family:Inter,system-ui,sans-serif;
          font-size:${fontSize.toFixed(1)}px;
          font-style:italic;
          font-weight:700;
          color:#0369a1;
          white-space:nowrap;
          pointer-events:auto;
          cursor:pointer;
          text-shadow:
            -2px -2px 0 #ffffff,
             2px -2px 0 #ffffff,
            -2px  2px 0 #ffffff,
             2px  2px 0 #ffffff,
             0 0 5px #ffffff,
             0 0 8px #ffffff;
          opacity:${labelOpacity};
          transform:translate(-50%, -50%);
          letter-spacing:0.02em;
          transition:opacity 0.2s ease, font-size 0.2s ease;
          user-select:none;
        ">
          ${safeShort}
        </div>`,
      iconSize: [120, 20],
      iconAnchor: [60, 10],
      className: '',
    });
  }

  // 3. POINT FEATURES (Passes, National Parks, Wetlands, Ports, Heritage)
  const pointOpacity = hasSelection ? 0.25 : 1;
  const showNamePill = currentZoom >= 6 || showLabels;

  return L.divIcon({
    html: `
      <div style="position:relative;width:26px;height:26px;opacity:${pointOpacity};transition:opacity 0.2s ease;">
        <div style="
          position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);
          width:24px;height:24px;border-radius:50%;
          background:${safeColor};
          border:2px solid #ffffff;
          outline:1.5px solid ${safeColor};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 8px rgba(15,23,42,0.4);cursor:pointer;
        ">
          <span style="font-size:12px;line-height:1;">${safeEmoji}</span>
        </div>
        ${showNamePill ? `
          <div style="
            position:absolute;top:50%;left:28px;transform:translateY(-50%);
            background:rgba(15, 23, 42, 0.92);backdrop-filter:blur(4px);color:#ffffff;
            border:1.5px solid ${safeColor};
            border-radius:6px;padding:2px 7px;
            font-family:Inter,system-ui,sans-serif;
            font-size:11.5px;font-weight:700;letter-spacing:0.01em;
            white-space:nowrap;
            box-shadow:0 3px 10px rgba(15,23,42,0.4);
            pointer-events:none;z-index:9;
          ">${safeShort}</div>
        ` : ''}
      </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    className: '',
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 40 ? 38 : 44;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#0284c7,#4f46e5);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;border:2.5px solid #fff;outline:1.5px solid #0284c7;box-shadow:0 4px 12px rgba(2,132,199,0.5);">${count}</div>`,
    className: '',
    iconSize: L.point(size, size, true),
  });
}

function CameraController({ cameraTarget, selectedNode, onZoomChange, focusPoints = [] }) {
  const map = useMap();
  const lastNodeId = useRef(null);
  const lastCameraKey = useRef('');
  const focusPointsRef = useRef(focusPoints);
  // Declared before the selection effect so it always holds the latest points when that runs.
  useEffect(() => {
    focusPointsRef.current = focusPoints;
  }, [focusPoints]);

  useEffect(() => {
    if (!map || !onZoomChange) return;
    const handleZoom = () => onZoomChange(map.getZoom());
    handleZoom();
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map, onZoomChange]);

  // Auto-invalidate map size when stage split width changes (58% / 72% / 100%) or when becoming visible
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        map.invalidateSize({ animate: false });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    if (!map || !cameraTarget) return;
    const center = cameraTarget.center;
    if (!Array.isArray(center) || center.length < 2) return;
    const lat = Number(center[0]);
    const lng = Number(center[1]);
    const zoom = Number(cameraTarget.zoom);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) return;

    const container = map.getContainer();
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) return;

    const key = `${lat}-${lng}-${zoom}-${cameraTarget.ts || ''}`;
    if (key === lastCameraKey.current) return;
    lastCameraKey.current = key;
    try {
      map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 0.9,
      });
    } catch (_) {
      try {
        map.setView([lat, lng], zoom);
      } catch (__) {}
    }
  }, [cameraTarget, map]);

  useEffect(() => {
    if (!map || !selectedNode) {
      lastNodeId.current = null;
      return;
    }
    const lat = Number(selectedNode.lat);
    const lng = Number(selectedNode.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const container = map.getContainer();
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) return;

    if (lastNodeId.current === selectedNode.id) return;
    lastNodeId.current = selectedNode.id;

    // Rivers: frame the river together with its own river system so it reads in context.
    const contextPts = focusPointsRef.current && focusPointsRef.current.length >= 2
      ? focusPointsRef.current
      : getShapePoints(selectedNode);
    if (contextPts.length >= 2) {
      try {
        const bounds = L.latLngBounds(contextPts);
        if (bounds.isValid()) {
          const size = map.getSize();
          const pad = Math.max(24, Math.min(70, Math.round(Math.min(size.x, size.y) * 0.08)));
          map.fitBounds(bounds, {
            padding: [pad, pad],
            maxZoom: 6.4,
            animate: true,
            duration: 0.9,
          });
          return;
        }
      } catch (_) {}
    }

    const targetZoom = selectedNode.regionScope === 'India' ? 6 : 4.5;
    try {
      map.flyTo([lat, lng], targetZoom, {
        animate: true,
        duration: 0.95,
      });
    } catch (_) {
      try {
        map.setView([lat, lng], targetZoom);
      } catch (__) {}
    }
  }, [selectedNode, map]);

  return null;
}

function WorldAndIndiaGeoBorders({
  showIndiaStates,
  activeOrg,
  selectedNode,
  onStateClick,
  basemap,
  basinHighlightStates = [],
  basinHighlightColor = '#0284c7',
  basinFitKey = 0,
  basinFitPoints = [],
}) {
  const [indiaGeo, setIndiaGeo] = useState(() => cachedIndiaGeoJson);
  const [worldGeo, setWorldGeo] = useState(() => cachedWorldGeoJson);
  const map = useMap();
  const lastBasinFitKey = useRef(0);
  const selectedIsRiver = Boolean(selectedNode && getCategoryVisual(selectedNode).isRiver);

  // Fit the view to the chosen basin: its catchment states plus the full course of its
  // main rivers. Runs once per basin choice (and again if the state borders load late).
  useEffect(() => {
    if (!map || !basinFitKey || basinFitKey === lastBasinFitKey.current) return;
    if (selectedNode || basinHighlightStates.length === 0) return;
    const container = map.getContainer();
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) return;

    let bounds = null;
    const extend = (b) => {
      if (!b || !b.isValid()) return;
      bounds = bounds ? bounds.extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
    };

    if (indiaGeo?.features?.length) {
      const basinFeatures = indiaGeo.features.filter((feature) => {
        const stName = (
          feature.properties?.st_nm ||
          feature.properties?.NAME_1 ||
          feature.properties?.name ||
          ''
        )
          .trim()
          .toLowerCase();
        return stName && basinHighlightStates.some(
          (bs) => stName === bs || stName.includes(bs) || bs.includes(stName)
        );
      });
      if (basinFeatures.length > 0) {
        try {
          extend(L.geoJSON({ type: 'FeatureCollection', features: basinFeatures }).getBounds());
        } catch (_) {}
      }
    } else {
      return; // wait for state borders to load, then fit
    }

    const riverPts = (basinFitPoints || []).filter(
      (pt) => Array.isArray(pt) && Number.isFinite(Number(pt[0])) && Number.isFinite(Number(pt[1]))
    );
    if (riverPts.length >= 2) {
      try {
        extend(L.latLngBounds(riverPts));
      } catch (_) {}
    }

    if (!bounds) return;
    lastBasinFitKey.current = basinFitKey;
    const pad = Math.max(16, Math.min(56, Math.round(Math.min(container.clientWidth, container.clientHeight) * 0.06)));
    try {
      map.flyToBounds(bounds, { padding: [pad, pad], maxZoom: 6.2, duration: 0.9 });
    } catch (_) {
      try {
        map.fitBounds(bounds, { padding: [pad, pad], maxZoom: 6.2 });
      } catch (__) {}
    }
  }, [map, basinFitKey, indiaGeo, selectedNode, basinHighlightStates, basinFitPoints]);

  useEffect(() => {
    if (!cachedIndiaGeoJson) {
      fetch(INDIA_OFFICIAL_GEOJSON_URL)
        .then((r) => r.json())
        .then((d) => {
          cachedIndiaGeoJson = d;
          setIndiaGeo(d);
        })
        .catch(() => {});
    }
    if (!cachedWorldGeoJson) {
      fetch(WORLD_COUNTRIES_GEOJSON_URL)
        .then((r) => r.json())
        .then((d) => {
          cachedWorldGeoJson = d;
          setWorldGeo(d);
        })
        .catch(() => {});
    }
  }, []);

  // World countries excluding India (so India always uses the official Survey of India boundary from indiaGeo)
  const worldCountriesWithoutIndia = useMemo(() => {
    if (!worldGeo?.features) return null;
    return {
      type: 'FeatureCollection',
      features: worldGeo.features.filter((f) => {
        const gName = (
          f.properties?.ADMIN ||
          f.properties?.name ||
          f.properties?.NAME ||
          ''
        )
          .trim()
          .toLowerCase();
        return gName !== 'india';
      }),
    };
  }, [worldGeo]);

  const orgMemberFeatures = useMemo(() => {
    if (!worldGeo || !activeOrg?.members) return null;
    const memberNames = activeOrg.members.split(',').map((m) => normalizeCountryName(m));
    const memberLower = new Set(memberNames.map((n) => n.toLowerCase()));
    const hasIndia = memberLower.has('india');

    return {
      type: 'FeatureCollection',
      features: worldGeo.features.filter((f) => {
        const gName = (
          f.properties?.ADMIN ||
          f.properties?.name ||
          f.properties?.NAME ||
          ''
        ).toLowerCase();
        if (hasIndia && indiaGeo && (gName === 'india' || gName.includes('india'))) {
          return false;
        }
        return (
          memberLower.has(gName) ||
          memberNames.some(
            (mn) => gName.includes(mn.toLowerCase()) || mn.toLowerCase().includes(gName)
          )
        );
      }),
    };
  }, [worldGeo, activeOrg, indiaGeo]);

  const hasIndiaInOrg = useMemo(() => {
    if (!activeOrg?.members) return false;
    return activeOrg.members
      .split(',')
      .map((m) => normalizeCountryName(m).toLowerCase())
      .includes('india');
  }, [activeOrg]);

  // Match active selectedNode's host state or country so its border highlights clearly
  const selectedStateNames = useMemo(() => {
    const raw = selectedNode?.locatedIn?.stateOrProvince || '';
    if (!raw) return [];
    return raw
      .split(/[,/&]| and /i)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length >= 3);
  }, [selectedNode]);

  const selectedCountryNames = useMemo(() => {
    const raw = selectedNode?.locatedIn?.country || '';
    if (!raw) return [];
    return raw
      .split(/[,/&–-]| and /i)
      .map((c) => normalizeCountryName(c).toLowerCase())
      .filter((c) => c.length >= 3 && c !== 'india');
  }, [selectedNode]);

  useEffect(() => {
    if (!map || !activeOrg || !orgMemberFeatures) return;
    try {
      const features = [...(orgMemberFeatures.features || [])];
      if (hasIndiaInOrg && indiaGeo?.features?.length) {
        features.push(...indiaGeo.features);
      }
      if (features.length > 0) {
        const layer = L.geoJSON({ type: 'FeatureCollection', features });
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 4, duration: 1.1 });
        }
      }
    } catch (_) {}
  }, [activeOrg, orgMemberFeatures, hasIndiaInOrg, indiaGeo, map]);

  const isSatellite = basemap === 'satellite';

  return (
    <>
      {/* 1. Crisp International Country Borders */}
      {worldCountriesWithoutIndia && (
        <GeoJSON
          key={`world-borders-${basemap}-${selectedNode?.id || 'none'}`}
          data={worldCountriesWithoutIndia}
          style={(feature) => {
            const cName = (
              feature.properties?.ADMIN ||
              feature.properties?.name ||
              feature.properties?.NAME ||
              ''
            )
              .trim()
              .toLowerCase();

            const isHighlightedCountry =
              selectedCountryNames.length > 0 &&
              selectedCountryNames.some(
                (sc) => cName === sc || cName.includes(sc) || sc.includes(cName)
              );

            if (isHighlightedCountry) {
              return {
                fillColor: '#ef4444',
                fillOpacity: 0.11,
                color: '#dc2626',
                weight: 2.2,
                opacity: 0.9,
              };
            }

            return {
              fillColor: '#64748b',
              fillOpacity: 0.01,
              color: isSatellite ? 'rgba(255,255,255,0.45)' : '#64748b',
              weight: 1.05,
              opacity: isSatellite ? 0.55 : 0.55,
            };
          }}
          onEachFeature={(feature, layer) => {
            const cName =
              feature.properties?.ADMIN ||
              feature.properties?.name ||
              feature.properties?.NAME ||
              'Country';
            layer.bindTooltip(`<strong>${escapeHtml(cName)}</strong>`, {
              sticky: true,
              direction: 'top',
            });
          }}
        />
      )}

      {/* 2. Active IR Organization Shaded Member Polygons */}
      {activeOrg && orgMemberFeatures && orgMemberFeatures.features.length > 0 && (
        <GeoJSON
          key={`org-${activeOrg.id}`}
          data={orgMemberFeatures}
          style={() => ({
            fillColor: '#f59e0b',
            fillOpacity: 0.28,
            color: '#d97706',
            weight: 2.2,
            opacity: 0.9,
          })}
          onEachFeature={(feature, layer) => {
            const cName =
              feature.properties?.ADMIN ||
              feature.properties?.name ||
              feature.properties?.NAME ||
              'Member';
            layer.bindTooltip(
              `<strong>${escapeHtml(cName)}</strong><br/><span style="font-size:11px;color:#d97706">${escapeHtml(activeOrg.shortName)} Member</span>`,
              { sticky: true, direction: 'top' }
            );
          }}
        />
      )}

      {/* 3. Official India State & UT Borders (with Active State or Basin Catchment Highlight) */}
      {(showIndiaStates || hasIndiaInOrg) && indiaGeo && (
        <GeoJSON
          key={`india-states-${activeOrg?.id || 'base'}-${showIndiaStates}-${basemap}-${selectedNode?.id || 'none'}-${basinHighlightStates.join('|')}`}
          data={indiaGeo}
          style={(feature) => {
            const stName = (
              feature.properties?.st_nm ||
              feature.properties?.NAME_1 ||
              feature.properties?.name ||
              ''
            )
              .trim()
              .toLowerCase();

            const isHighlightedState =
              selectedStateNames.length > 0 &&
              selectedStateNames.some(
                (sn) => stName === sn || stName.includes(sn) || sn.includes(stName)
              );

            const isBasinState =
              basinHighlightStates.length > 0 &&
              basinHighlightStates.some(
                (bs) => stName === bs || stName.includes(bs) || bs.includes(stName)
              );

            if (hasIndiaInOrg) {
              return {
                fillColor: '#f59e0b',
                fillOpacity: 0.26,
                color: '#d97706',
                weight: 2,
                opacity: 0.85,
              };
            }

            if (isHighlightedState) {
              return selectedIsRiver
                ? {
                    fillColor: SELECTED_RIVER_COLOR,
                    fillOpacity: 0.1,
                    color: SELECTED_RIVER_COLOR,
                    weight: 1.8,
                    opacity: 0.75,
                  }
                : {
                    fillColor: '#ef4444',
                    fillOpacity: 0.12,
                    color: '#dc2626',
                    weight: 2.3,
                    opacity: 0.95,
                  };
            }

            if (isBasinState) {
              return {
                fillColor: basinHighlightColor,
                fillOpacity: selectedNode ? 0.06 : 0.14,
                color: basinHighlightColor,
                weight: selectedNode ? 1.1 : 1.7,
                opacity: selectedNode ? 0.5 : 0.88,
              };
            }

            if (basinHighlightStates.length > 0) {
              return {
                fillColor: '#94a3b8',
                fillOpacity: 0.01,
                color: isSatellite ? 'rgba(255,255,255,0.35)' : '#94a3b8',
                weight: 0.9,
                opacity: 0.4,
              };
            }

            return {
              fillColor: '#0ea5e9',
              fillOpacity: 0.03,
              color: isSatellite ? 'rgba(255,255,255,0.6)' : '#475569',
              weight: 1.25,
              opacity: 0.72,
            };
          }}
          onEachFeature={(feature, layer) => {
            const stName =
              feature.properties?.st_nm ||
              feature.properties?.NAME_1 ||
              feature.properties?.name ||
              'India';
            layer.bindTooltip(`<strong>${escapeHtml(stName)}</strong> (India)`, {
              sticky: true,
              direction: 'top',
            });
            layer.on({
              click: () => {
                if (onStateClick && stName) onStateClick(stName);
              },
            });
          }}
        />
      )}
    </>
  );
}

const TILE_LAYERS = {
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Clean Base',
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Topographic',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Satellite',
  },
  natgeo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri, National Geographic',
  },
};

/**
 * Study-panel highlight: { key, lines: [[lat,lng][]], pins: [{lat,lng,label}], color }.
 * Pans only when the highlight is off-screen, so the student keeps their view.
 */
function StudyHighlightLayer({ highlight }) {
  const map = useMap();
  useEffect(() => {
    if (!highlight) return;
    const pts = [
      ...(highlight.lines || []).flat(),
      ...(highlight.pins || []).map((p) => [p.lat, p.lng]),
    ];
    if (pts.length === 0) return;
    const target = L.latLngBounds(pts);
    if (!map.getBounds().contains(target)) {
      map.flyToBounds(map.getBounds().extend(target), { padding: [40, 40], duration: 0.6, maxZoom: 7 });
    }
  }, [highlight, map]);

  if (!highlight) return null;
  const color = highlight.color || '#2563eb';
  return (
    <>
      {(highlight.lines || []).map((line, i) =>
        line.length > 1 ? (
          <React.Fragment key={`hl-line-${i}`}>
            <Polyline positions={line} interactive={false} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
            <Polyline positions={line} interactive={false} pathOptions={{ color, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
          </React.Fragment>
        ) : null
      )}
      {(highlight.pins || []).map((p, i) => (
        <CircleMarker key={`hl-pin-${i}`} center={[p.lat, p.lng]} radius={8} interactive={false} pathOptions={{ color: '#ffffff', weight: 3, fillColor: color, fillOpacity: 1 }}>
          {p.label && (
            <Tooltip permanent direction="top" offset={[0, -8]}>
              {p.label}
            </Tooltip>
          )}
        </CircleMarker>
      ))}
    </>
  );
}

const LAYER_PIN_STYLE = {
  sangams: { color: '#d97706', radius: '50%', border: '2px solid #ffffff' },
  dams: { color: '#b91c1c', radius: '3px', border: '2px solid #ffffff' },
  parks: { color: '#15803d', radius: '50%', border: '2px solid #ffffff' },
  towns: { color: '#475569', radius: '2px', border: '2px solid #ffffff' },
};
const pinIconCache = new Map();
function numberedPinIcon(cat, n) {
  const key = `${cat}:${n}`;
  if (pinIconCache.has(key)) return pinIconCache.get(key);
  const st = LAYER_PIN_STYLE[cat];
  const size = 20;
  const icon = L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:${st.radius};background:${st.color};border:${st.border};box-shadow:0 1px 4px rgba(15,23,42,.35);color:#fff;font:800 10.5px/16px system-ui,sans-serif;text-align:center;box-sizing:border-box">${Number(n) || ''}</div>`,
  });
  pinIconCache.set(key, icon);
  return icon;
}

/**
 * On-demand river layers the student switched on in the panel: tributary lines and numbered
 * pins. Names appear only on hover or when an item is focused, so the map stays readable.
 * During the map drill all tributary lines are shown (unnamed) and taps answer the question.
 */
function StudyLayers({ studyLayers, quizMode, onItemTap, onQuizTap, onTogglePick, dimmed = false }) {
  if (!studyLayers?.layers) return null;
  const { layers, on, picks = [], hideNames = false } = studyLayers;
  const pickColor = new Map(picks.map((p) => [p.id, p.color]));
  const tribs = (layers.tributaries || []).filter((t) => t.lines.length);
  // Picked tributaries draw last so they sit on top.
  const ordered = [...tribs].sort((a, b) => (pickColor.has(a.id) ? 1 : 0) - (pickColor.has(b.id) ? 1 : 0));
  return (
    <>
      {ordered.map((t) => {
        const picked = !quizMode && pickColor.has(t.id);
        if (!quizMode && !picked && !on.tributaries) return null;
        const color = quizMode ? '#0284c7' : picked ? pickColor.get(t.id) : t.side === 'left' ? '#7c3aed' : '#059669';
        const tap = () => {
          if (quizMode) {
            onQuizTap && onQuizTap(t.id);
          } else if (hideNames) {
            // Self-test: a tap reveals the name instead of selecting.
            onItemTap &&
              onItemTap({
                key: t.id,
                lines: t.lines,
                pins: [{ lat: (t.labelAnchor || t.point)[0], lng: (t.labelAnchor || t.point)[1], label: `${t.name} · ${t.side}-bank` }],
                color,
              });
          } else if (onTogglePick) {
            onTogglePick(t.id);
          }
        };
        const opacity = picked ? 1 : dimmed ? 0.3 : 0.85;
        return t.lines.map((line, i) => (
          <React.Fragment key={`sl-${t.id}-${i}`}>
            <Polyline positions={line} pathOptions={{ color: '#000000', weight: 18, opacity: 0 }} eventHandlers={{ click: tap }} />
            {picked && (
              <Polyline positions={line} interactive={false} pathOptions={{ color: '#ffffff', weight: 8, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
            )}
            <Polyline
              positions={line}
              // Picked rivers are bold in their own colour; the rest fade while something is picked or focused.
              pathOptions={{ color, weight: picked ? 4.5 : quizMode ? 2.6 : 3, opacity, lineCap: 'round', lineJoin: 'round' }}
              eventHandlers={{ click: tap }}
            >
              {!quizMode && !hideNames && (
                <Tooltip direction="top" sticky>
                  {t.name} ({t.side}-bank)
                </Tooltip>
              )}
            </Polyline>
          </React.Fragment>
        ));
      })}
      {['sangams', 'dams', 'parks', 'towns'].map((cat) =>
        on[cat]
          ? (layers[cat] || [])
              .filter((x) => x.pins.length)
              .flatMap((x) =>
                x.pins.map((p, i) => (
                  <Marker
                    key={`pin-${x.id}-${i}`}
                    position={[p.lat, p.lng]}
                    icon={numberedPinIcon(cat, x.n)}
                    opacity={dimmed ? 0.45 : 1}
                    zIndexOffset={600}
                    eventHandlers={{
                      click: () =>
                        onItemTap &&
                        onItemTap({
                          key: x.id,
                          lines: x.lines || [],
                          pins: x.pins.map((q) => ({ lat: q.lat, lng: q.lng, label: q.label || x.title })),
                          color: LAYER_PIN_STYLE[cat].color,
                        }),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]}>
                      {x.n}. {p.label || x.title}
                    </Tooltip>
                  </Marker>
                ))
              )
          : null
      )}
    </>
  );
}

/** "Trace the course": draws the selected river from source to mouth with a moving dot. */
function CourseTrace({ traceKey, points, color = '#1d4ed8' }) {
  const map = useMap();
  useEffect(() => {
    if (!traceKey || !Array.isArray(points) || points.length < 2) return undefined;

    const cum = [0];
    for (let i = 1; i < points.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    const total = cum[cum.length - 1] || 1;

    const halo = L.polyline([points[0]], { color: '#ffffff', weight: 10, opacity: 0.95, interactive: false, lineCap: 'round' }).addTo(map);
    const line = L.polyline([points[0]], { color, weight: 6, opacity: 1, interactive: false, lineCap: 'round' }).addTo(map);
    const dot = L.circleMarker(points[0], { radius: 7, color: '#ffffff', weight: 3, fillColor: color, fillOpacity: 1, interactive: false }).addTo(map);
    const source = L.circleMarker(points[0], { radius: 6, color: '#ffffff', weight: 2, fillColor: '#0891b2', fillOpacity: 1, interactive: false })
      .bindTooltip('Source', { permanent: true, direction: 'top', offset: [0, -6] })
      .addTo(map);
    let mouth = null;

    map.flyToBounds(L.latLngBounds(points), { padding: [50, 50], duration: 0.6, maxZoom: 6.5 });

    const DURATION = 3200;
    let raf = 0;
    let startAt = 0;
    let cleanupTimer = 0;
    const step = (now) => {
      if (!startAt) startAt = now;
      const t = Math.min(1, (now - startAt) / DURATION);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const target = eased * total;
      let i = 1;
      while (i < cum.length - 1 && cum[i] < target) i++;
      const segLen = cum[i] - cum[i - 1] || 1;
      const f = Math.min(1, Math.max(0, (target - cum[i - 1]) / segLen));
      const head = [
        points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f,
        points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f,
      ];
      const drawn = [...points.slice(0, i), head];
      halo.setLatLngs(drawn);
      line.setLatLngs(drawn);
      dot.setLatLng(head);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        mouth = L.circleMarker(points[points.length - 1], { radius: 6, color: '#ffffff', weight: 2, fillColor: '#7c3aed', fillOpacity: 1, interactive: false })
          .bindTooltip('Mouth', { permanent: true, direction: 'top', offset: [0, -6] })
          .addTo(map);
        cleanupTimer = window.setTimeout(removeAll, 2500);
      }
    };
    const removeAll = () => {
      [halo, line, dot, source, mouth].forEach((layer) => {
        if (layer && map.hasLayer(layer)) map.removeLayer(layer);
      });
    };
    const startTimer = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, 650);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(cleanupTimer);
      cancelAnimationFrame(raf);
      removeAll();
    };
  }, [traceKey, points, color, map]);
  return null;
}

export default function MappingCanvas({
  nodes = [],
  selectedNode,
  onSelectNode,
  basemap = 'topo',
  showIndiaStates = true,
  showGraticules = true,
  showLabels = false,
  disableClustering = false,
  cameraTarget,
  activeOrg = null,
  onStateClick,
  basinHighlightStates = [],
  basinHighlightColor = '#0284c7',
  basinFitKey = 0,
  studyHighlight = null,
  studyLayers = null,
  onLayerItemTap,
  onQuizTap,
  onTogglePick,
  traceKey = 0,
  tracePoints = [],
  quizMode = false,
}) {
  const tile = TILE_LAYERS[basemap] || TILE_LAYERS.topo;

  // Main-river courses shown for the chosen basin, used to size the basin view.
  const basinFitPoints = useMemo(() => {
    if (!basinHighlightStates.length) return [];
    return nodes.flatMap((n) => getShapePoints(n));
  }, [nodes, basinHighlightStates]);

  // With a river selected: the points of that river and its own system (camera framing).
  const riverFocusPoints = useMemo(() => {
    if (!selectedNode) return [];
    return nodes
      .filter((n) => n.id === selectedNode.id || n.focusTier === 'system')
      .flatMap((n) => getShapePoints(n));
  }, [nodes, selectedNode]);

  // Tributary names from the study panel: picked ones always, the rest when the layer is on and they fit.
  const hideStudyNames = Boolean(studyLayers?.hideNames);
  const studyLabelItems = useMemo(() => {
    if (!studyLayers?.layers || studyLayers.hideNames || quizMode) return [];
    const pickColor = new Map((studyLayers.picks || []).map((p) => [p.id, p.color]));
    const showAll = Boolean(studyLayers.on?.tributaries);
    return (studyLayers.layers.tributaries || [])
      .filter((t) => t.lines.length && t.labelAnchor && (showAll || pickColor.has(t.id)))
      .map((t) => ({
        id: `tl:${t.id}`,
        text: t.name,
        anchor: t.labelAnchor,
        forced: pickColor.has(t.id),
        color: pickColor.get(t.id) || (t.side === 'left' ? '#6d28d9' : '#047857'),
        prio: pickColor.has(t.id) ? 900 : 200 + Math.min(99, Math.round(t.lengthDeg * 25)),
        lengthDeg: t.lengthDeg,
        // A group (Panjnad = five rivers) keeps the atlas names of its member rivers.
        nodeIds: t.lines.length === 1 ? t.nodeIds || [] : [],
      }));
  }, [studyLayers, quizMode]);
  // Atlas rivers that now carry a tributary name from the panel: don't name them twice.
  const suppressedLabelIds = useMemo(
    () => new Set(studyLabelItems.flatMap((l) => l.nodeIds)),
    [studyLabelItems]
  );

  // Which river names fit without overlapping (null = not computed yet, show all).
  const [visibleLabelIds, setVisibleLabelIds] = useState(null);
  const handleLabelVisibility = React.useCallback((ids) => {
    setVisibleLabelIds((prev) => {
      if (prev && prev.size === ids.size && [...ids].every((id) => prev.has(id))) return prev;
      return ids;
    });
  }, []);

  const graticules = [
    { pts: [[0, -180], [0, 180]], label: 'Equator (0°)' },
    { pts: [[23.5, -180], [23.5, 180]], label: 'Tropic of Cancer (23.5°N)' },
    { pts: [[-23.5, -180], [-23.5, 180]], label: 'Tropic of Capricorn (23.5°S)' },
    { pts: [[-60, 82.5], [60, 82.5]], label: 'IST Standard Meridian (82.5°E)' },
  ];

  const validNodes = useMemo(
    () =>
      nodes.filter(
        (n) =>
          n.lat != null &&
          n.lng != null &&
          Number.isFinite(Number(n.lat)) &&
          Number.isFinite(Number(n.lng))
      ),
    [nodes]
  );

  const polylineNodes = useMemo(
    () => validNodes.filter((n) => Array.isArray(n.shape) && n.shape.length > 1),
    [validNodes]
  );

  const { riverNodes, pointNodes } = useMemo(() => {
    const rivers = [];
    const points = [];
    for (const n of validNodes) {
      if (n.hideMarker) continue;
      const vis = getCategoryVisual(n);
      const isRiver = Boolean(
        vis.isRiver ||
        n.category === 'river' ||
        (n.mapCategory && n.mapCategory.some((c) => c.includes('rivers'))) ||
        n.riverDetails ||
        n.basinGroup
      );
      if (isRiver) {
        rivers.push(n);
      } else {
        points.push(n);
      }
    }
    return { riverNodes: rivers, pointNodes: points };
  }, [validNodes]);

  const markerNodes = useMemo(
    () => validNodes.filter((n) => !n.hideMarker),
    [validNodes]
  );

  const safeCenter = useMemo(() => {
    const c = cameraTarget?.center;
    if (Array.isArray(c) && c.length >= 2) {
      const lat = Number(c[0]);
      const lng = Number(c[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng];
      }
    }
    return [22.5, 80.5];
  }, [cameraTarget?.center]);

  const [currentZoom, setCurrentZoom] = useState(5);

  const safeZoom = useMemo(() => {
    const z = Number(cameraTarget?.zoom);
    return Number.isFinite(z) && z > 0 ? z : 5;
  }, [cameraTarget?.zoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <style>{`
        @keyframes pinRedPulseRing1 {
          0% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0.9;
          }
          75% {
            transform: translate(-50%, -50%) scale(2.55);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.55);
            opacity: 0;
          }
        }
        @keyframes pinRedPulseRing2 {
          0% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0.7;
          }
          75% {
            transform: translate(-50%, -50%) scale(2.15);
            opacity: 0;
          }
        }
        @keyframes pinRedCoreGlow {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.32), 0 0 18px 4px rgba(239, 68, 68, 0.75), 0 4px 12px rgba(0, 0, 0, 0.45);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.48), 0 0 28px 8px rgba(239, 68, 68, 0.95), 0 4px 14px rgba(0, 0, 0, 0.5);
          }
        }
        .pin-red-ring-1 {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.42);
          border: 2px solid #ef4444;
          pointer-events: none;
          animation: pinRedPulseRing1 1.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .pin-red-ring-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.28);
          border: 1.5px solid #f87171;
          pointer-events: none;
          animation: pinRedPulseRing2 1.9s cubic-bezier(0.16, 1, 0.3, 1) 0.55s infinite;
        }
        .pin-red-core {
          animation: pinRedCoreGlow 1.9s ease-in-out infinite;
        }
      `}</style>

      <MapContainer
        center={safeCenter}
        zoom={safeZoom}
        minZoom={2}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#dde6ef' }}
        preferCanvas={true}
      >
        <ZoomControl position="bottomright" />
        <CameraController cameraTarget={cameraTarget} selectedNode={selectedNode} onZoomChange={setCurrentZoom} focusPoints={riverFocusPoints} />
        <RiverLabelCollision
          riverNodes={riverNodes}
          selectedNode={selectedNode}
          onChange={handleLabelVisibility}
          extraLabels={studyLabelItems}
          suppressedIds={suppressedLabelIds}
          hideNames={hideStudyNames}
        />

        <TileLayer
          key={basemap}
          url={tile.url}
          attribution={`${tile.attr} | River data &copy; OpenStreetMap contributors`}
          crossOrigin={true}
        />

        {/* International Country Borders, Official India State Boundaries & Active Host Region Highlight */}
        <WorldAndIndiaGeoBorders
          showIndiaStates={showIndiaStates}
          activeOrg={activeOrg}
          selectedNode={selectedNode}
          onStateClick={onStateClick}
          basemap={basemap}
          basinHighlightStates={basinHighlightStates}
          basinHighlightColor={basinHighlightColor}
          basinFitKey={basinFitKey}
          basinFitPoints={basinFitPoints}
        />

        {/* Reference Graticules (Equator, Tropics, IST 82.5°E) */}
        {showGraticules &&
          graticules.map((g, idx) => (
            <Polyline
              key={idx}
              positions={g.pts}
              pathOptions={{
                color: '#64748b',
                weight: 1.0,
                opacity: 0.32,
                dashArray: '6,6',
              }}
            >
              <Tooltip direction="top" sticky>
                {g.label}
              </Tooltip>
            </Polyline>
          ))}

        {/* River & Mountain GIS Polylines */}
        {[...polylineNodes]
          .sort((a, b) => (a.id === selectedNode?.id ? 1 : 0) - (b.id === selectedNode?.id ? 1 : 0))
          .map((node) => {
          const hasSelection = Boolean(selectedNode);
          const isSelected = selectedNode?.id === node.id;
          const vis = getCategoryVisual(node);
          const strokeColor = node.strokeColor || node.customColor || (vis.isRiver ? '#0284c7' : '#7c3aed');
          const selectedIsRiverLine = isSelected && vis.isRiver;
          const glowColor = isSelected
            ? (selectedIsRiverLine ? SELECTED_RIVER_GLOW : '#ef4444')
            : (node.glowColor || (vis.isRiver ? '#38bdf8' : '#a78bfa'));
          const tier = node.focusTier;

          // Focus & context: selected river strong, its river system readable,
          // the rest of the basin faded (still visible for context).
          let polyOpacity;
          let polyWeight;
          let polyColor;
          if (!hasSelection) {
            polyOpacity = node.opacity != null ? node.opacity : 0.78;
            polyWeight = node.weight || 2.5;
            polyColor = strokeColor;
          } else if (quizMode && !isSelected) {
            // Drill: every candidate looks the same, so the styling gives nothing away.
            polyOpacity = 0.8;
            polyWeight = 2.6;
            polyColor = '#0284c7';
          } else if (isSelected) {
            polyOpacity = 1;
            polyWeight = 5.5;
            polyColor = selectedIsRiverLine ? SELECTED_RIVER_COLOR : '#dc2626';
          } else if (tier === 'system') {
            polyOpacity = 0.7;
            polyWeight = 2.4;
            polyColor = strokeColor;
          } else if (tier === 'basin') {
            polyOpacity = 0.32;
            polyWeight = 1.6;
            polyColor = '#7dd3fc';
          } else {
            polyOpacity = 0.18;
            polyWeight = 1.8;
            polyColor = '#64748b';
          }

          return (
            <React.Fragment key={`poly-${node.id}`}>
              {(isSelected || node.glow) && (
                <Polyline
                  positions={node.shape}
                  pathOptions={{
                    color: glowColor,
                    weight: isSelected ? 13 : (node.glowWeight || 12),
                    opacity: isSelected ? 0.5 : (hasSelection ? 0.12 : (node.glowOpacity || 0.35)),
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}
              {quizMode && !isSelected && (
                // Wide invisible hit area so thin rivers are easy to tap.
                <Polyline
                  positions={node.shape}
                  pathOptions={{ color: '#000000', weight: 18, opacity: 0 }}
                  eventHandlers={{ click: () => onSelectNode && onSelectNode(node) }}
                />
              )}
              <Polyline
                positions={node.shape}
                pathOptions={{
                  color: polyColor,
                  weight: polyWeight,
                  opacity: polyOpacity,
                  dashArray: node.dashArray || (vis.isMountain ? '7,4' : undefined),
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => onSelectNode && onSelectNode(node),
                }}
              >
                {!quizMode && (
                  <Tooltip direction="top" sticky>
                    {node.customEmoji || vis.emoji} <strong>{node.place}</strong> ({node.placeType})
                  </Tooltip>
                )}
              </Polyline>
            </React.Fragment>
          );
        })}

        <StudyLayers
          studyLayers={studyLayers}
          quizMode={quizMode}
          onItemTap={onLayerItemTap}
          onQuizTap={onQuizTap}
          onTogglePick={onTogglePick}
          dimmed={(Boolean(studyHighlight) || Boolean(studyLayers?.picks?.length)) && !quizMode}
        />

        {/* Tributary names (atlas style: coloured italic text, no boxes) */}
        {studyLabelItems
          .filter((l) => l.forced || !visibleLabelIds || visibleLabelIds.has(l.id))
          .map((l) => (
            <Marker
              key={l.id}
              position={l.anchor}
              interactive={false}
              zIndexOffset={l.forced ? 900 : 400}
              icon={L.divIcon({
                className: '',
                iconSize: [0, 0],
                html: `<div style="transform:translate(-50%,-50%);white-space:nowrap;font:italic ${l.forced ? 800 : 700} ${riverLabelFontSize(currentZoom).toFixed(1)}px/1 system-ui,sans-serif;color:${l.color};text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff;pointer-events:none">${escapeHtml(l.text)}</div>`,
              })}
            />
          ))}
        <StudyHighlightLayer highlight={studyHighlight} />
        <CourseTrace traceKey={traceKey} points={tracePoints} color={SELECTED_RIVER_COLOR} />

        {/* River Labels (Rendered directly and unclustered, so river names are always visible like a real atlas) */}
        {riverNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          if (!isSelected && (quizMode || hideStudyNames)) return null;
          if (!isSelected && suppressedLabelIds.has(node.id)) return null;
          // The selected river's name box would cover a focused tributary or pin; the river is obvious anyway.
          if (isSelected && (studyHighlight || studyLayers?.picks?.length)) return null;
          if (!isSelected && selectedNode && node.focusTier === 'basin') return null;
          if (!isSelected && visibleLabelIds && !visibleLabelIds.has(node.id)) return null;
          const anchor = getLabelAnchor(node);
          return (
            <Marker
              key={`river-marker-${node.id}`}
              position={anchor}
              icon={createNodeIcon(node, isSelected, showLabels, currentZoom, Boolean(selectedNode))}
              zIndexOffset={isSelected ? 1000 : 200}
              eventHandlers={{
                click: () => onSelectNode && onSelectNode(node),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div style={{ fontSize: 12 }}>
                  <strong>{node.place}</strong>
                  <div style={{ fontSize: 11, color: '#475569' }}>
                    {node.placeType || 'River System'} •{' '}
                    {node.locatedIn?.stateOrProvince ||
                      node.locatedIn?.country ||
                      node.regionScope || 'India'}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Point Feature Markers (Passes, National Parks, Wetlands, Ports, Heritage) */}
        {disableClustering ? (
          pointNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <Marker
                key={node.id}
                position={[Number(node.lat), Number(node.lng)]}
                icon={createNodeIcon(node, isSelected, showLabels, currentZoom, Boolean(selectedNode))}
                zIndexOffset={isSelected ? 1000 : (node.displayIndex ? 500 : 0)}
                eventHandlers={{
                  click: () => onSelectNode && onSelectNode(node),
                }}
              >
                <Tooltip direction="top" offset={[0, -16]}>
                  <div style={{ fontSize: 12 }}>
                    <strong>
                      {node.displayIndex ? `#${node.displayIndex} · ` : ''}
                      {node.place}
                    </strong>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      {node.placeType} •{' '}
                      {node.locatedIn?.stateOrProvince ||
                        node.locatedIn?.country ||
                        node.regionScope}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })
        ) : (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            maxClusterRadius={32}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            disableClusteringAtZoom={6}
          >
            {pointNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;

              return (
                <Marker
                  key={node.id}
                  position={[Number(node.lat), Number(node.lng)]}
                  icon={createNodeIcon(node, isSelected, showLabels, currentZoom, Boolean(selectedNode))}
                  zIndexOffset={isSelected ? 1000 : 0}
                  eventHandlers={{
                    click: () => onSelectNode && onSelectNode(node),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -16]}>
                    <div style={{ fontSize: 12 }}>
                      <strong>
                        {node.displayIndex ? `#${node.displayIndex} · ` : ''}
                        {node.place}
                      </strong>
                      <div style={{ fontSize: 11, color: '#475569' }}>
                        {node.placeType} •{' '}
                        {node.locatedIn?.stateOrProvince ||
                          node.locatedIn?.country ||
                          node.regionScope}
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
}
