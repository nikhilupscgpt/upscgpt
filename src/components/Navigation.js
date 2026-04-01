"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const loading = status === "loading";

  if (pathname === "/login" || pathname === "/admin-login") return null;

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    padding: '0.75rem 2rem',
    background: 'rgba(2, 6, 23, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'Outfit', sans-serif"
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'inherit'
  };

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
  };

  const linkStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.2s',
    padding: '6px 12px',
    borderRadius: '8px'
  };

  const btnSecondaryStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 14px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const btnPrimaryStyle = {
    background: 'white',
    color: 'black',
    padding: '6px 16px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '800',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={logoContainerStyle}>
          <div style={logoIconStyle}>💎</div>
          <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UPSC ATLAS
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/atlas" style={linkStyle}>Atlas</Link>
          <Link href="/insights" style={linkStyle}>Insights</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Slot for page-specific actions like Map buttons */}
        {children && <div style={{ display: 'flex', gap: '0.75rem', marginRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '1rem' }}>{children}</div>}

        {loading ? (
          <div style={{ width: '40px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
        ) : session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{session.user.name.split(' ')[0]}</div>
              <Link href="/profile" style={{ fontSize: '0.65rem', color: session.user.tier === 'PRO' ? '#fbbf24' : '#94a3b8', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                {session.user.tier} TIER
              </Link>
            </div>
            {session.user.tier === 'FREE' && (
              <Link href="/profile" style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: 'black',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '900',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
              }}>
                💎 GO PRO
              </Link>
            )}
            <Link href="/profile" style={{ ...btnSecondaryStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
               👤 <span className="hidden sm:inline">Profile</span>
            </Link>
            <button
              onClick={() => signOut()}
              style={{ ...btnSecondaryStyle, background: 'transparent', border: 'none', color: '#64748b' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={btnPrimaryStyle}
          >
            <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="" width={12} height={12} unoptimized />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
