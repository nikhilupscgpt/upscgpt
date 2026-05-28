"use client"

import dynamic from 'next/dynamic'

const MapPageClient = dynamic(() => import('./MapPageClient'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>
      Loading map…
    </div>
  ),
})

export default function MapPageLoader() {
  return <MapPageClient />
}
