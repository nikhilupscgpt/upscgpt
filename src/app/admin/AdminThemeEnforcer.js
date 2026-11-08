'use client';

import { useEffect } from 'react';

/**
 * Enforces uniform dark theme across all admin desks and studios.
 * Prevents any white background or light-mode token leakage on backend pages.
 */
export default function AdminThemeEnforcer() {
  useEffect(() => {
    const prevTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    return () => {
      if (prevTheme) {
        document.documentElement.setAttribute('data-theme', prevTheme);
      }
    };
  }, []);

  return null;
}
