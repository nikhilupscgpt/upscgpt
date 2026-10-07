"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useNavContext } from "@/context/NavContext";
import { useTranslation } from "@/context/TranslationContext";
import NanoAssistant from "./NanoAssistant";
import ThemeToggle from "./ThemeToggle";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const { navContent } = useNavContext();
  const { t, lang, changeLanguage } = useTranslation();
  const pathname = usePathname();
  const loading = status === "loading";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nanoOpen, setNanoOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLinkClick = (e) => {
    const target = e.target.closest('a');
    if (target && target.href && !target.href.includes('#') && !target.href.includes('mailto:')) {
      // Only trigger for internal links that are different from current path
      const url = new URL(target.href, window.location.origin);
      if (url.pathname !== window.location.pathname) {
        setIsNavigating(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const activeContent = children || navContent;

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isHiddenRoute = pathname === "/login" || pathname === "/admin-login" || pathname.startsWith("/admin");
  if (!pathname || isHiddenRoute) return null;

  return (
    <>
      {/* Neural Progress Bar */}
      {isNavigating && (
        <div style={{ position: 'fixed', top: 0, left: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #10b981)', zIndex: 9999, width: '100%', overflow: 'hidden' }}>
          <div className="neural-progress-shimmer" />
        </div>
      )}

      <nav className={`app-nav${mobileMenuOpen ? " mobile-open" : ""}`}>
        <div className="app-nav__bar">
          <div className="app-nav__brand-group">
            <button
              type="button"
              className="app-nav__menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              style={{ marginRight: '12px' }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>

            <Link href="/" className="app-nav__brand" onClick={() => { setMobileMenuOpen(false); setIsNavigating(false); }}>
              <div className="app-nav__logo">
                <Image src="/logo.png" alt="logo" width={36} height={36} priority />
              </div>
              <span className="app-nav__brand-text" suppressHydrationWarning={true} style={{ fontFamily: 'monospace', letterSpacing: '-0.02em', fontSize: '1.25rem', fontWeight: 800 }}>
                upsc<span style={{ color: 'var(--color-blue, #3b82f6)' }}>gpt</span>
              </span>
              <span className="beta-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-blue, #3b82f6)', border: '1px solid rgba(59, 130, 246, 0.3)', textTransform: 'lowercase' }}>prelimsgpt</span>
            </Link>

            <div className="app-nav__links">
              <Link href="/prelims/pyq" className="app-nav__link">PYQ Explorer</Link>
              <Link href="/prelims/mocks" className="app-nav__link">Mock Tests</Link>
              <Link href="/atlas" className="app-nav__link">Atlas Maps</Link>
            </div>
          </div>

          <div className="app-nav__actions">
            {activeContent && <div className="app-nav__slot">{activeContent}</div>}

            <ThemeToggle />

            <div className="lang-toggle-container">
              <div className="lang-toggle">
                {['en', 'hi', 'mr'].map((l) => (
                  <button key={l} onClick={() => changeLanguage(l)} className={lang === l ? 'active' : ''}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setNanoOpen(true)} className="btn-nano" style={{ marginRight: '6px' }}>
              ✨ <span className="nav-desktop-text">Ask Nano</span>
            </button>

            {loading ? (
              <div style={{ width: '40px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
            ) : session ? (
              <div className="app-nav__session">
                <div className="app-nav__identity" style={{ marginRight: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white', lineHeight: 1 }}>
                    {session.user.name?.split(' ')[0] || 'User'}
                  </div>
                  <Link href="/profile" className={session.user.tier === 'PRO' ? 'tier-badge-pro' : ''} style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                    {session.user.tier} TIER
                  </Link>
                </div>
                <Link href="/profile" className="btn-secondary" style={{ padding: '6px 10px' }}>
                  👤 <span className="nav-desktop-text">Profile</span>
                </Link>
                <button onClick={() => signOut()} className="btn-secondary" style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '6px 4px' }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>
        </div>

        <div className="app-nav__mobile-panel">
          <div className="app-nav__mobile-links">
            <Link href="/prelims/pyq" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>PYQ Explorer</Link>
            <Link href="/prelims/mocks" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Mock Tests</Link>
            <Link href="/atlas" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Atlas Maps</Link>
            <Link href="/profile" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
          </div>
          {session && (
            <div className="app-nav__mobile-account">
              <button onClick={() => { setMobileMenuOpen(false); signOut(); }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <NanoAssistant isOpen={nanoOpen} onClose={() => setNanoOpen(false)} />

      <style jsx global>{`
        .neural-progress-shimmer {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          animation: neural-progress 1s infinite;
        }
        @keyframes neural-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}
