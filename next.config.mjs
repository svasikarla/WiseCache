let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config, { isServer }) => {
    // Handle module systems
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        module: false,
      },
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      },
    };

    // Ensure proper exports handling
    config.module = {
      ...config.module,
      exprContextCritical: false,
      rules: [
        ...config.module.rules,
        {
          test: /\.m?js$/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    };

    // Optimize chunk loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: (chunk) => chunk.name !== 'middleware',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: (chunk) => chunk.name !== 'middleware',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        },
        runtimeChunk: {
          name: 'runtime',
        }
      };
    }

    return config;
  },
  // Add output configuration
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true
};

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

mergeConfig(nextConfig, userConfig)

export default nextConfig
