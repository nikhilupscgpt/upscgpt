'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wrench, HelpCircle, X } from 'lucide-react';

/**
 * Present-mode & Studio toolbar: at most 6 always-visible tools,
 * remaining controls under "Tools" overflow menu, plus "?" shortcut sheet.
 */
export default function Toolbar({
  primaryTools = [],
  overflowTools = [],
  shortcuts = [],
  className = '',
  label = 'Studio toolbar',
}) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setToolsOpen(false);
        setHelpOpen(false);
      } else if (e.key === '?' && !e.target?.matches?.('input, textarea, select')) {
        e.preventDefault();
        setHelpOpen((v) => !v);
      }
    };
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, []);

  return (
    <>
      <div ref={wrapRef} className={`pyq-ui-toolbar ${className}`.trim()} role="toolbar" aria-label={label}>
        {primaryTools.slice(0, 6).map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`pyq-ui-icon-btn ${tool.active ? 'is-active' : ''}`}
            onClick={tool.onClick}
            disabled={tool.disabled}
            aria-label={tool.label}
            aria-pressed={typeof tool.active === 'boolean' ? tool.active : undefined}
            title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
          >
            {tool.icon}
            {tool.showLabel && <span>{tool.label}</span>}
          </button>
        ))}

        {overflowTools.length > 0 && (
          <div className="pyq-ui-menu-wrap">
            <button
              type="button"
              className="pyq-ui-icon-btn"
              onClick={() => setToolsOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={toolsOpen}
              aria-label="Tools"
              title="More tools"
            >
              <Wrench size={15} />
              <span>Tools</span>
            </button>
            {toolsOpen && (
              <div className="pyq-ui-menu" role="menu">
                {overflowTools.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="pyq-ui-menu-item"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setToolsOpen(false);
                      item.onClick?.();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <kbd className="pyq-ui-kbd">{item.shortcut}</kbd>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {shortcuts.length > 0 && (
          <button
            type="button"
            className="pyq-ui-icon-btn"
            onClick={() => setHelpOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle size={15} />
          </button>
        )}
      </div>

      {helpOpen && (
        <div
          className="pyq-ui-shortcut-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          onClick={() => setHelpOpen(false)}
        >
          <div className="pyq-ui-shortcut-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Keyboard shortcuts</h2>
              <button
                type="button"
                className="pyq-ui-icon-btn"
                onClick={() => setHelpOpen(false)}
                aria-label="Close shortcuts"
              >
                <X size={15} />
              </button>
            </div>
            <div className="pyq-ui-shortcut-list">
              {shortcuts.map((s) => (
                <div key={s.key} className="pyq-ui-shortcut-row">
                  <span>{s.description}</span>
                  <kbd className="pyq-ui-kbd">{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
