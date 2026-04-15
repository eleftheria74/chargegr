const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for production builds — dev needs a server for rewrites.
  ...(isDev ? {} : { output: 'export' }),
  trailingSlash: true,     // Σημαντικό για Plesk static hosting
  images: {
    unoptimized: true       // Δεν έχουμε Next.js server
  },
  // Dev-only proxy so /api/* hits the production backend while testing the
  // admin dashboard locally. No effect on the static export build.
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'https://chargegr.viralev.gr/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
