'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

/**
 * Per-item actions revealed on hover/focus or selection, plus a "..." overflow menu.
 */
export default function RowActions({
  inlineActions = [],
  menuItems = [],
  alwaysVisible = false,
  label = 'Row actions',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`pyq-ui-row-actions ${alwaysVisible ? 'always-visible' : ''}`}
      role="group"
      aria-label={label}
    >
      {inlineActions.length > 0 && (
        <div className="pyq-ui-row-inline">
          {inlineActions.map((act) =>
            act.href ? (
              <Link
                key={act.id}
                href={act.href}
                className={`pyq-ui-icon-btn ${act.active ? 'is-active' : ''}`}
                aria-label={act.label}
                title={act.title || act.label}
              >
                {act.icon}
                {act.showLabel && <span>{act.label}</span>}
              </Link>
            ) : (
              <button
                key={act.id}
                type="button"
                className={`pyq-ui-icon-btn ${act.active ? 'is-active' : ''}`}
                onClick={act.onClick}
                aria-label={act.label}
                title={act.title || act.label}
              >
                {act.icon}
                {act.showLabel && <span>{act.label}</span>}
              </button>
            ),
          )}
        </div>
      )}

      {menuItems.length > 0 && (
        <div className="pyq-ui-menu-wrap">
          <button
            type="button"
            className="pyq-ui-icon-btn"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="More actions"
            title="More actions"
          >
            <MoreHorizontal size={16} />
          </button>
          {open && (
            <div className="pyq-ui-menu" role="menu">
              {menuItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="pyq-ui-menu-item"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <kbd className="pyq-ui-kbd">{item.shortcut}</kbd>}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    className="pyq-ui-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <kbd className="pyq-ui-kbd">{item.shortcut}</kbd>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
