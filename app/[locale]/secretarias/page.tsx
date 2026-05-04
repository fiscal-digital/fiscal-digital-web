import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// /pt/secretarias/ não tem índice próprio — apenas páginas de detalhe
// /pt/secretarias/[id]/. Acesso direto à raiz redireciona pra /alertas.
export default async function SecretariasIndex({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/alertas/`)
}
