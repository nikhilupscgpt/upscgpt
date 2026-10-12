'use client';

import { useCallback, useEffect, useState } from 'react';

const ATTEMPTS_KEY = 'pyq_attempts_v1';
const BOOKMARKS_KEY = 'pyq_bookmarks_v1';
const MISTAKES_KEY = 'pyq_mistakes_v1';
const STREAK_KEY = 'pyq_streak_v1';

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

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Persistent attempt + bookmark + mistake notebook + daily streak store.
 */
export function usePyqStore() {
  const [attempts, setAttempts] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [mistakes, setMistakes] = useState({});
  const [streak, setStreak] = useState({ current: 0, best: 0, lastDate: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAttempts(read(ATTEMPTS_KEY));
    setBookmarks(read(BOOKMARKS_KEY));
    setMistakes(read(MISTAKES_KEY));
    const rawStreak = read(STREAK_KEY);
    setStreak({
      current: rawStreak.current || 0,
      best: rawStreak.best || 0,
      lastDate: rawStreak.lastDate || null,
    });
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

  const completeDailyStreak = useCallback(() => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    setStreak(prev => {
      if (prev.lastDate === today) {
        // Already recorded today
        return prev;
      }

      let newCurrent = 1;
      if (prev.lastDate === yesterday) {
        // Maintained streak!
        newCurrent = (prev.current || 0) + 1;
      }

      const next = {
        current: newCurrent,
        best: Math.max(prev.best || 0, newCurrent),
        lastDate: today,
      };
      write(STREAK_KEY, next);
      return next;
    });
  }, []);

  const isStreakCompletedToday = streak.lastDate === getTodayStr();

  return {
    attempts,
    bookmarks,
    mistakes,
    streak,
    isStreakCompletedToday,
    ready,
    recordAttempt,
    recordMany,
    clearAttempt,
    recordMistake,
    clearMistake,
    clearAllMistakes,
    toggleBookmark,
    completeDailyStreak,
  };
}
