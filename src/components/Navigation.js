"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  Layers,
  Map
} from "lucide-react";
import { useNavContext } from "@/context/NavContext";
import ThemeToggle from "./ThemeToggle";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const { navContent } = useNavContext();
  const pathname = usePathname();
  const loading = status === "loading";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const userDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Neural top progress bar on navigation
  const handleLinkClick = (e) => {
    const target = e.target.closest('a');
    if (target && target.href && !target.href.includes('#') && !target.href.includes('mailto:')) {
      try {
        const url = new URL(target.href, window.location.origin);
        if (url.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      } catch (err) {
        // Safe fallback
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  // Reset progress bar on route change
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const activeContent = children || navContent;

  const isHiddenRoute = pathname === "/login" || pathname === "/admin-login" || pathname.startsWith("/admin");
  if (!pathname || isHiddenRoute) return null;

  const isPrelimsActive = pathname.startsWith("/prelims");
  const isAtlasActive = pathname.startsWith("/atlas");

  const userInitial = session?.user?.name
    ? session.user.name.trim()[0].toUpperCase()
    : (session?.user?.email ? session.user.email[0].toUpperCase() : "U");

  return (
    <>
      {/* Top Navigation Shimmer Progress Bar */}
      {isNavigating && (
        <div style={{ position: 'fixed', top: 0, left: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #10b981)', zIndex: 9999, width: '100%', overflow: 'hidden' }}>
          <div className="neural-progress-shimmer" />
        </div>
      )}

      <nav className={`app-nav${mobileMenuOpen ? " mobile-open" : ""}`}>
        <div className="app-nav__bar">
          
          {/* Brand & Left Navigation Links */}
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
                <Image src="/logo.png" alt="logo" width={34} height={34} priority />
              </div>
              <span className="app-nav__brand-text" suppressHydrationWarning={true} style={{ fontFamily: 'monospace', letterSpacing: '-0.02em', fontSize: '1.25rem', fontWeight: 800 }}>
                upsc<span style={{ color: 'var(--color-blue, #3b82f6)' }}>gpt</span>
              </span>
              <span className="beta-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-blue, #3b82f6)', border: '1px solid rgba(59, 130, 246, 0.3)', textTransform: 'lowercase' }}>prelimsgpt</span>
            </Link>

            {/* Focused Core Links: PYQ Explorer & Atlas Only */}
            <div className="app-nav__links">
              <Link
                href="/prelims/pyq"
                className={`app-nav__link ${isPrelimsActive ? 'active' : ''}`}
                style={{
                  color: isPrelimsActive ? 'var(--color-blue, #3b82f6)' : undefined,
                  fontWeight: isPrelimsActive ? 900 : 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={15} />
                PYQ Explorer
              </Link>

              <Link
                href="/atlas"
                className={`app-nav__link ${isAtlasActive ? 'active' : ''}`}
                style={{
                  color: isAtlasActive ? 'var(--color-blue, #3b82f6)' : undefined,
                  fontWeight: isAtlasActive ? 900 : 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Map size={15} />
                Atlas
              </Link>
            </div>
          </div>

          {/* Right Action Controls: Theme Toggle & Single User Dropdown */}
          <div className="app-nav__actions" style={{ gap: '14px' }}>
            {activeContent && <div className="app-nav__slot">{activeContent}</div>}

            {/* Dark / Sepia Theme Mode Switcher */}
            <ThemeToggle />

            {/* User Session Dropdown (Dashboard, Profile, Logout in ONE menu) */}
            {loading ? (
              <div style={{ width: '38px', height: '34px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px' }} />
            ) : session ? (
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: userDropdownOpen ? 'var(--bg-hover, rgba(15, 23, 42, 0.95))' : 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    borderRadius: '999px',
                    padding: '4px 10px 4px 5px',
                    cursor: 'pointer',
                    color: 'var(--text-primary, #f8fafc)',
                    transition: 'all 0.15s ease',
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar Bubble with User Initial */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    {userInitial}
                  </div>

                  <span style={{ fontSize: '0.82rem', fontWeight: 700, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.user.name ? session.user.name.split(' ')[0] : 'Aspirant'}
                  </span>

                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--text-secondary, #94a3b8)',
                      transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {/* Floating Profile & Navigation Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '230px',
                      background: 'var(--bg-secondary, #0f172a)',
                      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.14))',
                      borderRadius: '16px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                      padding: '8px',
                      zIndex: 1100,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    {/* Header Info */}
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', marginBottom: '6px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', lineHeight: 1.2 }}>
                        {session.user.name || 'Aspirant'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.user.email}
                      </div>
                      <div style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                        {session.user.tier || 'FREE'} TIER
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--text-primary, #f8fafc)',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={16} style={{ color: '#3b82f6' }} />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--text-primary, #f8fafc)',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} style={{ color: '#8b5cf6' }} />
                      Profile
                    </Link>

                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#f59e0b',
                          textDecoration: 'none',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Shield size={16} />
                        Admin Console
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color, rgba(255, 255, 255, 0.08))', margin: '6px 0' }} />

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={() => { setUserDropdownOpen(false); signOut(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#f87171',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Clean Mobile Sliding Drawer */}
        <div className="app-nav__mobile-panel">
          <div className="app-nav__mobile-links">
            <Link href="/prelims/pyq" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>
              PYQ Explorer
            </Link>
            <Link href="/atlas" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Atlas
            </Link>
            {session && (
              <>
                <Link href="/dashboard" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/profile" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
              </>
            )}
          </div>

          {session && (
            <div className="app-nav__mobile-account" style={{ marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

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
