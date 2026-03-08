import { afterEach, describe, expect, it, vi } from 'vitest'
import { getClickUpWorkspaces, readClickUpAccessToken } from '@/lib/integrations/clickup'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('clickup helpers', () => {
  it('reads token from known ClickUp OAuth response variants', () => {
    expect(readClickUpAccessToken({ access_token: 'pk_access' })).toBe('pk_access')
    expect(readClickUpAccessToken({ token: 'pk_token' })).toBe('pk_token')
    expect(readClickUpAccessToken({ oauth_token: 'pk_oauth' })).toBe('pk_oauth')
    expect(readClickUpAccessToken({ access_token: 'Bearer pk_prefixed' })).toBe('pk_prefixed')
    expect(readClickUpAccessToken({})).toBeNull()
  })

  it('loads workspaces with raw authorization token', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ teams: [{ id: 't1', name: 'Workspace One' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const teams = await getClickUpWorkspaces('Bearer pk_test_token')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const firstInit = fetchSpy.mock.calls[0][1] as RequestInit
    const firstHeaders = firstInit.headers as Record<string, string>
    expect(firstHeaders.Authorization).toBe('pk_test_token')
    expect(teams).toHaveLength(1)
  })

  it('falls back to bearer authorization when raw token fails', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ err: 'Oauth token not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ teams: [{ id: 't2', name: 'Workspace Two' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

    const teams = await getClickUpWorkspaces('pk_test_token')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    const secondInit = fetchSpy.mock.calls[1][1] as RequestInit
    const secondHeaders = secondInit.headers as Record<string, string>
    expect(secondHeaders.Authorization).toBe('Bearer pk_test_token')
    expect(teams).toHaveLength(1)
  })
})
