'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function GlobalPrelimsGptBot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);
  const iframeRef = useRef(null);

  // Hide on admin/classroom display screens
  const isHiddenRoute =
    pathname?.startsWith('/remote/display') ||
    pathname?.startsWith('/admin/studio/present');

  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'PQC_CLOSE') {
        setIsOpen(false);
      } else if (e.data.type === 'PQC_OPEN_DASH') {
        try {
          if (e.data.params) {
            localStorage.setItem('pq-dashboard-params', JSON.stringify(e.data.params));
          }
        } catch {
          // ignore
        }
        const hash = e.data.hash || '#subject';
        const pageName = hash.replace(/^#/, '') || 'subject';
        window.dispatchEvent(new CustomEvent('upscgpt:open-analysis', { detail: { params: e.data.params, hash } }));
        // If a dashboard iframe is already mounted on the page, sync params + switch view directly
        const dashFrame = document.querySelector('iframe[data-pyq-dashboard="true"]');
        if (dashFrame && dashFrame.contentWindow) {
          try {
            const cw = dashFrame.contentWindow;
            if (cw.dash && e.data.params) {
              cw.dash.setParams(e.data.params);
            }
            if (cw.PQ && typeof cw.PQ.show === 'function') {
              cw.PQ.show(pageName);
            } else {
              cw.location.hash = hash;
            }
          } catch {
            // ignore
          }
          setIsOpen(false);
        } else {
          setIsOpen(false);
          router.push(`/prelims/pyq?mode=analysis${hash}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.openAskPrelimsGpt = (q) => {
      setHasLoaded(true);
      setIsOpen(true);
      if (q) {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'PQC_ASK', q }, '*');
        } else {
          setPendingQuery(q);
        }
      }
    };

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  if (isHiddenRoute) return null;

  return (
    <>
      {hasLoaded && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9998,
            right: 'max(20px, env(safe-area-inset-right, 0px))',
            bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
            width: 'min(430px, calc(100vw - 32px))',
            height: 'min(650px, calc(100vh - 116px))',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            boxShadow: '0 22px 60px rgba(5, 8, 20, 0.45)',
            background: 'var(--bg-secondary, #0b1124)',
            display: isOpen ? 'block' : 'none',
          }}
        >
          <iframe
            ref={iframeRef}
            src="/pyq/index.html?embed=chat"
            title="Ask PrelimsGPT — PYQ Trends, Concepts & Quiz"
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            onLoad={() => {
              if (pendingQuery && iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  { type: 'PQC_ASK', q: pendingQuery },
                  '*'
                );
                setPendingQuery(null);
              }
            }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!hasLoaded) setHasLoaded(true);
          setIsOpen((v) => !v);
        }}
        aria-expanded={isOpen}
        aria-label="Ask PrelimsGPT — PYQ Trends, Concepts & Quiz"
        style={{
          position: 'fixed',
          zIndex: 9999,
          right: 'max(20px, env(safe-area-inset-right, 0px))',
          bottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          padding: isOpen ? '12px 16px' : '12px 20px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.24)',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          color: '#ffffff',
          fontFamily: 'var(--font-body, Inter, sans-serif)',
          fontSize: '0.92rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 28px rgba(37, 99, 235, 0.38), 0 4px 12px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8 8.5h8M8 11.5h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <span>{isOpen ? 'Close PrelimsGPT' : 'Ask PrelimsGPT'}</span>
      </button>
    </>
  );
}
