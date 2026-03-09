import { NextResponse } from "next/server"
import { processWebhookDeliveryQueue } from "@/lib/jobs/webhookQueue"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const limitParam = url.searchParams.get("limit")
    const parsedLimit = limitParam ? Number(limitParam) : undefined
    const summary = await processWebhookDeliveryQueue({
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
    })

    return NextResponse.json(summary)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown queue worker error"
    console.error("[QueueWorker] Failed:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
