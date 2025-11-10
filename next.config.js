/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'export',
  basePath: '/hablas',
  assetPrefix: '/hablas',
  generateBuildId: async () => {
    // Generate unique build ID with timestamp
    return `hablas-${Date.now()}`
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig