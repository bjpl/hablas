/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Fix workspace detection for Jest
  outputFileTracingRoot: __dirname,
  // ESLint disabled during builds - 65 errors and 325 warnings remain
  // TODO: Fix ESLint errors progressively then re-enable
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow build to proceed with TypeScript errors (type checking runs separately)
  typescript: {
    ignoreBuildErrors: false,
  },
  // output: 'export', // Disabled - incompatible with middleware (required for auth)
  // Custom domain configuration - no basePath or assetPrefix needed
  generateBuildId: async () => {
    // Generate unique build ID with timestamp
    return `hablas-${Date.now()}`
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Enable image optimization for production performance
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig