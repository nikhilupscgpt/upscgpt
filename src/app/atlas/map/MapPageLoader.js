"use client"

import dynamic from 'next/dynamic'

const MapPageClient = dynamic(() => import('./MapPageClient'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>
      Loading map…
    </div>
  ),
})

export default function MapPageLoader() {
  return <MapPageClient />
}
