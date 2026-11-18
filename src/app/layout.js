import './globals.css'
import './legal.css'
import AnalyticsConsent from '@/components/AnalyticsConsent'

export const metadata = {
  title: {
    default: 'UPSCGPT (UPSC GPT) | UPSC Prelims PYQ (2011–2026), Geography Atlas & Mains Prep',
    template: '%s | UPSCGPT'
  },
  description: 'UPSCGPT (UPSC GPT) is India\'s strategic UPSC CSE preparation platform. Practice 2,528+ topic-wise solved Prelims Previous Year Questions (2011–2026), 16-year trend analysis, interactive Geography Atlas, and GS Syllabus Notes.',
  keywords: [
    'UPSCGPT',
    'UPSC GPT',
    'UPSC GPT Prelims',
    'UPSC Prelims',
    'UPSC Prelims PYQ',
    'UPSC Previous Year Questions Topic Wise',
    'UPSC Prelims Solved Papers 2011 to 2026',
    'UPSC CSE 2026',
    'UPSC Prelims Mock Test',
    'UPSC Geography Mapping',
    'Places in News UPSC',
    'UPSC Mains GS Notes',
    'Civil Services Examination'
  ],
  authors: [{ name: 'UPSCGPT' }],
  creator: 'UPSCGPT',
  publisher: 'UPSCGPT Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.upscgpt.in'),
  openGraph: {
    title: 'UPSCGPT (UPSC GPT) | UPSC Prelims PYQ (2011–2026), Geography Atlas & Mains Prep',
    description: 'Practice 2,528+ authentic solved UPSC Prelims Previous Year Questions (2011–2026), 16-year PYQ trend analysis, interactive Geography Atlas, and GS Syllabus Notes.',
    url: 'https://www.upscgpt.in',
    siteName: 'UPSCGPT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSCGPT (UPSC GPT) | UPSC Prelims PYQ (2011–2026), Geography Atlas & Mains Prep',
    description: 'Practice 2,528+ authentic solved UPSC Prelims Previous Year Questions (2011–2026), 16-year PYQ trend analysis, interactive Geography Atlas, and GS Syllabus Notes.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UPSCGPT Prep',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

import AuthProvider from '../components/AuthProvider'
import { NavProvider } from '../context/NavContext'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import GlobalPrelimsGptBot from '../components/GlobalPrelimsGptBot'
import { TranslationProvider } from '../context/TranslationContext'
import { ThemeProvider } from '../components/ThemeProvider'
import { Contentsquare } from './contentsquare'
import { safeJsonLd } from '@/lib/jsonLd';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap" />
      </head>
      <body className="antialiased" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <div className="universal-page-glow" />
        {/* Simplified Background for Performance */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'var(--bg-primary)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.08), transparent 50%), radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.08), transparent 50%)' }} />
        </div>

        {/* Consent-gated Analytics (GA4 & Clarity load only after consent) */}
        <AnalyticsConsent />

        {/* Global SEO Schema (Organization + WebSite SearchAction) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                'name': 'UPSCGPT',
                'alternateName': ['UPSC GPT', 'UPSCGPT.in'],
                'url': 'https://www.upscgpt.in',
                'logo': 'https://www.upscgpt.in/logo.png',
                'description': 'UPSCGPT (UPSC GPT) is a strategic UPSC Civil Services (CSE) preparation platform with 16 years of solved Prelims PYQs (2011–2026), trend analytics, interactive Geography Atlas, and Mains GS notes.',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                'name': 'UPSCGPT',
                'alternateName': ['UPSC GPT', 'UPSCGPT.in'],
                'url': 'https://www.upscgpt.in',
                'potentialAction': {
                  '@type': 'SearchAction',
                  'target': 'https://www.upscgpt.in/?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ])
          }}
        />

        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <TranslationProvider>
            <AuthProvider>
              <NavProvider>
                <Navigation />
                <main className="app-main" style={{ position: 'relative', paddingTop: '72px' }}>
                  {children}
                </main>
                <GlobalPrelimsGptBot />
                <Footer />
              </NavProvider>
            </AuthProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
