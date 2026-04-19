import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, ZoomControl, GeoJSON, useMapEvents, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

if (typeof window !== 'undefined') {
  require('leaflet.heat')
}

const catStyles = {
  mountain: { color: '#8b5cf6', label: 'Mountains & Peaks',  emoji: '⛰️' },
  strait:   { color: '#f59e0b', label: 'Strait / Pass',      emoji: '🌊' },
  conflict: { color: '#ef4444', label: 'Conflict Zone',      emoji: '⚔️' },
  nature:   { color: '#22c55e', label: 'Nature / Ecology',   emoji: '🌿' },
  island:   { color: '#3b82f6', label: 'Island',              emoji: '🏝️' },
  mineral:  { color: '#a855f7', label: 'Strategic Resource', emoji: '⛏️' },
  river:    { color: '#0ea5e9', label: 'River / Waterway',   emoji: '🏞️' },
}

function getContinentKey(value) {
  if (!value) return ''

  const normalized = value.toString().trim().toLowerCase()
  const aliasMap = {
    asia: 'asia',
    africa: 'africa',
    europe: 'europe',
    'north america': 'north_america',
    north_america: 'north_america',
    'northern america': 'north_america',
    'south america': 'south_america',
    south_america: 'south_america',
    oceania: 'oceania',
    global: 'global',
  }

  return aliasMap[normalized] || ''
}

function createMarkerIcon(cat, hasNews, name, isMinimal = false, isSelected = false, isOrgMember = false, orgColor = null) {
  const { color, emoji } = catStyles[cat] || { color: '#94a3b8', emoji: '📍' }
  const borderColor = isSelected ? '#6366f1' : (isOrgMember && orgColor ? orgColor : color);
  const borderWidth = isSelected ? '3px' : (isOrgMember ? '3px' : '2px');
  const shadow = isSelected
    ? '0 0 20px rgba(99,102,241,0.4)'
    : isOrgMember
      ? `0 0 16px ${orgColor || color}55`
      : '0 4px 12px rgba(0,0,0,0.15)';

  if (isMinimal && !isSelected && !isOrgMember) {
    return L.divIcon({
      html: `
        <div style="
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          background: white;
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.12);
          cursor: pointer;
          transition: transform 0.2s ease-out;
        " onmouseover="this.style.transform='scale(1.2)';" onmouseout="this.style.transform='scale(1)';">
          <span style="font-size: 16px;">${emoji}</span>
          ${hasNews ? `
            <div style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;background:#ef4444;border:1.5px solid white;border-radius:50%;"></div>
          ` : ''}
        </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      className: ''
    });
  }

  const orgRing = isOrgMember && orgColor ? `
    <div style="
      position: absolute;
      bottom: -3px; left: 50%;
      transform: translateX(-50%);
      width: calc(100% + 10px);
      height: calc(100% + 10px);
      border: 2px solid ${orgColor};
      border-radius: 10px;
      animation: org-pulse 2s ease-in-out infinite;
      pointer-events: none;
    "></div>
    <style>
      @keyframes org-pulse {
        0% { opacity: 1; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.5; transform: translateX(-50%) scale(1.08); }
        100% { opacity: 1; transform: translateX(-50%) scale(1); }
      }
    </style>
  ` : ''

  const html = `
    <div style="
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      border: ${borderWidth} solid ${borderColor};
      border-radius: 8px;
      padding: 4px 10px;
      box-shadow: ${shadow};
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      ${orgRing}
      <span style="font-size: 14px;">${emoji}</span>
      <span style="font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; color: #1e293b;">${name}</span>
      ${hasNews ? `
        <div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#ef4444;border:2px solid white;border-radius:50%;box-shadow:0 0 8px rgba(239,68,68,0.6);animation:pulse-red 2s infinite;"></div>
        <style>
          @keyframes pulse-red {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        </style>
      ` : ''}
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${borderColor};
      "></div>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid white;
      "></div>
    </div>`
  return L.divIcon({ html, iconSize: [0,0], iconAnchor: [0,0], popupAnchor: [0,-34], className: '' })
}

function createOrgHQIcon(shortName, color) {
  const html = `
    <div style="
      position: absolute;
      bottom: 0px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 5px;
      background: ${color || '#6366f1'};
      border: 2px solid white;
      border-radius: 10px;
      padding: 5px 10px;
      box-shadow: 0 6px 20px ${color || '#6366f1'}55;
      white-space: nowrap;
      cursor: pointer;
      animation: hq-glow 2.5s ease-in-out infinite;
    ">
      <style>@keyframes hq-glow {
        0% { box-shadow: 0 6px 20px ${color || '#6366f1'}55; }
        50% { box-shadow: 0 6px 30px ${color || '#6366f1'}99; }
        100% { box-shadow: 0 6px 20px ${color || '#6366f1'}55; }
      }</style>
      <span style="font-size: 12px;">🏛️</span>
      <span style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 900; color: white;">${shortName} HQ</span>
      <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${color || '#6366f1'};"></div>
    </div>`
  return L.divIcon({ html, iconSize: [0,0], iconAnchor: [0,0], className: '' })
}

// ─── Country Name Aliases (org member name → GeoJSON name) ───
const COUNTRY_ALIASES = {
  'usa': 'United States of America', 'us': 'United States of America', 'united states': 'United States of America',
  'uk': 'United Kingdom', 'britain': 'United Kingdom', 'great britain': 'United Kingdom',
  'russia': 'Russia', 'russian federation': 'Russia',
  'south korea': 'South Korea', 'republic of korea': 'South Korea', 'korea (south)': 'South Korea',
  'north korea': 'North Korea', 'dprk': 'North Korea', 'dem. rep. korea': 'North Korea',
  'czech republic': 'Czechia', 'czechia': 'Czechia',
  'ivory coast': "Côte d'Ivoire", "cote d'ivoire": "Côte d'Ivoire",
  'dr congo': 'Dem. Rep. Congo', 'democratic republic of the congo': 'Dem. Rep. Congo', 'drc': 'Dem. Rep. Congo',
  'republic of the congo': 'Congo', 'congo': 'Congo',
  'myanmar': 'Myanmar', 'burma': 'Myanmar',
  'uae': 'United Arab Emirates', 'united arab emirates': 'United Arab Emirates',
  'saudi arabia': 'Saudi Arabia',
  'turkey': 'Turkey', 'türkiye': 'Turkey',
  'iran': 'Iran',
  'vietnam': 'Vietnam', 'viet nam': 'Vietnam',
  'laos': 'Laos',
  'brunei': 'Brunei', 'brunei darussalam': 'Brunei',
  'timor-leste': 'Timor-Leste', 'east timor': 'Timor-Leste',
  'eswatini': 'eSwatini', 'swaziland': 'eSwatini',
  'bosnia and herzegovina': 'Bosnia and Herz.', 'bosnia': 'Bosnia and Herz.',
  'north macedonia': 'North Macedonia', 'macedonia': 'North Macedonia',
  'montenegro': 'Montenegro',
  'new zealand': 'New Zealand',
}

function normalizeCountryName(name) {
  const lower = name.trim().toLowerCase()
  return COUNTRY_ALIASES[lower] || name.trim()
}

// ─── Org GeoJSON Highlight Layer ───
const GEOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
let geoJsonCache = null

function OrgGeoLayer({ activeOrg, orgColor }) {
  const [geoData, setGeoData] = useState(() => geoJsonCache)
  const map = useMap()

  // Fetch and convert TopoJSON → GeoJSON (cached)
  useEffect(() => {
    if (geoJsonCache) return
    // Use the simpler GeoJSON source instead of TopoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(r => r.json())
      .then(data => {
        geoJsonCache = data
        setGeoData(data)
      })
      .catch(() => {
        // Fallback: try Natural Earth simplified
        fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson')
          .then(r => r.json())
          .then(data => { geoJsonCache = data; setGeoData(data) })
          .catch(console.error)
      })
  }, [])

  // Filter features to member countries
  const memberFeatures = useMemo(() => {
    if (!geoData || !activeOrg?.members) return null
    const memberNames = activeOrg.members.split(',').map(m => normalizeCountryName(m))
    const memberNamesLower = new Set(memberNames.map(n => n.toLowerCase()))

    const filtered = {
      type: 'FeatureCollection',
      features: geoData.features.filter(f => {
        const geoName = (f.properties.ADMIN || f.properties.name || f.properties.NAME || '').toLowerCase()
        const geoISO = (f.properties.ISO_A3 || f.properties.ISO_A2 || '').toLowerCase()
        return memberNamesLower.has(geoName) || memberNames.some(mn => geoName.includes(mn.toLowerCase()) || mn.toLowerCase().includes(geoName))
      })
    }
    return filtered
  }, [geoData, activeOrg])

  // Fit map to member bounds
  useEffect(() => {
    if (memberFeatures && memberFeatures.features.length > 0 && map) {
      try {
        const layer = L.geoJSON(memberFeatures)
        const bounds = layer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5, duration: 1.5 })
        }
      } catch (e) { /* ignore bounds errors */ }
    }
  }, [memberFeatures, map])

  if (!memberFeatures || memberFeatures.features.length === 0) return null

  const color = orgColor || '#6366f1'

  return (
    <GeoJSON
      key={activeOrg.id}
      data={memberFeatures}
      style={() => ({
        fillColor: color,
        fillOpacity: 0.28,
        color: color,
        weight: 2,
        opacity: 0.7,
      })}
      onEachFeature={(feature, layer) => {
        const name = feature.properties.ADMIN || feature.properties.name || feature.properties.NAME || 'Unknown'
        layer.bindTooltip(`<strong>${name}</strong><br/><span style="font-size:10px;color:${color}">${activeOrg.shortName} member</span>`, {
          sticky: true,
          className: 'org-tooltip',
          direction: 'top'
        })
      }}
    />
  )
}

function createClusterCustomIcon(cluster) {
  const count = cluster.getChildCount()
  const size = count < 10 ? 36 : count < 50 ? 44 : 52
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:${count<10?13:12}px;border:3px solid white;box-shadow:0 4px 14px rgba(99,102,241,0.5);font-family:'Outfit',sans-serif;">${count}</div>`,
    className: '', iconSize: L.point(size, size, true)
  })
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}

function HeatmapLayer({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || !points.length) return
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 6,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map)
    return () => { map.removeLayer(heat) }
  }, [map, points])
  return null
}

function ZoomTracker({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    }
  })
  return null
}

function MapFlyTo({ selectedEntry }) {
  const map = useMap()
  const lastFlyId = useRef(null)
  useEffect(() => {
    if (selectedEntry && selectedEntry.lat != null && selectedEntry.lon != null) {
      if (lastFlyId.current === selectedEntry.id) return
      lastFlyId.current = selectedEntry.id
      setTimeout(() => {
        const targetZoom = Math.max(map.getZoom(), 6)
        map.flyTo([selectedEntry.lat, selectedEntry.lon], targetZoom, { animate: true, duration: 1.5 })
      }, 100)
    } else {
      lastFlyId.current = null
    }
  }, [selectedEntry, map])
  return null
}

function StrategicZoomer({ activeContinent, activeAdmRegion, entries, regionConfig }) {
  const map = useMap()
  const lastViewId = useRef("")

  useEffect(() => {
    if (!map) return
    const viewId = `${activeContinent}-${activeAdmRegion}`
    if (viewId === lastViewId.current) return
    lastViewId.current = viewId

    if (activeAdmRegion) {
      const regionEntries = entries.filter(e => {
        const matchesCont = getContinentKey(e.continent) === activeContinent
        if (!matchesCont) return false
        
        if (activeAdmRegion === 'OTHER') return !e.admRegion || e.admRegion === ""
        return e.admRegion === activeAdmRegion
      }).filter(e => e.lat != null && e.lon != null)

      if (regionEntries.length > 0) {
        const lats = regionEntries.map(e => e.lat)
        const lons = regionEntries.map(e => e.lon)
        const bounds = [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]]
        map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 })
      }
    } else if (activeContinent) {
      const cfg = regionConfig[activeContinent]
      if (cfg?.bounds) {
        map.fitBounds(cfg.bounds, { padding: [30, 30], duration: 1.2 })
      }
    } else if (regionConfig?.global?.bounds) {
      map.fitBounds(regionConfig.global.bounds, { duration: 1 })
    }
  }, [activeContinent, activeAdmRegion, entries, map, regionConfig])

  return null
}

export default function Map({ 
  entries, layers, mapRef, initialCenter, initialZoom, initialMinZoom, 
  maxBounds, onEntrySelect, heatmapMode, selectedEntry, 
  activeContinent, activeAdmRegion, searchQuery, activeOrg, regionConfig 
}) {
  const [currentZoom, setCurrentZoom] = useState(initialZoom || 2)
  const center = initialCenter || [20, 0]
  const zoom = initialZoom || 2
  const minZoom = initialMinZoom || 2

  // Precompute org member set for fast lookup
  const orgMemberSet = activeOrg?.members
    ? new Set(activeOrg.members.split(',').map(m => m.trim().toLowerCase()))
    : null

  const ORG_CATEGORY_COLORS = {
    MILITARY: '#ef4444', ECONOMIC: '#f59e0b', REGIONAL: '#3b82f6',
    ENVIRONMENTAL: '#22c55e', SCIENTIFIC: '#a855f7',
  }
  const orgColor = activeOrg ? (ORG_CATEGORY_COLORS[activeOrg.category] || '#6366f1') : null

  const TILE_LAYERS = {
    light:     { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',   attr: '&copy; Esri' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',                  attr: '&copy; Esri' },
    topo:      { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',                 attr: '&copy; Esri' },
    natgeo:    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',               attr: '&copy; Esri, National Geographic' },
    ocean:     { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',         attr: '&copy; Esri, GEBCO' },
  }
  const tile = TILE_LAYERS[layers.base] || TILE_LAYERS.natgeo

  const graticules = [
    { pts: [[0,-360],[0,360]], label:'Equator (0°)' },
    { pts: [[23.5,-360],[23.5,360]], label:'Tropic of Cancer (23.5°N)' },
    { pts: [[-23.5,-360],[-23.5,360]], label:'Tropic of Capricorn (23.5°S)' },
  ]

  const validEntries = entries.filter(e =>
    e.lat != null && e.lon != null && !isNaN(e.lat) && !isNaN(e.lon) && layers[e.category]
  )
  
  const heatPoints = validEntries.map(e => [e.lat, e.lon, 1.0])
  let selectedShapePoints = null

  if (selectedEntry?.shape && selectedEntry.category !== 'river') {
    try {
      selectedShapePoints = JSON.parse(selectedEntry.shape)
    } catch {
      selectedShapePoints = null
    }
  }

  return (
    <div style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxBounds={maxBounds || undefined}
        maxBoundsViscosity={0.4}
        zoomControl={false}
        style={{ height:'100%', width:'100%', background:'#e2e8f0' }}
        worldCopyJump={false}
        preferCanvas={true}
      >
        <ZoomControl position="bottomright" />
        <ZoomTracker onZoomChange={setCurrentZoom} />
        <MapClickHandler onMapClick={() => onEntrySelect && onEntrySelect(null)} />
        <MapFlyTo selectedEntry={selectedEntry} />
        <StrategicZoomer 
          activeContinent={activeContinent} 
          activeAdmRegion={activeAdmRegion} 
          entries={entries} 
          regionConfig={regionConfig}
        />

        <TileLayer key={layers.base} url={tile.url} attribution={tile.attr} crossOrigin={true} />

        {/* Organization member country GeoJSON overlay */}
        {activeOrg && <OrgGeoLayer activeOrg={activeOrg} orgColor={orgColor} />}

        {/* Physical feature GIS line-string: selected mountain / strait shape */}
        {selectedShapePoints && (
          <Polyline
            positions={selectedShapePoints}
            pathOptions={{
              color: catStyles[selectedEntry.category]?.color || '#8b5cf6',
              weight: 14,
              opacity: 0.45,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Tooltip direction="top" sticky>{selectedEntry.name} Spatial Geometry</Tooltip>
          </Polyline>
        )}

        {/* ── River polylines: always-on cartographic layer ── */}
        {entries.filter(e => e.category === 'river' && e.shape).map(river => {
          const isSelected = selectedEntry?.id === river.id;
          let pts;
          try { pts = JSON.parse(river.shape); } catch { return null; }
          return (
            <React.Fragment key={river.id}>
              {/* Base glow */}
              <Polyline
                positions={pts}
                pathOptions={{
                  color: '#0ea5e9',
                  weight: isSelected ? 14 : 9,
                  opacity: isSelected ? 0.55 : 0.28,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Top stroke */}
              <Polyline
                positions={pts}
                pathOptions={{
                  color: isSelected ? '#38bdf8' : '#7dd3fc',
                  weight: isSelected ? 5 : 2.5,
                  opacity: isSelected ? 1 : 0.75,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{ click: () => onEntrySelect && onEntrySelect(river) }}
              >
                <Tooltip direction="top" sticky className="river-tooltip">
                  🏞️ {river.name}
                  {river.riverOutflow ? ` → ${river.riverOutflow}` : ''}
                </Tooltip>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* HQ Pin — rendered outside cluster group so it's always visible */}
        {activeOrg?.hqLat && activeOrg?.hqLon && activeOrg.hqCity !== 'Variable' && (
          <Marker
            key={`org-hq-${activeOrg.id}`}
            position={[activeOrg.hqLat, activeOrg.hqLon]}
            icon={createOrgHQIcon(activeOrg.shortName, orgColor)}
            eventHandlers={{ click: () => {} }}
          />
        )}

        {layers.graticules && graticules.map((g, i) => (
          <Polyline key={i} positions={g.pts} pathOptions={{ color:'#94a3b8', weight:1, opacity:0.35, dashArray:'6,6' }}>
            <Tooltip direction="top" sticky>{g.label}</Tooltip>
          </Polyline>
        ))}

        {heatmapMode ? (
          <HeatmapLayer points={heatPoints} />
        ) : (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={60}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            disableClusteringAtZoom={8}
          >
            {validEntries.map(entry => {
              const hasRecentNews = entry.lastNewsDate && (new Date() - new Date(entry.lastNewsDate)) < 48 * 60 * 60 * 1000;
              const isSelected = selectedEntry?.id === entry.id;
              const isOrgMember = orgMemberSet ? orgMemberSet.has(entry.name.toLowerCase()) : false;

              // Rivers are rendered as polylines above — skip point marker
              if (entry.category === 'river') return null;

              // Filter-First Strategic Visibility Rule:
              // Markers visible only when: sub-region selected | search active | explicitly selected | org member | PHYSICAL layer
              const isVisible = isSelected || activeAdmRegion || isOrgMember || (searchQuery && searchQuery.trim().length > 0) || entry.worldPart === 'PHYSICAL';
              if (!isVisible) return null;

              const isMinimal = currentZoom < 5;
              
              return (
                <Marker
                  key={entry.id}
                  position={[entry.lat, entry.lon]}
                  icon={createMarkerIcon(entry.category, hasRecentNews, entry.name, isMinimal, isSelected, isOrgMember, orgColor)}
                  eventHandlers={{ click: () => onEntrySelect && onEntrySelect(entry) }}
                />
              )
            })}

            {/* HQ Pin moved outside cluster group above */}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  )
}
