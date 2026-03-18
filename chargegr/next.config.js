/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Static HTML export — τρέχει χωρίς Node server
  trailingSlash: true,     // Σημαντικό για Plesk static hosting
  images: {
    unoptimized: true       // Δεν έχουμε Next.js server
  }
};

module.exports = nextConfig;
