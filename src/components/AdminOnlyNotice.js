import Link from 'next/link';

export default function AdminOnlyNotice({ backHref = '/admin/studio/pyq', backLabel = 'Back to PYQ Studio' }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-primary, #050814)',
        color: 'var(--text-primary, #ffffff)',
        fontFamily: 'var(--font-body, sans-serif)',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px',
          borderRadius: '16px',
          background: 'var(--bg-card, rgba(13, 21, 45, 0.72))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-amber, #f59e0b)',
            marginBottom: '8px',
          }}
        >
          Admin only
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 700 }}>
          PYQ Editor requires Admin access
        </h1>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
          Faculty accounts can browse, organize decks, present, and record in PYQ Studio. Content editing is restricted to Admins.
        </p>
        <Link
          href={backHref}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            borderRadius: '10px',
            background: 'var(--btn-primary-bg, #2563eb)',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {backLabel}
        </Link>
      </div>
    </main>
  );
}
