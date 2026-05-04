import './globals.css'
import Script from 'next/script'

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
  metadataBase: new URL('https://upscatlas.com'), // Replace with your production domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'UPSC Intelligence Platform | UPSCGPT',
    description: 'Master UPSC Current Affairs and Geopolitics through high-performance neural tracking.',
    url: 'https://upscatlas.com',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="google-site-verification" content="ADD_YOUR_VERIFICATION_CODE_HERE" />
      </head>
      <body className="antialiased" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <div className="universal-page-glow" />
        {/* Intensified Universal Neural Glow System */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {/* Top Left Purple Glow */}
          <div className="neural-orb" style={{ top: '-15%', left: '-10%', width: '90vw', height: '90vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)', filter: 'blur(120px)' }} />
          {/* Bottom Right Blue Glow */}
          <div className="neural-orb" style={{ bottom: '-20%', right: '-10%', width: '90vw', height: '90vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, transparent 70%)', filter: 'blur(120px)' }} />
          {/* Center Left Cyan Glow for depth */}
          <div className="neural-orb" style={{ top: '30%', left: '-5%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, transparent 65%)', filter: 'blur(100px)', animationDelay: '-5s' }} />
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
              'url': 'https://upscatlas.com',
              'logo': 'https://upscatlas.com/logo.png',
              'description': 'The definitive strategic intelligence platform for UPSC preparation.',
            })
          }}
        />

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
      </body>
    </html>
  )
}
