import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  // Ignorar errores del linter durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
