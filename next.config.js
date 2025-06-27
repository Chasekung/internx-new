/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve handling of paths with spaces
  experimental: {
    // Disable some experimental features that might cause issues with spaces in paths
    esmExternals: false,
  },
  // Configure allowed image domains
  images: {
    domains: ['bhoudamowgpsbwwmmuay.supabase.co'],
  },
  // Ensure proper encoding of file paths
  webpack: (config, { isServer }) => {
    // Handle paths with spaces better
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
