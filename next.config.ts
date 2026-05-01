import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // Static export para S3 + CloudFront
  // Em produção, CloudFront Function faz redirect / → /pt com base em Accept-Language
  output: 'export',
  trailingSlash: true,
  images: {
    // static export não tem servidor de otimização — pré-otimizar em build ou usar CDN
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
