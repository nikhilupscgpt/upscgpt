'use client';

import React from 'react';
import Link from 'next/link';

/**
 * One header row per screen: breadcrumb left, primary action right. No subtitle clutter.
 */
export default function PageHeader({ breadcrumbs = [], primaryAction = null, secondaryActions = null }) {
  return (
    <header className="pyq-ui-header">
      <nav className="pyq-ui-breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={`${idx}-${crumb.label}`}>
              {idx > 0 && <span aria-hidden="true">/</span>}
              {isLast || !crumb.href ? (
                <span className={isLast ? 'pyq-ui-breadcrumb-current' : ''}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href}>{crumb.label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      <div className="pyq-ui-header-actions">
        {secondaryActions}
        {primaryAction}
      </div>
    </header>
  );
}
