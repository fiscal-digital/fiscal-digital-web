import { redirect } from 'next/navigation'

// Redireciona / → /pt (locale padrão)
// Em produção (S3+CloudFront), CloudFront Function faz esse redirect com
// base no Accept-Language header, evitando round-trip desnecessário.
export default function RootPage() {
  redirect('/pt-br')
}
