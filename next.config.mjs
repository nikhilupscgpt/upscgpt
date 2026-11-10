// Content-Security-Policy — shipped as *Report-Only* first so nothing breaks.
// Violations show up in the browser console; once clean, rename the header key
// to 'Content-Security-Policy' to enforce. Origins below were derived from what
// the app actually loads (src/app/layout.js, contentsquare.jsx, Razorpay checkout
// in pricing/profile, Leaflet/ArcGIS tiles, raw.githubusercontent geojson, etc.).
const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' needed for Next inline bootstrap + GA inline snippet (no nonces);
  // 'unsafe-eval' kept for now (dev React + some 3rd-party tags).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com https://www.googletagmanager.com https://*.google-analytics.com https://*.contentsquare.net https://*.hotjar.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // https: covers ArcGIS/OSM tiles, Unsplash/Wikimedia/CloudFront images, news thumbnails
  "img-src 'self' data: blob: https:",
  // admin recording studio plays back MediaRecorder blobs
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  // https:/wss: covers GA, Contentsquare, Razorpay, raw.githubusercontent geojson, nominatim
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://*.hotjar.com https://*.contentsquare.net",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com https://*.razorpay.com",
];
const cspReportOnly = cspDirectives.join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noIndexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ];

    const securityHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        // camera/microphone: admin recording studio uses getUserMedia (video + audio)
        value: 'camera=(self), microphone=(self), geolocation=(self)',
      },
      {
        key: 'Content-Security-Policy-Report-Only',
        value: cspReportOnly,
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/login/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/admin-login/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/content-portal/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/admin/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/dashboard/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/profile/:path*',
        headers: noIndexHeaders,
      },
      {
        source: '/notes/:path*',
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
