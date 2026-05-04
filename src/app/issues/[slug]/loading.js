"use client";

export default function IssueLoading() {
  return (
    <div style={{ background: '#020617', minHeight: '100vh', padding: '100px 32px 80px', fontFamily: '"Outfit", sans-serif', color: '#f5f5f7', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header Skeleton */}
        <div className="skeleton-box" style={{ width: '120px', height: '24px', marginBottom: '24px', borderRadius: '20px' }} />
        <div className="skeleton-box" style={{ width: '70%', height: '80px', marginBottom: '40px', borderRadius: '12px' }} />
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '64px' }}>
          <div className="skeleton-box" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
        </div>

        {/* Content Block Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="skeleton-box" style={{ width: '100%', height: '300px', borderRadius: '24px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '200px', borderRadius: '24px' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '400px', borderRadius: '24px' }} />
        </div>
      </div>

      <style jsx>{`
        .skeleton-box {
          background: rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }
        .skeleton-box::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
