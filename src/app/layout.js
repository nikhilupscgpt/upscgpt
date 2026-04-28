import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: {
    default: 'STARA Intelligence | Strategic Command Hub',
    template: '%s | STARA Intelligence'
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
    title: 'STARA Intelligence | Strategic Command Hub',
    description: 'Master UPSC Current Affairs and Geopolitics through high-performance neural tracking.',
    url: 'https://upscatlas.com',
    siteName: 'STARA Intelligence',
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
    title: 'Global Strategic Atlas | UPSC Intelligence Hub',
    description: 'Master UPSC Current Affairs and Geography through a high-performance strategic graph.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UPSC Atlas',
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
      </head>
      <body className="antialiased">
        <div className="universal-page-glow" />
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

        <TranslationProvider>
          <AuthProvider>
            <NavProvider>
              <Navigation />
              {children}
            </NavProvider>
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
