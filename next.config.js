/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // ESLint disabled during builds - CI treats warnings as errors
  // TODO: Fix ESLint warnings then re-enable
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
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig