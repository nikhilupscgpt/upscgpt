import './globals.css'

export const metadata = {
  title: 'Global Strategic Atlas',
  description: 'UPSC Pedagogy Web Portal',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <AuthProvider>
          <NavProvider>
            <Navigation />
            {children}
          </NavProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
