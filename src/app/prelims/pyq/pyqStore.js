'use client';

import { useCallback, useEffect, useState } from 'react';

const ATTEMPTS_KEY = 'pyq_attempts_v1';
const BOOKMARKS_KEY = 'pyq_bookmarks_v1';
const MISTAKES_KEY = 'pyq_mistakes_v1';

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
 * Persistent attempt + bookmark + mistake notebook store shared across Explorer and Practice.
 * attempts: { [questionId]: { sel: 'a', ok: boolean } }
 * mistakes: { [questionId]: { timestamp: number, lastWrongSel?: string } }
 * bookmarks: { [questionId]: true }
 */
export function usePyqStore() {
  const [attempts, setAttempts] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [mistakes, setMistakes] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAttempts(read(ATTEMPTS_KEY));
    setBookmarks(read(BOOKMARKS_KEY));
    setMistakes(read(MISTAKES_KEY));
    setReady(true);
  }, []);

  const recordAttempt = useCallback((id, sel, ok) => {
    setAttempts(prev => {
      const next = { ...prev, [id]: { sel, ok } };
      write(ATTEMPTS_KEY, next);
      return next;
    });

    setMistakes(prev => {
      const next = { ...prev };
      if (ok) {
        // Correct answer clears it from Mistake Notebook
        delete next[id];
      } else {
        // Wrong answer automatically adds it to Mistake Notebook
        next[id] = { timestamp: Date.now(), lastWrongSel: sel };
      }
      write(MISTAKES_KEY, next);
      return next;
    });
  }, []);

  const recordMany = useCallback((entries) => {
    setAttempts(prev => {
      const next = { ...prev, ...entries };
      write(ATTEMPTS_KEY, next);
      return next;
    });

    setMistakes(prev => {
      const next = { ...prev };
      for (const [id, data] of Object.entries(entries)) {
        if (data.ok) {
          delete next[id];
        } else {
          next[id] = { timestamp: Date.now(), lastWrongSel: data.sel || null };
        }
      }
      write(MISTAKES_KEY, next);
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

  const recordMistake = useCallback((id, data = {}) => {
    setMistakes(prev => {
      const next = { ...prev, [id]: { timestamp: Date.now(), ...data } };
      write(MISTAKES_KEY, next);
      return next;
    });
  }, []);

  const clearMistake = useCallback((id) => {
    setMistakes(prev => {
      const next = { ...prev };
      delete next[id];
      write(MISTAKES_KEY, next);
      return next;
    });
  }, []);

  const clearAllMistakes = useCallback(() => {
    setMistakes({});
    write(MISTAKES_KEY, {});
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

  return {
    attempts,
    bookmarks,
    mistakes,
    ready,
    recordAttempt,
    recordMany,
    clearAttempt,
    recordMistake,
    clearMistake,
    clearAllMistakes,
    toggleBookmark,
  };
}
