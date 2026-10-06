'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ContentViewerPage() {
  const params = useParams();
  const id = params?.id;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function loadContent() {
      try {
        const res = await fetch(`/api/admin/optional-content/${id}`);
        if (!res.ok) throw new Error('Failed to load content');
        const data = await res.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [id]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
        Loading content...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f87171', fontWeight: 800, fontSize: '1.1rem' }}>
        {error || 'Content not found'}
      </div>
    );
  }

  const isHtml = content.contentMarkdown?.startsWith('<!-- HTML_CONTENT -->');

  // For HTML content, render it raw in a full-page iframe
  if (isHtml) {
    const rawHtml = content.contentMarkdown.replace('<!-- HTML_CONTENT -->', '').trim();
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
        <iframe
          srcDoc={rawHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={content.title}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

  // For markdown content, render with basic styling
  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', color: '#e2e8f0',
      padding: '48px 24px', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            {content.title}
          </h1>
          {content.issue?.title && (
            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              🎯 {content.issue.title}
            </div>
          )}
          {content.sourceUrl && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Source: {content.sourceUrl}
            </div>
          )}
        </div>
        <div
          style={{ fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: content.contentMarkdown }}
        />
      </div>
    </div>
  );
}
