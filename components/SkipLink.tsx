import { getTranslations } from 'next-intl/server'

type Props = {
  locale: string
}

/**
 * Skip-link de acessibilidade (WCAG 2.4.1 Bypass Blocks).
 * Visível apenas em :focus — usuário de teclado pula direto para o
 * conteúdo principal sem percorrer toda a navegação.
 *
 * Server component — renderiza string fixa por locale.
 */
export default async function SkipLink({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'a11y' })

  return (
    <a href="#main-content" className="skip-link">
      {t('skipToMain')}
    </a>
  )
}
