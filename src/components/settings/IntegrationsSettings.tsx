'use client'

import { useMemo, useState } from 'react'
import { Link2, MessageCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  connectDiscord,
  connectGoogle,
  connectNotion,
  connectSlack,
} from '@/app/actions/integrations'
import {
  addWebhookAction,
  deleteWebhookAction,
  disconnectChannelAction,
  testWebhookAction,
  toggleWebhookAction,
} from '@/app/actions/webhooks'
import { IntegrationsProvidersGrid } from '@/components/settings/integrations/IntegrationsProvidersGrid'
import { WebhookChannelSection } from '@/components/settings/integrations/WebhookChannelSection'
import {
  DEFAULT_EVENTS,
  normalizeWebhookChannel,
  type WebhookChannel,
} from '@/components/settings/integrations/types'
import { useIntegrationsData } from '@/components/settings/integrations/useIntegrationsData'

export function IntegrationsSettings() {
  const {
    integrations,
    webhooks,
    teamId,
    canManageIntegrations,
    fetchIntegrations,
    fetchWebhooks,
  } = useIntegrationsData()

  const [showWebhooks, setShowWebhooks] = useState(false)
  const [showSlack, setShowSlack] = useState(false)
  const [showDiscord, setShowDiscord] = useState(false)
  const [hideGenericPanel, setHideGenericPanel] = useState(false)
  const [hideSlackPanel, setHideSlackPanel] = useState(false)
  const [hideDiscordPanel, setHideDiscordPanel] = useState(false)

  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newSlackWebhookUrl, setNewSlackWebhookUrl] = useState('')
  const [newSlackWebhookName, setNewSlackWebhookName] = useState('')
  const [newDiscordWebhookUrl, setNewDiscordWebhookUrl] = useState('')
  const [newDiscordWebhookName, setNewDiscordWebhookName] = useState('')

  const genericWebhooks = useMemo(
    () => webhooks.filter((hook) => normalizeWebhookChannel(hook.channel) === 'generic'),
    [webhooks]
  )
  const slackWebhooks = useMemo(
    () => webhooks.filter((hook) => normalizeWebhookChannel(hook.channel) === 'slack'),
    [webhooks]
  )
  const discordWebhooks = useMemo(
    () => webhooks.filter((hook) => normalizeWebhookChannel(hook.channel) === 'discord'),
    [webhooks]
  )

  const activeGenericWebhooksCount = genericWebhooks.filter((webhook) => webhook.active).length
  const activeSlackWebhooksCount = slackWebhooks.filter((webhook) => webhook.active).length
  const activeDiscordWebhooksCount = discordWebhooks.filter((webhook) => webhook.active).length

  const isGenericPanelVisible =
    genericWebhooks.length > 0 ? !hideGenericPanel : showWebhooks
  const isSlackPanelVisible = slackWebhooks.length > 0 ? !hideSlackPanel : showSlack
  const isDiscordPanelVisible =
    discordWebhooks.length > 0 ? !hideDiscordPanel : showDiscord

  const handleConnect = async (providerId: string) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }

    if (providerId === 'notion') {
      await connectNotion()
      return
    }

    if (providerId === 'google_calendar') {
      await connectGoogle()
      return
    }

    if (providerId === 'zapier') {
      if (genericWebhooks.length > 0) {
        setHideGenericPanel(false)
      } else {
        setShowWebhooks((prev) => !prev)
      }
      setShowSlack(false)
      setShowDiscord(false)
      return
    }

    if (providerId === 'slack') {
      if (slackWebhooks.length > 0) {
        setShowWebhooks(false)
        setShowDiscord(false)
        setHideSlackPanel(false)
        return
      }

      await connectSlack()
      setShowWebhooks(false)
      setShowDiscord(false)
      return
    }

    if (providerId === 'discord') {
      if (discordWebhooks.length > 0) {
        setShowWebhooks(false)
        setShowSlack(false)
        setHideDiscordPanel(false)
        return
      }

      await connectDiscord()
      setShowWebhooks(false)
      setShowSlack(false)
      return
    }

    toast.info(`L'integrazione con ${providerId} sara' disponibile a breve.`)
  }

  const handleAddWebhook = async (channel: WebhookChannel) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const mapping =
      channel === 'slack'
        ? {
            url: newSlackWebhookUrl,
            name: newSlackWebhookName || 'Slack Notifications',
            reset: () => {
              setNewSlackWebhookUrl('')
              setNewSlackWebhookName('')
            },
            ok: 'Slack channel connected!',
          }
        : channel === 'discord'
          ? {
              url: newDiscordWebhookUrl,
              name: newDiscordWebhookName || 'Discord Notifications',
              reset: () => {
                setNewDiscordWebhookUrl('')
                setNewDiscordWebhookName('')
              },
              ok: 'Discord channel connected!',
            }
          : {
              url: newWebhookUrl,
              name: newWebhookName || 'Webhook',
              reset: () => {
                setNewWebhookUrl('')
                setNewWebhookName('')
              },
              ok: 'Webhook added!',
            }

    if (!mapping.url) return

    const res = await addWebhookAction(teamId, mapping.url, mapping.name, DEFAULT_EVENTS, channel)
    if (res.success) {
      toast.success(mapping.ok)
      mapping.reset()
      if (channel === 'generic') setHideGenericPanel(false)
      if (channel === 'slack') setHideSlackPanel(false)
      if (channel === 'discord') setHideDiscordPanel(false)
      await fetchWebhooks()
      return
    }

    toast.error(res.error)
  }

  const handleDeleteWebhook = async (id: string, channel: WebhookChannel) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    const res = await deleteWebhookAction(id)
    if (res.success) {
      const label =
        channel === 'slack' ? 'Slack channel' : channel === 'discord' ? 'Discord channel' : 'Webhook'
      toast.success(`${label} deleted`)
      await fetchWebhooks()
    }
  }

  const handleToggleWebhook = async (id: string, active: boolean) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    const res = await toggleWebhookAction(id, active)
    if (res.success) await fetchWebhooks()
  }

  const handleTestWebhook = async (id: string, channel: WebhookChannel) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return
    const tid = toast.loading(
      channel === 'slack'
        ? 'Sending Slack test...'
        : channel === 'discord'
          ? 'Sending Discord test...'
          : 'Sending test payload...'
    )
    const res = await testWebhookAction(teamId, id)

    if (res?.success) {
      toast.success(
        channel === 'slack' ? 'Slack test sent!' : channel === 'discord' ? 'Discord test sent!' : 'Test sent!',
        { id: tid }
      )
      return
    }

    toast.error(res?.error || 'Unable to send test payload', { id: tid })
  }

  const handleDisconnectChannel = async (channel: Exclude<WebhookChannel, 'generic'>) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const label = channel === 'slack' ? 'Slack' : 'Discord'
    const tid = toast.loading(`Disconnecting ${label}...`)
    const res = await disconnectChannelAction(teamId, channel)

    if (res.success) {
      toast.success(`${label} disconnected`, { id: tid })
      if (channel === 'slack') setShowSlack(false)
      if (channel === 'discord') setShowDiscord(false)
      if (channel === 'slack') setHideSlackPanel(false)
      if (channel === 'discord') setHideDiscordPanel(false)
      await fetchIntegrations()
      await fetchWebhooks()
      return
    }

    toast.error(res.error || `Unable to disconnect ${label}`, { id: tid })
  }

  return (
    <div className="space-y-6">
      {canManageIntegrations === false && (
        <Card className="border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          Solo owner/admin del workspace possono collegare o modificare integrazioni.
        </Card>
      )}

      <IntegrationsProvidersGrid
        integrations={integrations}
        genericWebhooks={genericWebhooks}
        slackWebhooks={slackWebhooks}
        discordWebhooks={discordWebhooks}
        activeGenericWebhooksCount={activeGenericWebhooksCount}
        activeSlackWebhooksCount={activeSlackWebhooksCount}
        activeDiscordWebhooksCount={activeDiscordWebhooksCount}
        showWebhooks={isGenericPanelVisible}
        showSlack={isSlackPanelVisible}
        showDiscord={isDiscordPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onConnect={handleConnect}
      />

      <WebhookChannelSection
        channel="slack"
        title="Slack Notifications"
        description="Messaggi preformattati per brief pronti, approvazioni e scheduling."
        icon={MessageSquare}
        webhooks={slackWebhooks}
        isVisible={isSlackPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => {
          if (slackWebhooks.length > 0) {
            setHideSlackPanel(true)
          } else {
            setShowSlack(false)
          }
        }}
        onDisconnect={() => handleDisconnectChannel('slack')}
        onTest={handleTestWebhook}
        onToggle={handleToggleWebhook}
        onDelete={handleDeleteWebhook}
        newWebhookName={newSlackWebhookName}
        newWebhookUrl={newSlackWebhookUrl}
        onNameChange={setNewSlackWebhookName}
        onUrlChange={setNewSlackWebhookUrl}
        onAdd={() => handleAddWebhook('slack')}
      />

      <WebhookChannelSection
        channel="discord"
        title="Discord Notifications"
        description="Messaggi Discord preformattati per brief pronti, approvazioni e scheduling."
        icon={MessageCircle}
        webhooks={discordWebhooks}
        isVisible={isDiscordPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => {
          if (discordWebhooks.length > 0) {
            setHideDiscordPanel(true)
          } else {
            setShowDiscord(false)
          }
        }}
        onDisconnect={() => handleDisconnectChannel('discord')}
        onTest={handleTestWebhook}
        onToggle={handleToggleWebhook}
        onDelete={handleDeleteWebhook}
        newWebhookName={newDiscordWebhookName}
        newWebhookUrl={newDiscordWebhookUrl}
        onNameChange={setNewDiscordWebhookName}
        onUrlChange={setNewDiscordWebhookUrl}
        onAdd={() => handleAddWebhook('discord')}
      />

      <WebhookChannelSection
        channel="generic"
        title="Gestione Webhooks"
        description="Invia eventi a Zapier, Make o ai tuoi server custom."
        icon={Link2}
        webhooks={genericWebhooks}
        isVisible={isGenericPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => {
          if (genericWebhooks.length > 0) {
            setHideGenericPanel(true)
          } else {
            setShowWebhooks(false)
          }
        }}
        onTest={handleTestWebhook}
        onToggle={handleToggleWebhook}
        onDelete={handleDeleteWebhook}
        newWebhookName={newWebhookName}
        newWebhookUrl={newWebhookUrl}
        onNameChange={setNewWebhookName}
        onUrlChange={setNewWebhookUrl}
        onAdd={() => handleAddWebhook('generic')}
      />

      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-purple-500/10 p-2">
            <Link2 className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Richiedi un&apos;integrazione</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Il tuo team usa un tool che non e&apos; ancora in lista? Faccelo sapere e lo aggiungeremo alla roadmap.
        </p>
        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
          Invia suggerimento
        </Button>
      </div>
    </div>
  )
}
