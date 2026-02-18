
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint config removed (deprecated in Next.js 16+)
  turbopack: {}, // Added for Next.js 16+ compatibility

  reactStrictMode: true,
  // ✅ Performance Optimizations
  productionBrowserSourceMaps: true, // Enable source maps in production for easier debugging and to fix 404 errors
  compress: true, // Enable gzip compression

  // ✅ Cache optimization
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*', 'lucide-react', 'framer-motion', 'date-fns', 'mathjs', 'lucide-react'],
  },

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  // Headers moved to middleware.ts
  /* 
  async headers() {
    return [];
  },
  */
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
