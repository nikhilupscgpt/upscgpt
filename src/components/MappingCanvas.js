'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  ZoomControl,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
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

  // 1. ACTIVE / SELECTED STATE: Glorious beacon with pulsing rings and title pill
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
            <span style="font-size:14px;line-height:1;">${activeIcon}</span>
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
            <div style="font-size:13px;font-weight:800;color:#ffffff;line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${cleanMain}</div>
            ${subDetail ? `<div style="font-size:10.5px;font-weight:600;color:#94a3b8;margin-top:2px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;">${subDetail}</div>` : ''}
          </div>
        </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      className: '',
    });
  }

  // 2. RIVERS (Non-selected): Render clean river name text label with halo (NO circular badge!)
  if (isRiver) {
    const isMajor = [
      'ganga-river', 'indus-river', 'brahmaputra-river', 'yamuna-river',
      'narmada-river', 'tapi-river', 'godavari-river', 'krishna-river',
      'cauvery-river', 'mahanadi-river', 'sutlej-river', 'chambal-river',
      'son-river', 'barak-river', 'jhelum-river', 'chenab-river'
    ].includes(node.slug);

    // Zoom-adaptive font sizing:
    // zoom <= 5: 10px
    // zoom == 6: 12px
    // zoom >= 7: 14.5px
    const fontSize = Math.max(9.5, Math.min(15, 9.5 + (currentZoom - 4.5) * 1.8));

    // Dimming: if user selected a place, other rivers fade to 0.22 opacity
    const labelOpacity = hasSelection
      ? 0.22
      : (currentZoom <= 5 ? (isMajor ? 0.95 : 0.45) : 0.92);

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
          ${cleanShort}
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
          background:${color};
          border:2px solid #ffffff;
          outline:1.5px solid ${color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 8px rgba(15,23,42,0.4);cursor:pointer;
        ">
          <span style="font-size:12px;line-height:1;">${emoji}</span>
        </div>
        ${showNamePill ? `
          <div style="
            position:absolute;top:50%;left:28px;transform:translateY(-50%);
            background:rgba(15, 23, 42, 0.92);backdrop-filter:blur(4px);color:#ffffff;
            border:1.5px solid ${color};
            border-radius:6px;padding:2px 7px;
            font-family:Inter,system-ui,sans-serif;
            font-size:11.5px;font-weight:700;letter-spacing:0.01em;
            white-space:nowrap;
            box-shadow:0 3px 10px rgba(15,23,42,0.4);
            pointer-events:none;z-index:9;
          ">${cleanShort}</div>
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

function CameraController({ cameraTarget, selectedNode, onZoomChange }) {
  const map = useMap();
  const lastNodeId = useRef(null);
  const lastCameraKey = useRef('');

  useEffect(() => {
    if (!map || !onZoomChange) return;
    const handleZoom = () => onZoomChange(map.getZoom());
    handleZoom();
    map.on('zoomend', handleZoom);
    return () => map.off('zoomend', handleZoom);
  }, [map, onZoomChange]);
  const map = useMap();
  const lastNodeId = useRef(null);
  const lastCameraKey = useRef('');

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
}) {
  const [indiaGeo, setIndiaGeo] = useState(() => cachedIndiaGeoJson);
  const [worldGeo, setWorldGeo] = useState(() => cachedWorldGeoJson);
  const map = useMap();

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
            layer.bindTooltip(`<strong>${cName}</strong>`, {
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
              `<strong>${cName}</strong><br/><span style="font-size:11px;color:#d97706">${activeOrg.shortName} Member</span>`,
              { sticky: true, direction: 'top' }
            );
          }}
        />
      )}

      {/* 3. Official India State & UT Borders (with Active State Highlight) */}
      {(showIndiaStates || hasIndiaInOrg) && indiaGeo && (
        <GeoJSON
          key={`india-states-${activeOrg?.id || 'base'}-${showIndiaStates}-${basemap}-${selectedNode?.id || 'none'}`}
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
              return {
                fillColor: '#ef4444',
                fillOpacity: 0.12,
                color: '#dc2626',
                weight: 2.3,
                opacity: 0.95,
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
            layer.bindTooltip(`<strong>${stName}</strong> (India)`, {
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
}) {
  const tile = TILE_LAYERS[basemap] || TILE_LAYERS.topo;

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
        <CameraController cameraTarget={cameraTarget} selectedNode={selectedNode} onZoomChange={setCurrentZoom} />

        <TileLayer key={basemap} url={tile.url} attribution={tile.attr} crossOrigin={true} />

        {/* International Country Borders, Official India State Boundaries & Active Host Region Highlight */}
        <WorldAndIndiaGeoBorders
          showIndiaStates={showIndiaStates}
          activeOrg={activeOrg}
          selectedNode={selectedNode}
          onStateClick={onStateClick}
          basemap={basemap}
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
        {polylineNodes.map((node) => {
          const hasSelection = Boolean(selectedNode);
          const isSelected = selectedNode?.id === node.id;
          const vis = getCategoryVisual(node);
          const strokeColor = node.strokeColor || node.customColor || (vis.isRiver ? '#0284c7' : '#7c3aed');
          const glowColor = isSelected ? '#ef4444' : (node.glowColor || (vis.isRiver ? '#38bdf8' : '#a78bfa'));

          // Visual focus & dimming: non-selected polylines drop to 0.18 opacity
          const polyOpacity = hasSelection
            ? (isSelected ? 1 : 0.18)
            : (node.opacity != null ? node.opacity : 0.78);
          const polyWeight = isSelected ? 5 : (hasSelection ? 1.8 : (node.weight || 2.5));

          return (
            <React.Fragment key={`poly-${node.id}`}>
              {(isSelected || node.glow) && (
                <Polyline
                  positions={node.shape}
                  pathOptions={{
                    color: glowColor,
                    weight: isSelected ? 14 : (node.glowWeight || 12),
                    opacity: isSelected ? 0.45 : (node.glowOpacity || 0.35),
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}
              <Polyline
                positions={node.shape}
                pathOptions={{
                  color: isSelected ? '#dc2626' : (hasSelection ? '#64748b' : strokeColor),
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
                <Tooltip direction="top" sticky>
                  {node.customEmoji || vis.emoji} <strong>{node.place}</strong> ({node.placeType})
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* River Labels (Rendered directly and unclustered, so river names are always visible like a real atlas) */}
        {riverNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <Marker
              key={`river-marker-${node.id}`}
              position={[Number(node.lat), Number(node.lng)]}
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
