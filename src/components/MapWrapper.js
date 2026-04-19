"use client"
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div style={{ height:'100%', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#1e293b', color:'#94a3b8', fontSize:'0.95rem', fontWeight:600 }}>
      Loading ArcGIS Map…
    </div>
  )
})

export default function MapWrapper({ 
  entries, layers, mapRef, initialCenter, initialZoom, initialMinZoom, 
  maxBounds, onEntrySelect, heatmapMode, selectedEntry, 
  activeContinent, activeAdmRegion, searchQuery, activeOrg, regionConfig 
}) {
  return (
    <Map
      entries={entries}
      layers={layers}
      mapRef={mapRef}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      initialMinZoom={initialMinZoom}
      maxBounds={maxBounds}
      onEntrySelect={onEntrySelect}
      heatmapMode={heatmapMode}
      selectedEntry={selectedEntry}
      activeContinent={activeContinent}
      activeAdmRegion={activeAdmRegion}
      searchQuery={searchQuery}
      activeOrg={activeOrg}
      regionConfig={regionConfig}
    />
  )
}


