describe('api auth routes smoke imports', () => {
  it('loads oauth start/callback handlers without runtime import failures', async () => {
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
    ])

    for (const route of routes) {
      expect(typeof route.GET).toBe('function')
    }
  })
})
