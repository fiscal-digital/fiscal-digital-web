/**
 * ISR-WEB-002: route handler para revalidação on-demand.
 *
 * Chamado pelo publisher (`packages/publisher/src/index.ts`) após cada
 * ingestão de finding novo. Reduz lag de 60s (revalidate ISR) para ≤5s.
 *
 * Contrato:
 *
 *   POST /api/revalidate
 *   Authorization: Bearer <WEB_REVALIDATE_SECRET>
 *   Content-Type: application/json
 *   { "tags": ["findings", "city:4305108"], "paths": ["/pt/alertas"] }
 *
 *   200 OK    → { "revalidated": [...], "count": N }
 *   400       → { "error": "invalid_body" }
 *   401       → { "error": "unauthorized" }
 *   503       → { "error": "revalidate_not_configured" }
 *
 * Token via Secrets Manager AWS (`fiscal-digital-revalidate-token-prod`),
 * lido pela Lambda ISR como env var `WEB_REVALIDATE_SECRET`.
 *
 * Falha silenciosa do lado do publisher: revalidação é best-effort, não
 * bloqueia publish. Se este endpoint estiver fora, ISR continua atualizando
 * em até 60s pelo revalidate normal.
 */

import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RevalidateBody {
  tags?: unknown
  paths?: unknown
}

export async function POST(req: NextRequest) {
  const secret = process.env.WEB_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'revalidate_not_configured' },
      { status: 503 },
    )
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: RevalidateBody
  try {
    body = (await req.json()) as RevalidateBody
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string') : []
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : []

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { error: 'tags_or_paths_required' },
      { status: 400 },
    )
  }

  // Next 16: revalidateTag(tag, profile) — { expire: 0 } purga imediato.
  const revalidated: string[] = []
  for (const tag of tags) {
    revalidateTag(tag as string, { expire: 0 })
    revalidated.push(`tag:${tag}`)
  }
  for (const path of paths) {
    revalidatePath(path as string)
    revalidated.push(`path:${path}`)
  }

  return NextResponse.json({ revalidated, count: revalidated.length })
}
