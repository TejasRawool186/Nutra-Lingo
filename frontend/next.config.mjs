import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 Performance Optimizations
  
  // Enable React Compiler for faster renders
  reactCompiler: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Code splitting and bundling
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      // Enable aggressive code splitting
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // React vendor chunk
          react: {
            name: 'chunk-react',
            test: /[\\/]node_modules[\\/](react|react-dom|react-dom-router)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
          // TailwindCSS and styling
          styling: {
            name: 'chunk-styling',
            test: /[\\/]node_modules[\\/](tailwindcss|postcss|autoprefixer)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Charts library (Recharts)
          charts: {
            name: 'chunk-charts',
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Icons library
          icons: {
            name: 'chunk-icons',
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Common chunk for shared dependencies
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    };
    return config;
  },

  // Compression
  compress: true,

  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,

  // SWC minification (faster than Terser)
  swcMinify: true,

  // Enable gzip compression
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
    ],
    // Enable optimized font loading
    optimizeFonts: true,
  },

  // Headers for cache control and security
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [];
  },

  // Rewrites for API proxying
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // 🚀 PWA Caching Optimization
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  sw: 'public/sw.js',
  buildExcludes: ['/api/*'],
  manualStaticFileGlobPatterns: [
    'public/**/*',
    '.next/static/**/*',
  ],
});

export default withPWA(nextConfig);

