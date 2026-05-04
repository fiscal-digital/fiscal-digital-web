import type { Metadata } from 'next'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { CaretLeft, Buildings, WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { fetchAlerts } from '@/lib/api'
import { findingIdToSlug, findingTypeLabel, formatCurrency, formatDate } from '@/lib/findings'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

/**
 * SSG seed: usa nomes de secretarias presentes em findings publicados.
 *
 * O `id` da rota é o slug do nome da secretaria (lowercased, hífenizado).
 * Quando a Frente F adicionar um schema canônico de secretarias (com sigla
 * estável + nome completo), substituir por id estável.
 */

function secSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function generateStaticParams() {
  const findings = await fetchAlerts({ limit: 200 })
  const secs = Array.from(new Set(
    findings.map((f) => f.secretaria).filter((s): s is string => !!s),
  ))
  return routing.locales.flatMap((locale) =>
    secs.map((s) => ({ locale, id: secSlug(s) })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const isPt = locale === 'pt-br'
  const title = isPt
    ? `Secretaria ${id} — Fiscal Digital`
    : `Department ${id} — Fiscal Digital`
  return { title }
}

export default async function SecretariaPage({ params }: Props) {
  const { locale, id } = await params
  if (!routing.locales.includes(locale as 'pt-br' | 'en-us')) notFound()
  setRequestLocale(locale)

  const isPt = locale === 'pt-br'
  const findings = await fetchAlerts({ limit: 200 })
  const matched = findings.filter((f) => f.secretaria && secSlug(f.secretaria) === id)
  const displayName = matched[0]?.secretaria ?? id

  const t = {
    back: isPt ? 'Voltar' : 'Back',
    title: isPt ? 'Secretaria' : 'Department',
    stubTitle: isPt
      ? 'Painel completo em breve'
      : 'Full dashboard coming soon',
    stubDesc: isPt
      ? 'Painéis com gastos consolidados, fornecedores recorrentes, série temporal de licitações e indicadores de risco por secretaria estão em desenvolvimento. Por enquanto exibimos os alertas detectados.'
      : 'Dashboards with consolidated spending, recurring suppliers, procurement time series and risk indicators per department are in development. For now we list detected alerts.',
    alertsTitle: isPt ? 'Alertas desta secretaria' : 'Alerts from this department',
    empty: isPt ? 'Nenhum alerta encontrado.' : 'No alerts found.',
  }

  return (
    <main className="min-h-dvh bg-brand-paper">
      <section className="bg-brand-teal px-6 py-12 text-brand-paper">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber hover:underline"
          >
            <CaretLeft size={14} weight="bold" />
            {t.back}
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-amber">
            {t.title}
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            <Buildings size={24} weight="bold" className="text-brand-amber" />
            {displayName}
          </h1>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-5">
            <div className="mb-2 flex items-center gap-2">
              <WarningCircle size={18} weight="fill" className="text-brand-amber" />
              <h2 className="font-semibold text-brand-ink">{t.stubTitle}</h2>
            </div>
            <p className="text-sm text-brand-gray">{t.stubDesc}</p>
          </div>

          <h2 className="mt-10 mb-4 text-lg font-bold tracking-tight text-brand-ink">
            {t.alertsTitle}
          </h2>
          {matched.length === 0 ? (
            <div className="rounded-xl border border-brand-gray/15 bg-white px-6 py-10 text-center text-sm text-brand-gray">
              {t.empty}
            </div>
          ) : (
            <ul className="space-y-3">
              {matched.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/${locale}/alertas/${findingIdToSlug(f.id)}`}
                    className="block rounded-xl border border-brand-gray/15 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-brand-ink">
                        {findingTypeLabel(f.type, locale as 'pt-br' | 'en-us')}
                      </span>
                      <span className="text-brand-gray">·</span>
                      <span className="text-brand-gray">{f.city}/{f.state}</span>
                      <span className="ml-auto font-mono text-brand-gray">
                        {formatDate(f.createdAt, locale as 'pt-br' | 'en-us')}
                      </span>
                    </div>
                    {f.value != null && (
                      <p className="font-mono text-sm text-brand-ink">
                        {formatCurrency(f.value, locale as 'pt-br' | 'en-us')}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
