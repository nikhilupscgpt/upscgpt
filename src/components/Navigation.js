"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const loading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === "/login" || pathname === "/admin-login") return null;

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
    <nav className={`app-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="app-nav__bar">
        <div className="app-nav__brand-group">
          <Link href="/" className="app-nav__brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="app-nav__logo">💎</div>
            <span className="app-nav__brand-text">
              UPSC ATLAS
            </span>
          </Link>

          <div className="app-nav__links">
            <Link href="/atlas" className="app-nav__link">Atlas</Link>
            <Link href="/insights" className="app-nav__link">Insights</Link>
          </div>
        </div>

        <div className="app-nav__actions">
          {children ? <div className="app-nav__slot">{children}</div> : null}

          {loading ? (
            <div style={{ width: '40px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
          ) : session ? (
            <div className="app-nav__session">
              <div className="app-nav__identity">
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'white' }}>{session.user.name.split(' ')[0]}</div>
                <Link href="/profile" style={{ fontSize: '0.65rem', color: session.user.tier === 'PRO' ? '#fbbf24' : '#94a3b8', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                  {session.user.tier} TIER
                </Link>
              </div>
              {session.user.tier === 'FREE' && (
                <Link href="/profile" className="app-nav__go-pro">
                  💎 GO PRO
                </Link>
              )}
              <Link href="/profile" style={{ ...btnSecondaryStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                 👤 <span className="nav-desktop-text">Profile</span>
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

          <button
            type="button"
            className="app-nav__menu-btn"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div className="app-nav__mobile-panel">
        <div className="app-nav__mobile-links">
          <Link href="/atlas" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Atlas</Link>
          <Link href="/insights" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Insights</Link>
          {session ? <Link href="/profile" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link> : null}
        </div>

        {children ? <div className="app-nav__mobile-slot">{children}</div> : null}

        {session ? (
          <div className="app-nav__mobile-account">
            {session.user.tier === 'FREE' ? (
              <Link href="/profile" className="app-nav__go-pro" onClick={() => setMobileMenuOpen(false)}>
                💎 GO PRO
              </Link>
            ) : null}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                signOut()
              }}
              style={{ ...btnSecondaryStyle, width: '100%', justifyContent: 'center' }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
