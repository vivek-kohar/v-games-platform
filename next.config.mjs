/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { dev, isServer }) => {
    // Disable CSS optimization in production builds
    if (!dev && !isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig; 