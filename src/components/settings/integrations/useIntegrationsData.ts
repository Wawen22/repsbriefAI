'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Integration, TeamRole, TeamWebhook } from './types'

type TeamContext = {
  teamId: string
  canManage: boolean
}

export function useIntegrationsData() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<TeamWebhook[]>([])
  const [teamId, setTeamId] = useState<string | null>(null)
  const [canManageIntegrations, setCanManageIntegrations] = useState<boolean | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const resolveTeamContext = useCallback(async (): Promise<TeamContext | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_team_id')
      .eq('id', user.id)
      .single()

    if (!profile?.current_team_id) return null
    setTeamId(profile.current_team_id)

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', profile.current_team_id)
      .eq('user_id', user.id)
      .maybeSingle()

    const role = membership?.role as TeamRole | undefined
    const canManage = role === 'owner' || role === 'admin'
    setCanManageIntegrations(canManage)

    return { teamId: profile.current_team_id, canManage }
  }, [supabase])

  const fetchIntegrations = useCallback(async () => {
    try {
      const context = await resolveTeamContext()
      if (!context) return
      if (!context.canManage) {
        setIntegrations([])
        return
      }

      const { data, error } = await supabase
        .from('team_integrations')
        .select('id, provider, status, settings, updated_at')
        .eq('team_id', context.teamId)

      if (error) throw error
      setIntegrations((data || []) as Integration[])
    } catch (error) {
      console.error('Error fetching integrations:', error)
      setIntegrations([])
    }
  }, [resolveTeamContext, supabase])

  const fetchWebhooks = useCallback(async () => {
    try {
      const context = await resolveTeamContext()
      if (!context) return
      if (!context.canManage) {
        setWebhooks([])
        return
      }

      const { data, error } = await supabase
        .from('team_webhooks')
        .select('id, name, url, events, active, channel, updated_at')
        .eq('team_id', context.teamId)

      if (error) throw error
      setWebhooks((data || []) as TeamWebhook[])
    } catch (error) {
      console.error('Error fetching webhooks:', error)
      setWebhooks([])
    }
  }, [resolveTeamContext, supabase])

  useEffect(() => {
    fetchIntegrations()
    fetchWebhooks()
  }, [fetchIntegrations, fetchWebhooks])

  return {
    integrations,
    webhooks,
    teamId,
    canManageIntegrations,
    fetchIntegrations,
    fetchWebhooks,
  }
}
