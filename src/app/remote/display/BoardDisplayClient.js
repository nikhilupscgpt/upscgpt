'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import { Maximize2, Minimize2, Tv, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from '@/lib/remote/link';
import '@/app/remote/remote.css';

// Load the slide view (and its CSS) only once an iPad has connected. Importing it
// statically made the waiting screen preload CSS it never used, which is what the
// "preloaded using link preload but not used" console warning was about.
const PyqPresenterClient = dynamic(
  () => import('@/app/admin/pyq/present/PyqPresenterClient'),
  { ssr: false }
);

const deckKey = (qs) => (Array.isArray(qs) ? qs.map((q) => q?.id).join(',') : '');

export default function BoardDisplayClient({ user }) {
  const [pairingCode, setPairingCode] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [linkStatus, setLinkStatus] = useState('waiting');
  const [statusInfo, setStatusInfo] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deck, setDeck] = useState(null);
  const [isDisplayActive, setIsDisplayActive] = useState(false);

  const linkRef = useRef(null);

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Start Board Display Link (Handles React StrictMode cleanup - Pitfall 3)
  useEffect(() => {
    let active = true;
    const link = new Link('display');
    linkRef.current = link;

    link.watch((status, info) => {
      if (!active) return;
      setLinkStatus(status);
      setStatusInfo(status === 'connected' ? '' : (info || ''));
    });

    link
      .startDisplay()
      .then((s) => {
        if (!active) {
          link.stop();
          return;
        }
        setPairingCode(s.code);

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const joinUrl = `${origin}/remote/join?code=${s.code}`;
        QRCode.toDataURL(joinUrl, {
          margin: 2,
          scale: 8,
          color: { dark: '#020617', light: '#ffffff' },
        })
          .then((url) => {
            if (active) setQrDataUrl(url);
          })
          .catch(console.error);
      })
      .catch((err) => {
        if (active) setStatusInfo(err.message || 'Failed to start pairing');
      });

    // Keep the same deck array when the iPad reconnects with the same lecture,
    // so the slide view is not reset. The slide view itself sends "ready" once it
    // is listening (sending it here could lose the iPad's reply).
    const applyDeck = (qs) => {
      setDeck((prev) => (deckKey(prev) === deckKey(qs) ? prev : qs));
      setIsDisplayActive(true);
    };

    link.on(async (msg) => {
      if (!active) return;
      if (msg.t === 'hello') {
        if (Array.isArray(msg.questions) && msg.questions.length > 0) {
          applyDeck(msg.questions);
          return;
        }
        try {
          const res = await fetch(`/api/remote?op=deck&id=${link.sessionId}`, {
            cache: 'no-store',
          });
          const data = await res.json();
          if (active && Array.isArray(data.deck) && data.deck.length > 0) {
            applyDeck(data.deck);
          }
        } catch (e) {
          console.error('[Board] Failed to fetch deck on hello:', e);
        }
      }
    });

    return () => {
      active = false;
      link.stop();
    };
  }, []);

  // Format 6-digit code with spacing: "482 910"
  const formattedCode = pairingCode
    ? `${pairingCode.slice(0, 3)} ${pairingCode.slice(3, 6)}`
    : '••• •••';

  // If iPad has connected and loaded slides, render presentation in full display mode
  if (isDisplayActive && deck && deck.length > 0) {
    return (
      <PyqPresenterClient
        questions={deck}
        isDisplayMode={true}
        externalLink={linkRef.current}
        onExitDisplay={() => setIsDisplayActive(false)}
      />
    );
  }

  return (
    <div className="pq-board-display-root">
      <div className="pq-board-waiting-card">
        {/* Academy / Studio Branding */}
        <div className="pq-board-logo-pill">
          <Sparkles size={14} />
          <span>UPSCGPT STUDIO • CLASSROOM DISPLAY</span>
        </div>

        <h1 className="pq-board-waiting-title">Present with iPad + Smart Board</h1>
        <p className="pq-board-waiting-sub">
          Scan the QR code or enter this 6-digit code on your iPad to take control of this classroom screen.
        </p>

        {/* Pairing Stage: Code + QR */}
        <div className="pq-board-pairing-stage">
          {/* Code Box */}
          <div className="pq-board-code-box">
            <span className="pq-board-code-label">Pairing Code</span>
            <div className="pq-board-digits">{formattedCode}</div>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="pq-board-qr-wrap">
              <img
                src={qrDataUrl}
                alt={`QR code to pair with board ${pairingCode}`}
                className="pq-board-qr-img"
              />
              <span className="pq-board-qr-caption">Scan with iPad camera</span>
            </div>
          )}
        </div>

        {/* Status Pill & Fullscreen Toggle */}
        <div className="pq-board-status-row">
          <div className={`pq-board-status-pill is-${linkStatus}`}>
            {linkStatus === 'waiting' ? (
              <>
                <span className="pq-ping-dot" /> Waiting for iPad to connect...
              </>
            ) : linkStatus === 'connecting' ? (
              <>
                <RefreshCw size={14} className="pq-spin" /> Connecting to iPad...
              </>
            ) : linkStatus === 'connected' ? (
              <>
                <CheckCircle2 size={14} /> Connected to iPad
              </>
            ) : (
              <>
                <AlertCircle size={14} /> {statusInfo || 'Connection lost. Reconnecting...'}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="pq-board-fs-btn"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
