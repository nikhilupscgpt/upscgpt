'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { captureFirstVisitIfNeeded, track } from '@/lib/analytics/client';

const CONSENT_KEY = 'upsc_analytics_consent_v1';

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState(null); // null | 'granted' | 'denied'

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      if (saved === 'granted' || saved === 'denied') {
        setConsent(saved);
      } else {
        setConsent('pending');
      }
    } catch {
      setConsent('pending');
    }
  }, []);

  // Essential first-party telemetry (first_visit, page_view, client_error, 10% web_vital)
  useEffect(() => {
    captureFirstVisitIfNeeded();
  }, []);

  useEffect(() => {
    if (pathname) {
      track('page_view', { route: pathname.slice(0, 256) });
    }
  }, [pathname]);

  useEffect(() => {
    const onError = (event) => {
      track('client_error', {
        route: (window.location.pathname || '/').slice(0, 256),
        message: String(event?.message || 'Script error').slice(0, 200),
        source: 'window.onerror',
      });
    };
    const onRejection = (event) => {
      track('client_error', {
        route: (window.location.pathname || '/').slice(0, 256),
        message: String(event?.reason?.message || event?.reason || 'Unhandled rejection').slice(0, 200),
        source: 'unhandledrejection',
      });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    // 10% Web Vitals sampling using PerformanceObserver
    let lcpObserver = null;
    if (typeof PerformanceObserver !== 'undefined' && Math.random() < 0.1) {
      try {
        const nav = performance.getEntriesByType('navigation')?.[0];
        if (nav && typeof nav.responseStart === 'number') {
          track('web_vital', {
            name: 'TTFB',
            value: Math.max(0, Math.round(nav.responseStart)),
            route: (window.location.pathname || '/').slice(0, 256),
          });
        }
        lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) {
            track('web_vital', {
              name: 'LCP',
              value: Math.max(0, Math.round(last.startTime)),
              route: (window.location.pathname || '/').slice(0, 256),
            });
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {}
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      if (lcpObserver) lcpObserver.disconnect();
    };
  }, []);

  const choose = (val) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, val);
    } catch {}
    setConsent(val);
  };

  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-XV8ZY1XKLC"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XV8ZY1XKLC', { send_page_view: true });
            `}
          </Script>
          {clarityId && (
            <Script id="microsoft-clarity" strategy="afterInteractive">
              {`
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityId}");
              `}
            </Script>
          )}
        </>
      )}

      {consent === 'pending' && (
        <div
          role="dialog"
          aria-label="Analytics consent"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999,
            maxWidth: 380,
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.28)',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 12px 32px rgba(2, 6, 23, 0.45)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Privacy &amp; Analytics</div>
          <div style={{ color: '#cbd5e1', marginBottom: 12 }}>
            We use essential telemetry to grade tests and protect your account, plus optional analytics (GA4 / Clarity) to improve upscgpt+.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => choose('denied')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.35)',
                background: 'transparent',
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => choose('granted')}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                background: '#10b981',
                color: '#042f2e',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Accept analytics
            </button>
          </div>
        </div>
      )}
    </>
  );
}
