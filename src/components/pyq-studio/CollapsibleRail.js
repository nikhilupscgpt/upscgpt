'use client';

import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

/**
 * Collapsible side rail so main content gets the most space.
 */
export default function CollapsibleRail({
  title = 'Filters',
  collapsed = false,
  onToggle,
  children,
  main,
}) {
  return (
    <div className={`pyq-ui-layout ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="pyq-ui-rail" aria-label={title}>
        <div className="pyq-ui-rail-head">
          {!collapsed && <span className="pyq-ui-rail-title">{title}</span>}
          <button
            type="button"
            className="pyq-ui-rail-toggle"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
        {!collapsed && children}
      </aside>
      <div className="pyq-ui-main">{main}</div>
    </div>
  );
}
