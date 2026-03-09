import { describe, expect, it } from "vitest"

describe("webhook queue helpers", () => {
  async function loadHelpers() {
    process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://example.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "test-anon-key"
    return import("@/lib/jobs/webhookQueue")
  }

  it("calculates exponential retry delay with cap", async () => {
    const { calculateRetryDelayMs } = await loadHelpers()

    expect(calculateRetryDelayMs(1)).toBe(30_000)
    expect(calculateRetryDelayMs(2)).toBe(60_000)
    expect(calculateRetryDelayMs(3)).toBe(120_000)
    expect(calculateRetryDelayMs(10)).toBe(900_000)
  })

  it("evaluates webhook delivery settled results", async () => {
    const { allWebhookDeliveriesSucceeded } = await loadHelpers()

    expect(allWebhookDeliveriesSucceeded([])).toBe(true)
    expect(
      allWebhookDeliveriesSucceeded([
        { status: "fulfilled", value: true },
        { status: "fulfilled", value: true },
      ])
    ).toBe(true)
    expect(
      allWebhookDeliveriesSucceeded([
        { status: "fulfilled", value: true },
        { status: "fulfilled", value: false },
      ])
    ).toBe(false)
    expect(
      allWebhookDeliveriesSucceeded([
        { status: "rejected", reason: new Error("network") },
      ])
    ).toBe(false)
  })
})
