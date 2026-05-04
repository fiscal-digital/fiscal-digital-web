import { redirect } from 'next/navigation'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// /pt-br/fornecedores/ não tem índice próprio — apenas páginas de detalhe
// /pt-br/fornecedores/[cnpj]/. Acesso direto à raiz redireciona pra /alertas.
export default async function FornecedoresIndex({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/alertas/`)
}
