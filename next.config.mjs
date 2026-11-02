/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const noIndexHeaders = [
      {
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      },
    ];
    return [
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
