"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Coffee } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server and first render to avoid hydration mismatch
  }

  return (
    <div className="theme-toggle-container">
      <button
        onClick={() => setTheme('dark')}
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
        aria-label="Dark Mode"
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>
      <button
        onClick={() => setTheme('sepia')}
        className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`}
        aria-label="Sepia Mode"
      >
        <Coffee size={14} />
        <span>Sepia</span>
      </button>

      <style jsx>{`
        .theme-toggle-container {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 4px;
          gap: 4px;
        }
        .theme-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .theme-btn:hover {
          color: var(--text-primary);
        }
        .theme-btn.active {
          background: var(--bg-hover);
          color: var(--text-primary);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
