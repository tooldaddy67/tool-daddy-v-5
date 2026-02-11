
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint config removed (deprecated in Next.js 16+)
  turbopack: {}, // Added for Next.js 16+ compatibility

  // ✅ Performance Optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression

  // ✅ Cache optimization
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is*.mzstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },

          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none', // Changed from credentialless to fix YouTube embed issues
          },
        ],
      },
    ];
  },
  // Custom webpack config commented out for Turbopack compatibility
  // webpack: (config, { isServer }) => {
  //   config.resolve.fallback = { fs: false, path: false, crypto: false };
  //   config.module.rules.push({
  //     test: /\.wasm$/,
  //     type: 'asset/resource',
  //   });
  //   if (!isServer) {
  //      config.output.publicPath = '/_next/';
  //   }
  //   return config;
  // },
};

export default nextConfig;
