'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

/**
 * Accessible filter bar: at most 3 visible primary controls + "More filters" popover
 * + removable active filter chips. Every control has an explicit linked <label htmlFor>.
 */
export default function FilterBar({
  primaryFilters = [],
  moreFilters = [],
  activeChips = [],
  onClearAll,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const renderControl = (f) => {
    if (f.type === 'search') {
      return (
        <div key={f.id} className="pyq-ui-filter-field">
          <label htmlFor={f.id} className="pyq-ui-filter-label">
            {f.label}
          </label>
          <input
            id={f.id}
            type="search"
            className="pyq-ui-filter-input"
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder || 'Search...'}
          />
        </div>
      );
    }

    return (
      <div key={f.id} className="pyq-ui-filter-field">
        <label htmlFor={f.id} className="pyq-ui-filter-label">
          {f.label}
        </label>
        <select
          id={f.id}
          className="pyq-ui-filter-select"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          disabled={f.disabled}
        >
          {(f.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <section className="pyq-ui-filterbar" aria-label="Filters">
      <div className="pyq-ui-filter-row">
        {primaryFilters.slice(0, 3).map(renderControl)}
        {moreFilters.length > 0 && (
          <button
            type="button"
            className="pyq-ui-secondary-btn"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-controls="pyq-more-filters-panel"
          >
            <SlidersHorizontal size={14} />
            <span>More filters</span>
          </button>
        )}
      </div>

      {moreOpen && moreFilters.length > 0 && (
        <div id="pyq-more-filters-panel" className="pyq-ui-more-popover">
          {moreFilters.map(renderControl)}
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="pyq-ui-chips" aria-label="Active filters">
          {activeChips.map((chip) => (
            <span key={chip.id} className="pyq-ui-chip">
              <span>{chip.label}</span>
              <button
                type="button"
                className="pyq-ui-chip-remove"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
          {activeChips.length >= 2 && onClearAll && (
            <button
              type="button"
              className="pyq-ui-secondary-btn"
              onClick={onClearAll}
              style={{ padding: '3px 10px', fontSize: 12 }}
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </section>
  );
}
