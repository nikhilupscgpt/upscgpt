"use client"
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, ZoomControl, useMapEvents, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

if (typeof window !== 'undefined') {
  require('leaflet.heat')
}

const catStyles = {
  strait:   { color: '#f59e0b', label: 'Strait / Pass',      emoji: '🌊' },
  conflict: { color: '#ef4444', label: 'Conflict Zone',      emoji: '⚔️' },
  nature:   { color: '#22c55e', label: 'Nature / Ecology',   emoji: '🌿' },
  island:   { color: '#3b82f6', label: 'Island',              emoji: '🏝️' },
  mineral:  { color: '#a855f7', label: 'Strategic Resource', emoji: '⛏️' },
}

function createMarkerIcon(cat) {
  const { color } = catStyles[cat] || { color: '#94a3b8' }
  const html = `
    <div style="position:relative;width:32px;height:32px;">
      <div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);width:10px;height:10px;background:white;border-radius:50%;"></div>
    </div>`
  return L.divIcon({ html, iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0,-34], className: '' })
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

function MapFlyTo({ selectedEntry }) {
  const map = useMap()
  useEffect(() => {
    if (selectedEntry && selectedEntry.lat != null && selectedEntry.lon != null) {
      const targetZoom = Math.max(map.getZoom(), 6)
      map.flyTo([selectedEntry.lat, selectedEntry.lon], targetZoom, { animate: true, duration: 1.0 })
    }
  }, [selectedEntry, map])
  return null
}

export default function Map({ entries, layers, mapRef, initialCenter, initialZoom, initialMinZoom, maxBounds, onEntrySelect, heatmapMode, selectedEntry }) {
  const center = initialCenter || [20, 0]
  const zoom = initialZoom || 2
  const minZoom = initialMinZoom || 2

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

  return (
    <div style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxBounds={maxBounds || undefined}
        maxBoundsViscosity={maxBounds ? 1.0 : 0}
        zoomControl={false}
        style={{ height:'100%', width:'100%', background:'#e2e8f0' }}
        worldCopyJump={!maxBounds}
      >
        <ZoomControl position="bottomright" />
        <MapClickHandler onMapClick={() => onEntrySelect && onEntrySelect(null)} />
        <MapFlyTo selectedEntry={selectedEntry} />

        <TileLayer key={layers.base} url={tile.url} attribution={tile.attr} crossOrigin={true} />

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
            {validEntries.map(entry => (
              <Marker
                key={entry.id}
                position={[entry.lat, entry.lon]}
                icon={createMarkerIcon(entry.category)}
                eventHandlers={{ click: () => onEntrySelect && onEntrySelect(entry) }}
              >
                <Tooltip direction="top" offset={[0,-10]} opacity={0.95}>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:'0.8rem' }}>
                    {entry.name}
                  </span>
                </Tooltip>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  )
}

