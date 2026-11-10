'use client';

import React, { useSyncExternalStore } from 'react';
import DOMPurify from 'dompurify';

/**
 * Renders AI/admin-generated HTML snippets safely.
 *
 * - On the client, HTML is sanitized with DOMPurify (formatting tags only; no scripts,
 *   iframes, style tags/attributes, forms or event handlers).
 * - During SSR and the hydration pass, the tags are stripped and the plain text is rendered
 *   as a normal (React-escaped) text child, so server and first client render match.
 */

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'a', 'abbr', 'b', 'br', 'cite', 'code', 'del', 'div', 'em', 'h4', 'h5', 'h6', 'hr', 'i',
    'li', 'mark', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup', 'table',
    'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'colspan', 'rowspan'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'svg', 'math'],
  FORBID_ATTR: ['style'],
  ALLOW_DATA_ATTR: false,
};

const noopSubscribe = () => () => {};

export function stripTags(html) {
  return String(html ?? '').replace(/<[^>]*>/g, '');
}

export function sanitizeHtml(html) {
  const input = typeof html === 'string' ? html : JSON.stringify(html ?? '');
  if (typeof window === 'undefined' || !DOMPurify?.isSupported) {
    return null; // caller falls back to plain text
  }
  return DOMPurify.sanitize(input, SANITIZE_CONFIG);
}

export default function SafeHtml({ as: Tag = 'span', html, ...rest }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const raw = typeof html === 'string' ? html : JSON.stringify(html ?? '');

  if (isClient) {
    const clean = sanitizeHtml(raw);
    if (clean !== null) {
      return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />;
    }
  }
  return <Tag {...rest}>{stripTags(raw)}</Tag>;
}
