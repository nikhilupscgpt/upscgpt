"use client";

import dynamic from 'next/dynamic';

// Now we can safely disable SSR from within this Client Component
const ArchitectClient = dynamic(
  () => import("./ArchitectClient"),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        height: '100vh', background: 'var(--bg-primary)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '0.9rem'
      }}>
        INITIALIZING NEURAL ARCHITECT...
      </div>
    )
  }
);

export default function ArchitectWrapper({ session }) {
  return <ArchitectClient session={session} />;
}
