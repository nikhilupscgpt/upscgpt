'use client';

const ANON_COOKIE = 'upsc_anon_id';
const SESSION_KEY = 'upsc_session_v1';
const FIRST_VISIT_KEY = 'upsc_first_visit_sent_v1';
const LAST_SOURCE_KEY = 'upsc_last_touch_source_v1';
const SESSION_TTL_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 10_000;
const FLUSH_BATCH_SIZE = 20;

interface QueuedEvent {
  eventId: string;
  name: string;
  clientTs: string;
  anonId: string;
  sessionId: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  props: Record<string, unknown>;
}

const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersBound = false;

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

export function getAnonId(): string {
  if (typeof window === 'undefined') return 'anon_ssr';
  let id = getCookie(ANON_COOKIE);
  if (!id) {
    try {
      id = window.localStorage.getItem(ANON_COOKIE);
    } catch {}
  }
  if (!id) {
    id = `anon_${uuid()}`;
  }
  setCookie(ANON_COOKIE, id, 60 * 60 * 24 * 365);
  try {
    window.localStorage.setItem(ANON_COOKIE, id);
  } catch {}
  return id;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'sess_ssr';
  const now = Date.now();
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY) || window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id && typeof parsed.lastActive === 'number' && now - parsed.lastActive < SESSION_TTL_MS) {
        const updated = JSON.stringify({ id: parsed.id, lastActive: now });
        window.sessionStorage.setItem(SESSION_KEY, updated);
        window.localStorage.setItem(SESSION_KEY, updated);
        return parsed.id;
      }
    }
  } catch {}

  const freshId = `sess_${uuid()}`;
  const serialized = JSON.stringify({ id: freshId, lastActive: now });
  try {
    window.sessionStorage.setItem(SESSION_KEY, serialized);
    window.localStorage.setItem(SESSION_KEY, serialized);
  } catch {}
  return freshId;
}

function sendBatch(events: QueuedEvent[], useBeacon = false) {
  if (!events.length || typeof window === 'undefined') return;
  const payload = JSON.stringify({ events });

  if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon('/api/e', blob)) return;
    } catch {}
  }

  fetch('/api/e', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function flushEvents(useBeacon = false) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);
  sendBatch(batch, useBeacon);
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents(false);
  }, FLUSH_INTERVAL_MS);
}

function bindGlobalFlush() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  window.addEventListener('pagehide', () => flushEvents(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents(true);
    }
  });
}

export function track(
  name: string,
  props: Record<string, unknown> = {},
  meta: { module?: string; entityType?: string; entityId?: string } = {}
) {
  if (typeof window === 'undefined') return;
  bindGlobalFlush();

  queue.push({
    eventId: uuid(),
    name,
    clientTs: new Date().toISOString(),
    anonId: getAnonId(),
    sessionId: getSessionId(),
    ...(meta.module ? { module: meta.module } : {}),
    ...(meta.entityType ? { entityType: meta.entityType } : {}),
    ...(meta.entityId ? { entityId: meta.entityId } : {}),
    props,
  });

  if (queue.length >= FLUSH_BATCH_SIZE) {
    flushEvents(false);
  } else {
    scheduleFlush();
  }
}

export function captureFirstVisitIfNeeded() {
  if (typeof window === 'undefined') return;
  getAnonId();
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source') || undefined;
  const utm_medium = params.get('utm_medium') || undefined;
  const utm_campaign = params.get('utm_campaign') || undefined;
  const utm_content = params.get('utm_content') || undefined;
  const partner = params.get('partner') || params.get('ref') || undefined;
  const referrer = document.referrer ? document.referrer.slice(0, 256) : undefined;
  const landing = window.location.pathname.slice(0, 256);

  if (utm_source) {
    try {
      window.localStorage.setItem(LAST_SOURCE_KEY, utm_source.slice(0, 100));
      setCookie(LAST_SOURCE_KEY, utm_source.slice(0, 100), 60 * 60 * 24 * 30);
    } catch {}
  }

  try {
    if (window.localStorage.getItem(FIRST_VISIT_KEY)) return;
    window.localStorage.setItem(FIRST_VISIT_KEY, '1');
  } catch {}

  track('first_visit', {
    ...(utm_source ? { utm_source } : {}),
    ...(utm_medium ? { utm_medium } : {}),
    ...(utm_campaign ? { utm_campaign } : {}),
    ...(utm_content ? { utm_content } : {}),
    ...(referrer ? { referrer } : {}),
    landing,
    ...(partner ? { partner } : {}),
  });
}

/**
 * Active-time tracker for entity_view_end (counts only visible tab + recent interaction).
 */
export function createActiveViewTracker(entityType: string, entityId: string, moduleName?: string) {
  let activeMs = 0;
  let lastTick = Date.now();
  let lastInteraction = Date.now();
  let ended = false;

  const onInteract = () => {
    lastInteraction = Date.now();
  };

  const tick = () => {
    const now = Date.now();
    const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
    const isActiveRecently = now - lastInteraction <= 60_000;
    if (isVisible && isActiveRecently) {
      activeMs += Math.min(now - lastTick, 5_000);
    }
    lastTick = now;
  };

  const interval = typeof window !== 'undefined' ? setInterval(tick, 1_000) : null;
  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract, { passive: true });
    window.addEventListener('scroll', onInteract, { passive: true });
  }

  return () => {
    if (ended) return;
    ended = true;
    tick();
    if (interval) clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('scroll', onInteract);
    }
    const activeSec = Math.max(0, Math.min(86400, Math.round(activeMs / 1000)));
    track(
      'entity_view_end',
      { entityType, entityId, activeSec },
      { ...(moduleName ? { module: moduleName } : {}), entityType, entityId }
    );
  };
}
