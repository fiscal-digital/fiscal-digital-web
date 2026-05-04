import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // ISR via @opennextjs/aws — output: 'export' removido.
  // Deployment: Lambda Function URL + S3 cache + CloudFront (ver INF-WEB-001).
  // CloudFront Function redirect-pt-br-to-pt: backlinks antigos "/pt-br/*" → "/pt-br/*".
  trailingSlash: true,
  images: {
    // Image optimization Lambda omitida por ora — MVP aceita sem otimização.
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
