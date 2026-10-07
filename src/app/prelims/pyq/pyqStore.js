'use client';

import { useCallback, useEffect, useState } from 'react';

const ATTEMPTS_KEY = 'pyq_attempts_v1';
const BOOKMARKS_KEY = 'pyq_bookmarks_v1';

function read(key) {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) || '{}') || {};
  } catch {
    return {};
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / blocked — fail silently, state still works in-memory */
  }
}

/**
 * Persistent attempt + bookmark store shared by the Explorer and Practice mode.
 * attempts: { [questionId]: { sel: 'a', ok: boolean } }
 */
export function usePyqStore() {
  const [attempts, setAttempts] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAttempts(read(ATTEMPTS_KEY));
    setBookmarks(read(BOOKMARKS_KEY));
    setReady(true);
  }, []);

  const recordAttempt = useCallback((id, sel, ok) => {
    setAttempts(prev => {
      const next = { ...prev, [id]: { sel, ok } };
      write(ATTEMPTS_KEY, next);
      return next;
    });
  }, []);

  const recordMany = useCallback((entries) => {
    setAttempts(prev => {
      const next = { ...prev, ...entries };
      write(ATTEMPTS_KEY, next);
      return next;
    });
  }, []);

  const clearAttempt = useCallback((id) => {
    setAttempts(prev => {
      const next = { ...prev };
      delete next[id];
      write(ATTEMPTS_KEY, next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarks(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      write(BOOKMARKS_KEY, next);
      return next;
    });
  }, []);

  return { attempts, bookmarks, ready, recordAttempt, recordMany, clearAttempt, toggleBookmark };
}
