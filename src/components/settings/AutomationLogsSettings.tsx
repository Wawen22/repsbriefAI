'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCcw, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type IntegrationLog = {
  id: string
  provider: string | null
  action: string | null
  status: string | null
  event_type: string
  details: Record<string, unknown> | null
  created_at: string
}

function providerLabel(provider: string | null): string {
  if (!provider) return 'Unknown'
  if (provider === 'google_calendar') return 'Google Calendar'
  if (provider === 'slack') return 'Slack'
  if (provider === 'discord') return 'Discord'
  if (provider === 'clickup') return 'ClickUp'
  if (provider === 'trello') return 'Trello'
  if (provider === 'webhook') return 'Webhook'
  return provider
}

function statusClass(status: string | null): string {
  if (status === 'error') return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}

export function AutomationLogsSettings() {
  const supabase = useMemo(() => createClient(), [])
  const [logs, setLogs] = useState<IntegrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        setLogs([])
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_team_id')
        .eq('id', auth.user.id)
        .single()

      if (!profile?.current_team_id) {
        setLogs([])
        return
      }

      const { data, error } = await supabase
        .from('team_integration_logs')
        .select('id, provider, action, status, event_type, details, created_at')
        .eq('team_id', profile.current_team_id)
        .order('created_at', { ascending: false })
        .limit(150)

      if (error) throw error
      setLogs((data ?? []) as IntegrationLog[])
    } catch (error) {
      console.error('Failed to load automation logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const providerOptions = useMemo(() => {
    const values = new Set<string>()
    logs.forEach((log) => {
      if (log.provider) values.add(log.provider)
    })
    return ['all', ...Array.from(values)]
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const byProvider = filterProvider === 'all' || (log.provider ?? 'unknown') === filterProvider
      const byStatus = filterStatus === 'all' || (log.status ?? 'success') === filterStatus
      return byProvider && byStatus
    })
  }, [logs, filterProvider, filterStatus])

  const successCount = logs.filter((log) => (log.status ?? 'success') !== 'error').length
  const errorCount = logs.filter((log) => log.status === 'error').length

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Events</p>
          <p className="mt-2 text-2xl font-bold text-white">{logs.length}</p>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Success</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{successCount}</p>
        </Card>
        <Card className="border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Errors</p>
          <p className="mt-2 text-2xl font-bold text-rose-300">{errorCount}</p>
        </Card>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-blue-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Automation Logs</h3>
              <p className="text-xs text-slate-500">Storico esecuzioni integrazioni e webhook.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {providerOptions.map((provider) => (
            <button
              key={provider}
              onClick={() => setFilterProvider(provider)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filterProvider === provider
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-slate-500 hover:text-white'
              }`}
            >
              {provider === 'all' ? 'All Providers' : providerLabel(provider)}
            </button>
          ))}
          {['all', 'success', 'error'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                filterStatus === status
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-slate-500 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
              Loading logs...
            </div>
          )}

          {!loading && filteredLogs.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
              Nessun evento trovato con i filtri attuali.
            </div>
          )}

          {!loading &&
            filteredLogs.map((log) => {
              const action = log.action || log.event_type || 'event'
              const isError = (log.status ?? 'success') === 'error'

              return (
                <div key={log.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusClass(log.status)}>
                        {isError ? (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {(log.status ?? 'success').toUpperCase()}
                      </Badge>
                      <span className="text-xs font-semibold text-white">{providerLabel(log.provider)}</span>
                      <span className="text-xs text-slate-400">{action}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock3 className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>

                  {log.details && (
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-[11px] text-slate-300">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
