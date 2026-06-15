import './globals.css'
import Script from 'next/script'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const metadata = {
  title: {
    default: 'UPSC Intelligence Platform | UPSCGPT',
    template: '%s | UPSCGPT'
  },
  description: 'The definitive strategic intelligence platform for UPSC preparation. 500+ syllabus nodes, real-time geopolitical tracking, and neural-enhanced current affairs.',
  keywords: ['UPSC', 'IAS', 'Geography', 'Current Affairs', 'Strategic Atlas', 'Issue Graph', 'Geopolitics', 'Civil Services Examination'],
  authors: [{ name: 'Antigravity AI' }],
  creator: 'Antigravity AI',
  publisher: 'UPSC Atlas Portal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.upscgpt.in'), // Replace with your production domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'UPSC Intelligence Platform | UPSCGPT',
    description: 'Master UPSC Current Affairs and Geopolitics through high-performance neural tracking.',
    url: 'https://www.upscgpt.in',
    siteName: 'UPSCGPT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSC Intelligence Platform | UPSCGPT',
    description: 'Master UPSC Current Affairs and Geography through a high-performance strategic graph.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UPSC Intelligence Platform',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

import AuthProvider from '../components/AuthProvider'
import { NavProvider } from '../context/NavContext'
import Navigation from '../components/Navigation'
import { TranslationProvider } from '../context/TranslationContext'
import { ThemeProvider } from '../components/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="google-site-verification" content="ADD_YOUR_VERIFICATION_CODE_HERE" />
      </head>
      <body className={`${outfit.variable} antialiased`} style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: 'var(--font-outfit), sans-serif' }}>
        <div className="universal-page-glow" />
        {/* Simplified Background for Performance */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'var(--bg-primary)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.08), transparent 50%), radial-gradient(circle at 90% 90%, rgba(59, 130, 246, 0.08), transparent 50%)' }} />
        </div>

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-XV8ZY1XKLC`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XV8ZY1XKLC');
          `}
        </Script>

        {/* Global SEO Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'name': 'UPSCGPT',
              'url': 'https://www.upscgpt.in',
              'logo': 'https://www.upscgpt.in/logo.png',
              'description': 'The definitive strategic intelligence platform for UPSC preparation.',
            })
          }}
        />

        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <TranslationProvider>
            <AuthProvider>
              <NavProvider>
                <Navigation />
                <main style={{ position: 'relative', zIndex: 10 }}>
                  {children}
                </main>
              </NavProvider>
            </AuthProvider>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
