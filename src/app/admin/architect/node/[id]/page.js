"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// THE ULTIMATE SSR BYPASS
const ForgeClient = dynamic(() => import('./ForgeClient'), { 
  ssr: false,
  loading: () => <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#3b82f6', fontWeight: 900 }}>Initializing Neural Forge...</div>
});

export default function Page() {
  const params = useParams();
  const id = params?.id;
  
  return <ForgeClient id={id} />;
}
