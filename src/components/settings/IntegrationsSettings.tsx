'use client'

import { useMemo, useState } from 'react'
import { Link2, MessageCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  connectClickUp,
  connectDiscord,
  connectGoogle,
  connectNotion,
  connectSlack,
  connectTrello,
} from '@/app/actions/integrations'
import {
  disconnectClickUpIntegrationAction,
  testClickUpIntegrationAction,
} from '@/app/actions/clickup'
import {
  disconnectTrelloIntegrationAction,
  testTrelloIntegrationAction,
} from '@/app/actions/trello'
import {
  addWebhookAction,
  deleteWebhookAction,
  disconnectChannelAction,
  testWebhookAction,
  toggleWebhookAction,
} from '@/app/actions/webhooks'
import { ClickUpIntegrationSection } from '@/components/settings/integrations/ClickUpIntegrationSection'
import { TrelloIntegrationSection } from '@/components/settings/integrations/TrelloIntegrationSection'
import { IntegrationsProvidersGrid } from '@/components/settings/integrations/IntegrationsProvidersGrid'
import { WebhookChannelSection } from '@/components/settings/integrations/WebhookChannelSection'
import {
  DEFAULT_EVENTS,
  type Integration,
  type IntegrationPanelId,
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

  const [activePanel, setActivePanel] = useState<IntegrationPanelId | null>(null)

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
  const clickUpIntegration =
    (integrations.find((integration) => integration.provider === 'clickup') as Integration | undefined) || null
  const trelloIntegration =
    (integrations.find((integration) => integration.provider === 'trello') as Integration | undefined) || null

  const isGenericPanelVisible = activePanel === 'zapier'
  const isSlackPanelVisible = activePanel === 'slack'
  const isDiscordPanelVisible = activePanel === 'discord'
  const isClickUpPanelVisible = activePanel === 'clickup'
  const isTrelloPanelVisible = activePanel === 'trello'

  const togglePanel = (panelId: IntegrationPanelId) => {
    setActivePanel((prev) => (prev === panelId ? null : panelId))
  }

  const handleConnect = async (providerId: string) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }

    if (providerId === 'notion') {
      setActivePanel(null)
      await connectNotion()
      return
    }

    if (providerId === 'google_calendar') {
      setActivePanel(null)
      await connectGoogle()
      return
    }

    if (providerId === 'zapier') {
      togglePanel('zapier')
      return
    }

    if (providerId === 'slack') {
      if (slackWebhooks.length > 0) {
        togglePanel('slack')
        return
      }

      setActivePanel(null)
      await connectSlack()
      return
    }

    if (providerId === 'discord') {
      if (discordWebhooks.length > 0) {
        togglePanel('discord')
        return
      }

      setActivePanel(null)
      await connectDiscord()
      return
    }

    if (providerId === 'clickup') {
      if (clickUpIntegration) {
        togglePanel('clickup')
        return
      }

      setActivePanel(null)
      await connectClickUp()
      return
    }

    if (providerId === 'trello') {
      if (trelloIntegration) {
        togglePanel('trello')
        return
      }

      setActivePanel(null)
      await connectTrello()
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
            name: newSlackWebhookName || 'Notifiche Slack',
            reset: () => {
              setNewSlackWebhookUrl('')
              setNewSlackWebhookName('')
            },
            ok: 'Canale Slack collegato.',
          }
        : channel === 'discord'
          ? {
              url: newDiscordWebhookUrl,
              name: newDiscordWebhookName || 'Notifiche Discord',
              reset: () => {
                setNewDiscordWebhookUrl('')
                setNewDiscordWebhookName('')
              },
              ok: 'Canale Discord collegato.',
            }
          : {
              url: newWebhookUrl,
              name: newWebhookName || 'Webhook',
              reset: () => {
                setNewWebhookUrl('')
                setNewWebhookName('')
              },
              ok: 'Webhook aggiunto.',
            }

    if (!mapping.url) return

    const res = await addWebhookAction(teamId, mapping.url, mapping.name, DEFAULT_EVENTS, channel)
    if (res.success) {
      toast.success(mapping.ok)
      mapping.reset()
      setActivePanel(channel === 'generic' ? 'zapier' : channel)
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
        channel === 'slack' ? 'Canale Slack' : channel === 'discord' ? 'Canale Discord' : 'Webhook'
      toast.success(`${label} eliminato`)
      if (activePanel === 'zapier' && channel === 'generic' && genericWebhooks.length <= 1) {
        setActivePanel(null)
      }
      if (activePanel === 'slack' && channel === 'slack' && slackWebhooks.length <= 1) {
        setActivePanel(null)
      }
      if (activePanel === 'discord' && channel === 'discord' && discordWebhooks.length <= 1) {
        setActivePanel(null)
      }
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
        ? 'Invio test Slack...'
        : channel === 'discord'
          ? 'Invio test Discord...'
          : 'Invio payload di test...'
    )
    const res = await testWebhookAction(teamId, id)

    if (res?.success) {
      toast.success(
        channel === 'slack'
          ? 'Test Slack inviato.'
          : channel === 'discord'
            ? 'Test Discord inviato.'
            : 'Test inviato.',
        { id: tid }
      )
      return
    }

    toast.error(res?.error || 'Impossibile inviare il payload di test', { id: tid })
  }

  const handleDisconnectChannel = async (channel: Exclude<WebhookChannel, 'generic'>) => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const label = channel === 'slack' ? 'Slack' : 'Discord'
    const tid = toast.loading(`Disconnessione ${label}...`)
    const res = await disconnectChannelAction(teamId, channel)

    if (res.success) {
      toast.success(`${label} disconnesso`, { id: tid })
      if (activePanel === channel) {
        setActivePanel(null)
      }
      await fetchIntegrations()
      await fetchWebhooks()
      return
    }

    toast.error(res.error || `Impossibile disconnettere ${label}`, { id: tid })
  }

  const handleTestClickUp = async () => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const tid = toast.loading('Test connessione ClickUp...')
    const res = await testClickUpIntegrationAction(teamId)
    if (res.success) {
      toast.success(`ClickUp OK (${res.workspaceCount || 0} spazi di lavoro)`, { id: tid })
      await fetchIntegrations()
      return
    }

    toast.error(res.error || 'Test ClickUp fallito', { id: tid })
  }

  const handleDisconnectClickUp = async () => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const tid = toast.loading('Disconnessione ClickUp...')
    const res = await disconnectClickUpIntegrationAction(teamId)
    if (res.success) {
      toast.success('ClickUp disconnesso', { id: tid })
      if (activePanel === 'clickup') {
        setActivePanel(null)
      }
      await fetchIntegrations()
      return
    }

    toast.error(res.error || 'Impossibile disconnettere ClickUp', { id: tid })
  }

  const handleTestTrello = async () => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const tid = toast.loading('Test connessione Trello...')
    const res = await testTrelloIntegrationAction(teamId)
    if (res.success) {
      toast.success(`Trello OK (${res.workspaceCount || 0} spazi di lavoro)`, { id: tid })
      await fetchIntegrations()
      return
    }

    toast.error(res.error || 'Test Trello fallito', { id: tid })
  }

  const handleDisconnectTrello = async () => {
    if (canManageIntegrations === false) {
      toast.error('Solo owner/admin possono gestire integrazioni.')
      return
    }
    if (!teamId) return

    const tid = toast.loading('Disconnessione Trello...')
    const res = await disconnectTrelloIntegrationAction(teamId)
    if (res.success) {
      toast.success('Trello disconnesso', { id: tid })
      if (activePanel === 'trello') {
        setActivePanel(null)
      }
      await fetchIntegrations()
      return
    }

    toast.error(res.error || 'Impossibile disconnettere Trello', { id: tid })
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
        activePanel={activePanel}
        canManageIntegrations={canManageIntegrations}
        onConnect={handleConnect}
      />

      <ClickUpIntegrationSection
        integration={clickUpIntegration}
        isVisible={isClickUpPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => setActivePanel(null)}
        onReconnect={connectClickUp}
        onTest={handleTestClickUp}
        onDisconnect={handleDisconnectClickUp}
      />

      <TrelloIntegrationSection
        integration={trelloIntegration}
        isVisible={isTrelloPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => setActivePanel(null)}
        onReconnect={connectTrello}
        onTest={handleTestTrello}
        onDisconnect={handleDisconnectTrello}
      />

      <WebhookChannelSection
        channel="slack"
        title="Notifiche Slack"
        description="Messaggi preformattati per brief pronti, approvazioni e pianificazione."
        icon={MessageSquare}
        webhooks={slackWebhooks}
        isVisible={isSlackPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => setActivePanel(null)}
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
        title="Notifiche Discord"
        description="Messaggi Discord preformattati per brief pronti, approvazioni e pianificazione."
        icon={MessageCircle}
        webhooks={discordWebhooks}
        isVisible={isDiscordPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => setActivePanel(null)}
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
        title="Gestione webhook"
        description="Invia eventi a Zapier, Make o ai tuoi server custom."
        icon={Link2}
        webhooks={genericWebhooks}
        isVisible={isGenericPanelVisible}
        canManageIntegrations={canManageIntegrations}
        onClose={() => setActivePanel(null)}
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
