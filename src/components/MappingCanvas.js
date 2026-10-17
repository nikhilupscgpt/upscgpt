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
};

function normalizeCountryName(name) {
  const lower = (name || '').trim().toLowerCase();
  return COUNTRY_ALIASES[lower] || (name || '').trim();
}

export function getCategoryVisual(node) {
  const cats = node?.mapCategory || [];
  const primary = cats[0] || '';

  if (node?.isPin && node?.pillar === 'PIN') {
    return { color: '#ef4444', emoji: '📍', isRiver: false, isMountain: false };
  }
  if (primary.includes('rivers, lakes')) {
    return { color: '#0ea5e9', emoji: '🏞️', isRiver: true, isMountain: false };
  }
  if (primary.includes('relief, hills')) {
    return { color: '#8b5cf6', emoji: '⛰️', isRiver: false, isMountain: true };
  }
  if (primary.includes('Protected areas')) {
    return { color: '#10b981', emoji: '🐅', isRiver: false, isMountain: false };
  }
  if (primary.includes('Wetlands & Ramsar')) {
    return { color: '#14b8a6', emoji: '🦩', isRiver: false, isMountain: false };
  }
  if (primary.includes('Ports, highways')) {
    return { color: '#3b82f6', emoji: '⚓', isRiver: false, isMountain: false };
  }
  if (primary.includes('Minerals') || primary.includes('Energy')) {
    return { color: '#f59e0b', emoji: '⛏️', isRiver: false, isMountain: false };
  }
  if (primary.includes('Historical') || primary.includes('Tribes')) {
    return { color: '#ec4899', emoji: '🏛️', isRiver: false, isMountain: false };
  }
  if (primary.includes('Strategic projects abroad')) {
    return { color: '#f97316', emoji: '🛰️', isRiver: false, isMountain: false };
  }
  if (primary.includes('World – places in news')) {
    return { color: '#ef4444', emoji: '⚔️', isRiver: false, isMountain: false };
  }
  if (primary.includes('World – countries, borders & seas')) {
    return { color: '#6366f1', emoji: '🌊', isRiver: false, isMountain: false };
  }
  if (primary.includes('Landforms & volcanoes')) {
    return { color: '#e11d48', emoji: '🌋', isRiver: false, isMountain: false };
  }
  if (primary.includes('World – physical features')) {
    const isRiv = /river|nile|congo|mekong|danube|amazon/i.test(node?.place || '');
    const isMtn = /mountain|andes|alps|atlas|ural|rocky/i.test(node?.place || '');
    return {
      color: isRiv ? '#0ea5e9' : '#8b5cf6',
      emoji: isRiv ? '🏞️' : '🏔️',
      isRiver: isRiv,
      isMountain: isMtn,
    };
  }
  return { color: '#38bdf8', emoji: '📍', isRiver: false, isMountain: false };
}

/**
 * Compact circular map pin by default; expands to a label pill ONLY when actively selected.
 * This prevents rectangular text boxes from overlapping and cluttering the map.
 */
function createNodeIcon(node, isSelected) {
  const { color, emoji } = getCategoryVisual(node);
  const isPin = Boolean(node.isPin);

  if (!isSelected) {
    return L.divIcon({
      html: `
        <div style="
          position:absolute;bottom:0;left:50%;transform:translate(-50%, 50%);
          width:28px;height:28px;border-radius:50%;
          background:#0f172a;border:2.2px solid ${color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 10px rgba(0,0,0,0.55);cursor:pointer;
          transition:transform 0.15s ease;
        ">
          <span style="font-size:13px;line-height:1;">${emoji}</span>
          ${
            isPin
              ? `<span style="position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;background:#ef4444;border:1.5px solid #fff;"></span>`
              : ''
          }
        </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      className: '',
    });
  }

  const shortTitle =
    (node.place || '').length > 28
      ? `${node.place.slice(0, 26)}…`
      : node.place;

  return L.divIcon({
    html: `
      <div style="
        position:absolute;bottom:0;left:50%;transform:translate(-50%, 50%);
        display:flex;align-items:center;gap:6px;
        background:${color};border:2px solid #ffffff;
        border-radius:999px;padding:5px 11px;
        box-shadow:0 0 18px ${color}, 0 4px 12px rgba(0,0,0,0.6);
        white-space:nowrap;cursor:pointer;z-index:999;
      ">
        <span style="font-size:13px;">${emoji}</span>
        <span style="font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">
          ${shortTitle}
        </span>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    className: '',
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 40 ? 38 : 44;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#0284c7,#4f46e5);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;border:2px solid #fff;box-shadow:0 4px 12px rgba(2,132,199,0.5);">${count}</div>`,
    className: '',
    iconSize: L.point(size, size, true),
  });
}

function CameraController({ cameraTarget, selectedNode }) {
  const map = useMap();
  const lastNodeId = useRef(null);
  const lastCameraKey = useRef('');

  useEffect(() => {
    if (!map || !cameraTarget) return;
    const key = `${cameraTarget.center?.[0]}-${cameraTarget.center?.[1]}-${cameraTarget.zoom}`;
    if (key === lastCameraKey.current) return;
    lastCameraKey.current = key;
    map.flyTo(cameraTarget.center, cameraTarget.zoom, {
      animate: true,
      duration: 1.0,
    });
  }, [cameraTarget, map]);

  useEffect(() => {
    if (!map || !selectedNode) {
      lastNodeId.current = null;
      return;
    }
    if (selectedNode.lat == null || selectedNode.lng == null) return;
    if (lastNodeId.current === selectedNode.id) return;
    lastNodeId.current = selectedNode.id;
    const nextZoom = Math.max(map.getZoom(), selectedNode.regionScope === 'India' ? 5.5 : 4.5);
    map.flyTo([selectedNode.lat, selectedNode.lng], nextZoom, {
      animate: true,
      duration: 1.0,
    });
  }, [selectedNode, map]);

  return null;
}

function IndiaAndOrgGeoLayers({ showIndiaStates, activeOrg, onStateClick }) {
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
    if (!cachedWorldGeoJson && activeOrg) {
      fetch(WORLD_COUNTRIES_GEOJSON_URL)
        .then((r) => r.json())
        .then((d) => {
          cachedWorldGeoJson = d;
          setWorldGeo(d);
        })
        .catch(() => {});
    }
  }, [activeOrg]);

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

  return (
    <>
      {activeOrg && orgMemberFeatures && orgMemberFeatures.features.length > 0 && (
        <GeoJSON
          key={`org-${activeOrg.id}`}
          data={orgMemberFeatures}
          style={() => ({
            fillColor: '#f59e0b',
            fillOpacity: 0.28,
            color: '#f59e0b',
            weight: 2,
            opacity: 0.85,
          })}
          onEachFeature={(feature, layer) => {
            const cName =
              feature.properties?.ADMIN ||
              feature.properties?.name ||
              feature.properties?.NAME ||
              'Member';
            layer.bindTooltip(
              `<strong>${cName}</strong><br/><span style="font-size:11px;color:#fbbf24">${activeOrg.shortName} Member</span>`,
              { sticky: true, direction: 'top' }
            );
          }}
        />
      )}

      {(showIndiaStates || hasIndiaInOrg) && indiaGeo && (
        <GeoJSON
          key={`india-states-${activeOrg?.id || 'base'}-${showIndiaStates}`}
          data={indiaGeo}
          style={() => ({
            fillColor: hasIndiaInOrg ? '#f59e0b' : '#38bdf8',
            fillOpacity: hasIndiaInOrg ? 0.26 : 0.05,
            color: hasIndiaInOrg ? '#f59e0b' : '#38bdf8',
            weight: hasIndiaInOrg ? 2 : 1.1,
            opacity: 0.65,
          })}
          onEachFeature={(feature, layer) => {
            const stName =
              feature.properties?.st_nm ||
              feature.properties?.NAME_1 ||
              feature.properties?.name ||
              'India';
            layer.bindTooltip(`<strong>${stName}</strong>`, {
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
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Topographic',
  },
  natgeo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri, National Geographic',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Satellite',
  },
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attr: '&copy; Esri Academic Gray',
  },
};

export default function MappingCanvas({
  nodes = [],
  selectedNode,
  onSelectNode,
  basemap = 'topo',
  showIndiaStates = true,
  showGraticules = true,
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
          !Number.isNaN(Number(n.lat)) &&
          !Number.isNaN(Number(n.lng))
      ),
    [nodes]
  );

  const polylineNodes = useMemo(
    () => validNodes.filter((n) => Array.isArray(n.shape) && n.shape.length > 1),
    [validNodes]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={cameraTarget?.center || [22.5, 80.5]}
        zoom={cameraTarget?.zoom || 5}
        minZoom={2}
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#0b0f19' }}
        preferCanvas={true}
      >
        <ZoomControl position="bottomright" />
        <CameraController cameraTarget={cameraTarget} selectedNode={selectedNode} />

        <TileLayer key={basemap} url={tile.url} attribution={tile.attr} crossOrigin={true} />

        {/* Official India State Boundaries & Active IR Organization Polygons */}
        <IndiaAndOrgGeoLayers
          showIndiaStates={showIndiaStates}
          activeOrg={activeOrg}
          onStateClick={onStateClick}
        />

        {/* Reference Graticules (Equator, Tropics, IST 82.5°E) */}
        {showGraticules &&
          graticules.map((g, idx) => (
            <Polyline
              key={idx}
              positions={g.pts}
              pathOptions={{
                color: '#64748b',
                weight: 1.1,
                opacity: 0.4,
                dashArray: '6,6',
              }}
            >
              <Tooltip direction="top" sticky>
                {g.label}
              </Tooltip>
            </Polyline>
          ))}

        {/* River & Mountain GIS Polylines (Clean subtle stroke; glowing only when selected) */}
        {polylineNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const vis = getCategoryVisual(node);
          const strokeColor = vis.isRiver ? '#0284c7' : '#7c3aed';
          const glowColor = vis.isRiver ? '#38bdf8' : '#a78bfa';

          return (
            <React.Fragment key={`poly-${node.id}`}>
              {isSelected && (
                <Polyline
                  positions={node.shape}
                  pathOptions={{
                    color: glowColor,
                    weight: 12,
                    opacity: 0.45,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}
              <Polyline
                positions={node.shape}
                pathOptions={{
                  color: isSelected ? '#ffffff' : strokeColor,
                  weight: isSelected ? 4 : 2.5,
                  opacity: isSelected ? 1 : 0.78,
                  dashArray: vis.isMountain ? '7,4' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => onSelectNode && onSelectNode(node),
                }}
              >
                <Tooltip direction="top" sticky>
                  {vis.emoji} <strong>{node.place}</strong> ({node.placeType})
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Clustered Interactive Markers */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={32}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          disableClusteringAtZoom={5}
        >
          {validNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <Marker
                key={node.id}
                position={[Number(node.lat), Number(node.lng)]}
                icon={createNodeIcon(node, isSelected)}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                  click: () => onSelectNode && onSelectNode(node),
                }}
              >
                <Tooltip direction="top" offset={[0, -14]}>
                  <div style={{ fontSize: 12 }}>
                    <strong>{node.place}</strong>
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
      </MapContainer>
    </div>
  );
}
