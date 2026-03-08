'use client'

import { AlertCircle, Plus, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AVAILABLE_PROVIDERS, Integration, TeamWebhook } from './types'

type IntegrationsProvidersGridProps = {
  integrations: Integration[]
  genericWebhooks: TeamWebhook[]
  slackWebhooks: TeamWebhook[]
  discordWebhooks: TeamWebhook[]
  activeGenericWebhooksCount: number
  activeSlackWebhooksCount: number
  activeDiscordWebhooksCount: number
  showWebhooks: boolean
  showSlack: boolean
  showDiscord: boolean
  canManageIntegrations: boolean | null
  onConnect: (providerId: string) => void
}

export function IntegrationsProvidersGrid({
  integrations,
  genericWebhooks,
  slackWebhooks,
  discordWebhooks,
  activeGenericWebhooksCount,
  activeSlackWebhooksCount,
  activeDiscordWebhooksCount,
  showWebhooks,
  showSlack,
  showDiscord,
  canManageIntegrations,
  onConnect,
}: IntegrationsProvidersGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AVAILABLE_PROVIDERS.map((provider) => {
        const integration = integrations.find((item) => item.provider === provider.id)
        const isWebhookProvider = provider.id === 'zapier'
        const isSlackProvider = provider.id === 'slack'
        const isDiscordProvider = provider.id === 'discord'
        const connected = isWebhookProvider
          ? genericWebhooks.length > 0
          : isSlackProvider
            ? slackWebhooks.length > 0
            : isDiscordProvider
              ? discordWebhooks.length > 0
              : Boolean(integration)

        const lastSyncLabel = isWebhookProvider
          ? connected
            ? `${activeGenericWebhooksCount}/${genericWebhooks.length} webhook attivi`
            : 'Not connected'
          : isSlackProvider
            ? connected
              ? `${activeSlackWebhooksCount}/${slackWebhooks.length} canali Slack attivi`
              : 'Not connected'
            : isDiscordProvider
              ? connected
                ? `${activeDiscordWebhooksCount}/${discordWebhooks.length} canali Discord attivi`
                : 'Not connected'
              : integration
                ? `Ultimo sync: ${new Date(integration.updated_at).toLocaleDateString()}`
                : 'Not connected'
        const Icon = provider.icon

        return (
          <Card
            key={provider.id}
            className="relative overflow-hidden border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-3 ${provider.bg} border border-white/10`}>
                  <Icon className={`h-6 w-6 ${provider.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{provider.name}</h3>
                    {connected && !isWebhookProvider && !isSlackProvider && !isDiscordProvider && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                        Connected
                      </Badge>
                    )}
                    {connected && isWebhookProvider && (
                      <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30">
                        {genericWebhooks.length} webhook{genericWebhooks.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {connected && isSlackProvider && (
                      <Badge className="bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30">
                        {slackWebhooks.length} canale{slackWebhooks.length > 1 ? 'i' : ''}
                      </Badge>
                    )}
                    {connected && isDiscordProvider && (
                      <Badge className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30">
                        {discordWebhooks.length} canale{discordWebhooks.length > 1 ? 'i' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{provider.description}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {lastSyncLabel}
                </span>
              </div>

              <Button
                variant={connected ? 'outline' : 'default'}
                size="sm"
                onClick={() => onConnect(provider.id)}
                disabled={canManageIntegrations === false}
                className={
                  connected
                    ? 'border-white/10 bg-white/5 hover:bg-white/10'
                    : 'bg-white text-black hover:bg-slate-200'
                }
              >
                {connected ? (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    {isWebhookProvider && !showWebhooks
                      ? 'View'
                      : isSlackProvider && !showSlack
                        ? 'View'
                        : isDiscordProvider && !showDiscord
                          ? 'View'
                          : 'Manage'}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>

            {integration?.status === 'error' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Errore di autenticazione. Riconnetti l&apos;account.</span>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
