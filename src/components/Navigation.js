"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useNavContext } from "@/context/NavContext";
import NanoAssistant from "./NanoAssistant";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const { navContent } = useNavContext();
  const pathname = usePathname();
  const loading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nanoOpen, setNanoOpen] = useState(false);

  const activeContent = children || navContent;

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
    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '800',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 10px 15px -3px rgba(129, 140, 248, 0.3)'
  };

  return (
    <>
      <nav className={`app-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="app-nav__bar">
        <div className="app-nav__brand-group">
           <Link href="/" className="app-nav__brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="app-nav__logo">
              <Image 
                src="/logo.png" 
                alt="upscgpt logo" 
                width={36} 
                height={36} 
                priority 
              />
            </div>
            <span className="app-nav__brand-text">
              upscgpt
            </span>
          </Link>

          <div className="app-nav__links">
            <Link href="/atlas" className="app-nav__link">Atlas</Link>
          </div>
        </div>

        <div className="app-nav__actions">
          {activeContent ? <div className="app-nav__slot">{activeContent}</div> : null}

          <button 
            onClick={() => setNanoOpen(true)}
            title="Ask Nano AI"
            style={{ ...btnSecondaryStyle, background: 'rgba(99, 102, 241, 0.2)', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', marginRight: '6px' }}
          >
             ✨ <span className="nav-desktop-text">Ask Nano</span>
          </button>

          {loading ? (
            <div style={{ width: '40px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
          ) : session ? (
            <div className="app-nav__session">
              <>
                <div className="app-nav__identity" style={{ marginRight: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white', lineHeight: 1 }}>{session.user.name.split(' ')[0]}</div>
                  <Link href="/profile" style={{ fontSize: '0.6rem', color: session.user.tier === 'PRO' ? '#fbbf24' : '#94a3b8', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                    {session.user.tier} TIER
                  </Link>
                </div>
                {session.user.tier === 'FREE' && (
                  <Link href="/profile" className="app-nav__go-pro">
                    💎 GO PRO
                  </Link>
                )}
                <Link href="/profile" style={{ ...btnSecondaryStyle, display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }}>
                   👤 <span className="nav-desktop-text">Profile</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  style={{ ...btnSecondaryStyle, background: 'transparent', border: 'none', color: '#64748b', padding: '6px 4px' }}
                >
                  Logout
                </button>
              </>
            </div>
          ) : (
            <Link
              href="/login"
              style={{ ...btnPrimaryStyle, textDecoration: 'none' }}
            >
              Sign In
            </Link>
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
          {session ? <Link href="/profile" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link> : null}
        </div>

        {activeContent ? <div className="app-nav__mobile-slot">{activeContent}</div> : null}

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
    <NanoAssistant isOpen={nanoOpen} onClose={() => setNanoOpen(false)} />
    </>
  );
}
