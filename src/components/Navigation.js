"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
    padding: '1rem 2rem',
    background: 'rgba(2, 6, 23, 0.8)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
    width: '38px',
    height: '38px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)'
  };

  const desktopNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  };

  const linkStyle = {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.2s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: 'white'
  };

  const btnSecondaryStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const btnPrimaryStyle = {
    background: 'white',
    color: 'black',
    padding: '8px 20px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '800',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
  };

  return (
    <nav style={navStyle}>
      <Link href="/" style={logoContainerStyle}>
        <div style={logoIconStyle}>💎</div>
        <div className="hidden sm:block">
          <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UPSC ATLAS
          </span>
        </div>
      </Link>

      <div style={desktopNavStyle}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/" style={linkStyle} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Home</Link>
          <Link href="/atlas" style={linkStyle} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#94a3b8'}>Atlas</Link>
        </div>

        <div style={{ height: '20px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>

        {loading ? (
          <div style={{ width: '80px', height: '36px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}></div>
        ) : session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{session.user.name}</div>
              <Link href="/profile" style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                {session.user.tier || 'FREE'} · SETTINGS
              </Link>
            </div>
            <button
              onClick={() => signOut()}
              style={btnSecondaryStyle}
              onMouseOver={e => { e.target.style.background='rgba(255, 255, 255, 0.1)'; e.target.style.borderColor='rgba(255, 255, 255, 0.2)'; }}
              onMouseOut={e => { e.target.style.background='rgba(255, 255, 255, 0.05)'; e.target.style.borderColor='rgba(255, 255, 255, 0.1)'; }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={btnPrimaryStyle}
          >
            <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="" width={14} height={14} unoptimized />
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
