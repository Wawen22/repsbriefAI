'use client'

import type { LucideIcon } from 'lucide-react'
import { Plus, Send, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { TeamWebhook, WebhookChannel } from './types'

type WebhookChannelSectionProps = {
  channel: WebhookChannel
  title: string
  description: string
  icon: LucideIcon
  webhooks: TeamWebhook[]
  isVisible: boolean
  canManageIntegrations: boolean | null
  onClose: () => void
  onDisconnect?: () => void
  onTest: (id: string, channel: WebhookChannel) => void
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string, channel: WebhookChannel) => void
  newWebhookName: string
  newWebhookUrl: string
  onNameChange: (value: string) => void
  onUrlChange: (value: string) => void
  onAdd: () => void
}

type ChannelStyle = {
  rootClass: string
  iconWrapClass: string
  iconClass: string
  disconnectButtonClass: string
  addButtonClass: string
  testButtonHoverClass: string
  inputUrlLabel: string
  inputUrlPlaceholder: string
  emptyText: string
  defaultName: string
  closeLabel: string
}

const CHANNEL_STYLES: Record<WebhookChannel, ChannelStyle> = {
  generic: {
    rootClass:
      'border-orange-500/20 bg-orange-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500',
    iconWrapClass: 'rounded-xl bg-orange-500/20 p-2 text-orange-400',
    iconClass: 'text-orange-400',
    disconnectButtonClass: '',
    addButtonClass: 'w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl h-10',
    testButtonHoverClass: 'h-8 w-8 text-slate-500 hover:text-blue-400',
    inputUrlLabel: 'URL Endpoint',
    inputUrlPlaceholder: 'https://hooks.zapier.com/...',
    emptyText: 'Nessun webhook custom configurato.',
    defaultName: 'Webhook',
    closeLabel: 'Chiudi',
  },
  slack: {
    rootClass:
      'border-cyan-500/20 bg-cyan-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500',
    iconWrapClass: 'rounded-xl bg-cyan-500/20 p-2 text-cyan-300',
    iconClass: 'text-cyan-300',
    disconnectButtonClass:
      'border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20',
    addButtonClass: 'w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl h-10',
    testButtonHoverClass: 'h-8 w-8 text-slate-500 hover:text-cyan-300',
    inputUrlLabel: 'Slack Incoming Webhook URL',
    inputUrlPlaceholder: 'https://hooks.slack.com/services/...',
    emptyText: 'Nessun canale Slack configurato.',
    defaultName: 'Slack Notifications',
    closeLabel: 'Chiudi',
  },
  discord: {
    rootClass:
      'border-indigo-500/20 bg-indigo-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500',
    iconWrapClass: 'rounded-xl bg-indigo-500/20 p-2 text-indigo-300',
    iconClass: 'text-indigo-300',
    disconnectButtonClass:
      'border-indigo-500/30 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20',
    addButtonClass: 'w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl h-10',
    testButtonHoverClass: 'h-8 w-8 text-slate-500 hover:text-indigo-300',
    inputUrlLabel: 'Discord Incoming Webhook URL',
    inputUrlPlaceholder: 'https://discord.com/api/webhooks/...',
    emptyText: 'Nessun canale Discord configurato.',
    defaultName: 'Discord Notifications',
    closeLabel: 'Chiudi',
  },
}

export function WebhookChannelSection({
  channel,
  title,
  description,
  icon: Icon,
  webhooks,
  isVisible,
  canManageIntegrations,
  onClose,
  onDisconnect,
  onTest,
  onToggle,
  onDelete,
  newWebhookName,
  newWebhookUrl,
  onNameChange,
  onUrlChange,
  onAdd,
}: WebhookChannelSectionProps) {
  if (!isVisible) return null

  const style = CHANNEL_STYLES[channel]

  return (
    <Card className={style.rootClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={style.iconWrapClass}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDisconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              disabled={canManageIntegrations === false}
              className={style.disconnectButtonClass}
            >
              Disconnect
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500">
            {style.closeLabel}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {webhooks.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
            {style.emptyText}
          </div>
        )}

        {webhooks.map((hook) => (
          <div
            key={hook.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{hook.name || style.defaultName}</span>
                <Badge
                  variant="outline"
                  className="text-[8px] font-black uppercase tracking-tighter text-slate-400 border-white/10"
                >
                  {hook.events.length} Eventi
                </Badge>
              </div>
              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">
                {hook.url}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTest(hook.id, channel)}
                title="Invia test"
                className={style.testButtonHoverClass}
                disabled={canManageIntegrations === false}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Switch
                checked={hook.active}
                onCheckedChange={(value) => onToggle(hook.id, value)}
                disabled={canManageIntegrations === false}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(hook.id, channel)}
                className="h-8 w-8 text-slate-500 hover:text-rose-500"
                disabled={canManageIntegrations === false}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7 items-end p-6 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome</label>
          <Input
            placeholder="es: Marketing Team"
            value={newWebhookName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
            disabled={canManageIntegrations === false}
          />
        </div>
        <div className="md:col-span-4 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            {style.inputUrlLabel}
          </label>
          <Input
            placeholder={style.inputUrlPlaceholder}
            value={newWebhookUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
            disabled={canManageIntegrations === false}
          />
        </div>
        <div className="md:col-span-1">
          <Button
            onClick={onAdd}
            className={style.addButtonClass}
            disabled={canManageIntegrations === false}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
