import { NextResponse } from 'next/server'

import { verifyApifyWebhookSignature } from '@/lib/trends/ingestionWorker'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-apify-signature')

  if (!verifyApifyWebhookSignature(body, signature, process.env.APIFY_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const payload: unknown = JSON.parse(body)
    if (!payload || typeof payload !== 'object') throw new Error('Invalid webhook payload')

    // The webhook only acknowledges a verified delivery. Dataset retrieval and
    // persistence are deliberately deferred to the polling worker so no third
    // party request can make this public route perform an unbounded job.
    return NextResponse.json({ accepted: true }, { status: 202 })
  } catch {
    return new Response('Invalid webhook payload', { status: 400 })
  }
}
