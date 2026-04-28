"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useNavContext } from "@/context/NavContext";
import { useTranslation } from "@/context/TranslationContext";
import NanoAssistant from "./NanoAssistant";

export default function Navigation({ children }) {
  const { data: session, status } = useSession();
  const { navContent } = useNavContext();
  const { t, lang, changeLanguage } = useTranslation();
  const pathname = usePathname();
  const loading = status === "loading";
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nanoOpen, setNanoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeContent = children || navContent;

  if (pathname === "/login" || pathname === "/admin-login") return null;



  return (
    <>
      <nav className={`app-nav${mobileMenuOpen ? " mobile-open" : ""}`}>
        <div className="app-nav__bar">
          <div className="app-nav__brand-group">
            {/* Mobile Toggle Button */}
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

            {/* Brand Logo & Name */}
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
              <span className="app-nav__brand-text">upscgpt</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="app-nav__links">
              <Link href="/atlas" className="app-nav__link">{t('nav.atlas')}</Link>
            </div>
          </div>

          <div className="app-nav__actions">
            {activeContent && (
              <div className="app-nav__slot">
                {activeContent}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '16px' }}>
              <select 
                value={lang} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="select-custom"
                aria-label="Select Language"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="mr">MR</option>
              </select>
            </div>

            <button 
              onClick={() => setNanoOpen(true)}
              title="Ask Nano AI"
              className="btn-nano"
              style={{ marginRight: '6px' }}
            >
               ✨ <span className="nav-desktop-text">{t('nav.askNano')}</span>
            </button>

            {loading ? (
              <div style={{ width: '40px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
            ) : session ? (
              <div className="app-nav__session">
                <div className="app-nav__identity" style={{ marginRight: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {session.user.name?.split(' ')[0] || 'User'}
                  </div>
                  <Link href="/profile" style={{ fontSize: '0.6rem', color: session.user.tier === 'PRO' ? '#fbbf24' : '#94a3b8', fontWeight: '800', textDecoration: 'none', textTransform: 'uppercase' }}>
                    {session.user.tier} TIER
                  </Link>
                </div>
                {session.user.tier === 'FREE' && (
                  <Link href="/profile" className="app-nav__go-pro">
                    💎 {t('nav.goPro')}
                  </Link>
                )}
                <Link href="/profile" className="btn-secondary" style={{ padding: '6px 10px' }}>
                   👤 <span className="nav-desktop-text">{t('nav.profile')}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '6px 4px' }}
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <div className="app-nav__mobile-panel">
          <div className="app-nav__mobile-links">
            <Link href="/atlas" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.atlas')}</Link>
            {session && <Link href="/profile" className="app-nav__mobile-link" onClick={() => setMobileMenuOpen(false)}>{t('nav.profile')}</Link>}
          </div>

          {activeContent && (
            <div className="app-nav__mobile-slot">
              {activeContent}
            </div>
          )}

          {session && (
            <div className="app-nav__mobile-account">
              {session.user.tier === 'FREE' && (
                <Link href="/profile" className="app-nav__go-pro" onClick={() => setMobileMenuOpen(false)}>
                  💎 {t('nav.goPro')}
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </nav>
      <NanoAssistant isOpen={nanoOpen} onClose={() => setNanoOpen(false)} />
    </>
  );
}
