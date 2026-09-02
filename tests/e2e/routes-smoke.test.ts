describe('api/auth + critical cron routes smoke imports', () => {
  it('loads handlers without runtime import failures', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test-anon-key'

    const routes = await Promise.all([
      import('@/app/api/auth/google/start/route'),
      import('@/app/api/auth/google/callback/route'),
      import('@/app/api/auth/notion/start/route'),
      import('@/app/api/auth/notion/callback/route'),
      import('@/app/api/auth/slack/start/route'),
      import('@/app/api/auth/slack/callback/route'),
      import('@/app/api/auth/discord/start/route'),
      import('@/app/api/auth/discord/callback/route'),
      import('@/app/api/auth/clickup/start/route'),
      import('@/app/api/auth/clickup/callback/route'),
      import('@/app/api/auth/trello/start/route'),
      import('@/app/api/auth/trello/callback/route'),
      import('@/app/api/cron/webhook-queue/route'),
      import('@/app/api/cron/trend-ingestion/route'),
      import('@/app/api/webhooks/apify/route'),
    ])

    for (const route of routes) {
      const hasGet = typeof (route as { GET?: unknown }).GET === 'function'
      const hasPost = typeof (route as { POST?: unknown }).POST === 'function'
      expect(hasGet || hasPost).toBe(true)
    }
  })
})
