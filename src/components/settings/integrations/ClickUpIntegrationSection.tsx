'use client'

import { Cable, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Integration } from './types'

type ClickUpIntegrationSectionProps = {
  integration: Integration | null
  isVisible: boolean
  canManageIntegrations: boolean | null
  onClose: () => void
  onReconnect: () => void
  onTest: () => void
  onDisconnect: () => void
}

export function ClickUpIntegrationSection({
  integration,
  isVisible,
  canManageIntegrations,
  onClose,
  onReconnect,
  onTest,
  onDisconnect,
}: ClickUpIntegrationSectionProps) {
  const settings =
    integration?.settings && typeof integration.settings === 'object'
      ? (integration.settings as Record<string, unknown>)
      : {}
  const workspaceName =
    typeof settings.workspace_name === 'string' && settings.workspace_name.length > 0
      ? settings.workspace_name
      : 'Spazio di lavoro non rilevato'

  const status = integration?.status || 'expired'
  const containerClass = isVisible
    ? 'grid-rows-[1fr] opacity-100 translate-y-0 mt-0 pointer-events-auto'
    : 'grid-rows-[0fr] opacity-0 -translate-y-1 -mt-2 pointer-events-none'

  return (
    <div
      aria-hidden={!isVisible}
      className={`grid overflow-hidden transition-all duration-300 ease-out ${containerClass}`}
    >
      <div className="min-h-0 overflow-hidden pb-2">
        <Card className="border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6 transition-all duration-300 ease-out">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-white/10 bg-indigo-500/10 p-2">
                <Cable className="h-5 w-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Task ClickUp</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Gestisci connessione OAuth, verifica workspace e disconnetti il provider.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={onClose}
            >
              Chiudi
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Stato</p>
              <div className="mt-2 flex items-center gap-2">
                {status === 'active' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                <span className="text-sm text-white capitalize">{status}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Spazio di lavoro</p>
              <p className="mt-2 text-sm text-white">{workspaceName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
              disabled={canManageIntegrations === false}
              onClick={onReconnect}
            >
              Riconnetti
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
              disabled={canManageIntegrations === false}
              onClick={onTest}
            >
              Testa connessione
            </Button>
            <Button
              variant="outline"
              className="border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
              disabled={canManageIntegrations === false}
              onClick={onDisconnect}
            >
              Disconnetti
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
