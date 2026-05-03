import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // ISR via @opennextjs/aws — output: 'export' removido.
  // Deployment: Lambda Function URL + S3 cache + CloudFront (ver INF-WEB-001).
  // CloudFront Function redirect-pt-to-pt-br mantida no edge (Frente 2 do INF-WEB-001).
  trailingSlash: true,
  images: {
    // Image optimization Lambda omitida por ora — MVP aceita sem otimização.
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
