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
        value: 'camera=(), microphone=(), geolocation=(self)',
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
