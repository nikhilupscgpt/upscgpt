import { BrainCircuit } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'var(--bg-primary)', 
      zIndex: 99999, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Outfit", sans-serif'
    }}>
      {/* Top Progress Bar */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        height: '3px', 
        width: '100%', 
        background: 'linear-gradient(90deg, transparent, #3b82f6, #a855f7, transparent)',
        backgroundSize: '200% 100%',
        animation: 'neural-flow 2s linear infinite'
      }} />

      {/* Center Intelligence Icon */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div style={{ 
          position: 'absolute', 
          inset: '-20px', 
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(10px)',
          animation: 'pulse-glow 2s ease-in-out infinite'
        }} />
        <BrainCircuit size={64} color="var(--text-primary)" style={{ position: 'relative', zIndex: 1 }} />
      </div>

      <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>
        Synthesizing Intelligence
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Synchronizing Neural Nodes...
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes neural-flow {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
      `}} />
    </div>
  );
}
