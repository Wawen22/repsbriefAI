// src/components/settings/IntegrationsSettings.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Calendar,
  Globe,
  Layout,
  Link2,
  Plus,
  AlertCircle,
  Settings,
  Trash2,
  Send,
  MessageSquare,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { connectNotion, connectGoogle, connectSlack, connectDiscord } from "@/app/actions/integrations"
import { addWebhookAction, deleteWebhookAction, toggleWebhookAction, testWebhookAction, disconnectChannelAction } from "@/app/actions/webhooks"

interface Integration {
  id: string
  provider: string
  status: 'active' | 'error' | 'expired'
  settings: Record<string, unknown> | null
  updated_at: string
}

interface TeamWebhook {
  id: string
  name: string | null
  url: string
  events: string[]
  active: boolean
  channel: string | null
  updated_at: string
}

type WebhookChannel = 'generic' | 'slack' | 'discord'
type TeamRole = 'owner' | 'admin' | 'member'

const DEFAULT_EVENTS = ['idea.approved', 'brief.ready', 'content.scheduled']

const AVAILABLE_PROVIDERS = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Esporta le tue strategie direttamente in un database o pagina Notion.',
    icon: Layout,
    color: 'text-white',
    bg: 'bg-black',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincronizza il tuo calendario editoriale con GCal.',
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    description: 'Invia notifiche Slack preformattate per brief, approvazioni e contenuti schedulati.',
    icon: MessageSquare,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'discord',
    name: 'Discord Notifications',
    description: 'Invia notifiche Discord preformattate per brief, approvazioni e contenuti schedulati.',
    icon: MessageCircle,
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 'zapier',
    name: 'Zapier / Webhooks',
    description: 'Collega RepsBrief a oltre 5000+ app tramite Webhooks.',
    icon: Globe,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
]

function normalizeWebhookChannel(channel: string | null | undefined): WebhookChannel {
  if (channel === 'slack') return 'slack'
  if (channel === 'discord') return 'discord'
  return 'generic'
}

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<TeamWebhook[]>([])
  const [showWebhooks, setShowWebhooks] = useState(false)
  const [showSlack, setShowSlack] = useState(false)
  const [showDiscord, setShowDiscord] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [newWebhookName, setNewWebhookName] = useState("")
  const [newSlackWebhookUrl, setNewSlackWebhookUrl] = useState("")
  const [newSlackWebhookName, setNewSlackWebhookName] = useState("")
  const [newDiscordWebhookUrl, setNewDiscordWebhookUrl] = useState("")
  const [newDiscordWebhookName, setNewDiscordWebhookName] = useState("")
  const [teamId, setTeamId] = useState<string | null>(null)
  const [canManageIntegrations, setCanManageIntegrations] = useState<boolean | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const resolveTeamContext = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
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
      setIntegrations(data || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
    }
  }, [resolveTeamContext, supabase])

  const fetchWebhooks = useCallback(async () => {
    try {
      const context = await resolveTeamContext()
      if (!context) return
      if (!context.canManage) {
        setWebhooks([])
        setShowWebhooks(false)
        setShowSlack(false)
        setShowDiscord(false)
        return
      }

      const { data } = await supabase
        .from('team_webhooks')
        .select('id, name, url, events, active, channel, updated_at')
        .eq('team_id', context.teamId)

      const hooks = (data || []) as TeamWebhook[]
      const hasGeneric = hooks.some((hook) => normalizeWebhookChannel(hook.channel) === 'generic')
      const hasSlack = hooks.some((hook) => normalizeWebhookChannel(hook.channel) === 'slack')
      const hasDiscord = hooks.some((hook) => normalizeWebhookChannel(hook.channel) === 'discord')

      setWebhooks(hooks)
      setShowWebhooks(hasGeneric)
      setShowSlack(hasSlack)
      setShowDiscord(hasDiscord)
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    }
  }, [resolveTeamContext, supabase])

  useEffect(() => {
    fetchIntegrations()
    fetchWebhooks()
  }, [fetchIntegrations, fetchWebhooks])

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

  const handleConnect = async (providerId: string) => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
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
        setShowWebhooks(true)
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
        setShowSlack(true)
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
        setShowDiscord(true)
        return
      }

      await connectDiscord()
      setShowWebhooks(false)
      setShowSlack(false)
      return
    }

    toast.info(`L'integrazione con ${providerId} sara' disponibile a breve.`)
  }

  const handleAddWebhook = async () => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    if (!teamId || !newWebhookUrl) return

    const res = await addWebhookAction(
      teamId,
      newWebhookUrl,
      newWebhookName || "Webhook",
      DEFAULT_EVENTS,
      "generic"
    )

    if (res.success) {
      toast.success("Webhook added!")
      setNewWebhookUrl("")
      setNewWebhookName("")
      fetchWebhooks()
      return
    }

    toast.error(res.error)
  }

  const handleAddSlackWebhook = async () => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    if (!teamId || !newSlackWebhookUrl) return

    const res = await addWebhookAction(
      teamId,
      newSlackWebhookUrl,
      newSlackWebhookName || "Slack Notifications",
      DEFAULT_EVENTS,
      "slack"
    )

    if (res.success) {
      toast.success("Slack channel connected!")
      setNewSlackWebhookUrl("")
      setNewSlackWebhookName("")
      fetchWebhooks()
      return
    }

    toast.error(res.error)
  }

  const handleAddDiscordWebhook = async () => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    if (!teamId || !newDiscordWebhookUrl) return

    const res = await addWebhookAction(
      teamId,
      newDiscordWebhookUrl,
      newDiscordWebhookName || "Discord Notifications",
      DEFAULT_EVENTS,
      "discord"
    )

    if (res.success) {
      toast.success("Discord channel connected!")
      setNewDiscordWebhookUrl("")
      setNewDiscordWebhookName("")
      fetchWebhooks()
      return
    }

    toast.error(res.error)
  }

  const handleDeleteWebhook = async (id: string, channel: WebhookChannel) => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    const res = await deleteWebhookAction(id)
    if (res.success) {
      const label = channel === 'slack' ? 'Slack channel' : channel === 'discord' ? 'Discord channel' : 'Webhook'
      toast.success(`${label} deleted`)
      fetchWebhooks()
    }
  }

  const handleToggleWebhook = async (id: string, active: boolean) => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    const res = await toggleWebhookAction(id, active)
    if (res.success) fetchWebhooks()
  }

  const handleTestWebhook = async (id: string, channel: WebhookChannel) => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
      return
    }
    if (!teamId) return
    const tid = toast.loading(
      channel === 'slack' ? "Sending Slack test..." : channel === 'discord' ? "Sending Discord test..." : "Sending test payload..."
    )
    const res = await testWebhookAction(teamId, id)

    if (res?.success) {
      toast.success(
        channel === 'slack' ? "Slack test sent!" : channel === 'discord' ? "Discord test sent!" : "Test sent!",
        { id: tid }
      )
      return
    }

    toast.error(res?.error || "Unable to send test payload", { id: tid })
  }

  const handleDisconnectChannel = async (channel: Exclude<WebhookChannel, 'generic'>) => {
    if (canManageIntegrations === false) {
      toast.error("Solo owner/admin possono gestire integrazioni.")
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
      fetchIntegrations()
      fetchWebhooks()
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

      <div className="grid gap-4 md:grid-cols-2">
        {AVAILABLE_PROVIDERS.map((provider) => {
          const integration = integrations.find((item) => item.provider === provider.id)
          const isWebhookProvider = provider.id === "zapier"
          const isSlackProvider = provider.id === "slack"
          const isDiscordProvider = provider.id === "discord"
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
              : "Not connected"
            : isSlackProvider
              ? connected
                ? `${activeSlackWebhooksCount}/${slackWebhooks.length} canali Slack attivi`
                : "Not connected"
              : isDiscordProvider
                ? connected
                  ? `${activeDiscordWebhooksCount}/${discordWebhooks.length} canali Discord attivi`
                  : "Not connected"
              : integration
                ? `Ultimo sync: ${new Date(integration.updated_at).toLocaleDateString()}`
                : "Not connected"
          const Icon = provider.icon

          return (
            <Card key={provider.id} className="relative overflow-hidden border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20">
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
                          {genericWebhooks.length} webhook{genericWebhooks.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {connected && isSlackProvider && (
                        <Badge className="bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30">
                          {slackWebhooks.length} canale{slackWebhooks.length > 1 ? "i" : ""}
                        </Badge>
                      )}
                      {connected && isDiscordProvider && (
                        <Badge className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30">
                          {discordWebhooks.length} canale{discordWebhooks.length > 1 ? "i" : ""}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {provider.description}
                    </p>
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
                  variant={connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleConnect(provider.id)}
                  disabled={canManageIntegrations === false}
                  className={connected ? "border-white/10 bg-white/5 hover:bg-white/10" : "bg-white text-black hover:bg-slate-200"}
                >
                  {connected ? (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      {isWebhookProvider && !showWebhooks
                        ? "View"
                        : isSlackProvider && !showSlack
                          ? "View"
                          : isDiscordProvider && !showDiscord
                            ? "View"
                            : "Manage"}
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

      {/* Slack Management Section */}
      {showSlack && (
        <Card className="border-cyan-500/20 bg-cyan-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-300">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Slack Notifications</h3>
                <p className="text-xs text-slate-400">Messaggi preformattati per brief pronti, approvazioni e scheduling.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDisconnectChannel('slack')} className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20">
                Disconnect
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSlack(false)} className="text-slate-500">
                Chiudi
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {slackWebhooks.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
                Nessun canale Slack configurato.
              </div>
            )}

            {slackWebhooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{hook.name || "Slack Notifications"}</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-slate-400 border-white/10">
                      {hook.events.length} Eventi
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">{hook.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(hook.id, 'slack')} title="Invia test Slack" className="h-8 w-8 text-slate-500 hover:text-cyan-300">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Switch checked={hook.active} onCheckedChange={(value) => handleToggleWebhook(hook.id, value)} />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(hook.id, 'slack')} className="h-8 w-8 text-slate-500 hover:text-rose-500">
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
                value={newSlackWebhookName}
                onChange={(e) => setNewSlackWebhookName(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slack Incoming Webhook URL</label>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={newSlackWebhookUrl}
                onChange={(e) => setNewSlackWebhookUrl(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-1">
              <Button onClick={handleAddSlackWebhook} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl h-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Discord Management Section */}
      {showDiscord && (
        <Card className="border-indigo-500/20 bg-indigo-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-300">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Discord Notifications</h3>
                <p className="text-xs text-slate-400">Messaggi Discord preformattati per brief pronti, approvazioni e scheduling.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDisconnectChannel('discord')} className="border-indigo-500/30 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20">
                Disconnect
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDiscord(false)} className="text-slate-500">
                Chiudi
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {discordWebhooks.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
                Nessun canale Discord configurato.
              </div>
            )}

            {discordWebhooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{hook.name || "Discord Notifications"}</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-slate-400 border-white/10">
                      {hook.events.length} Eventi
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">{hook.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(hook.id, 'discord')} title="Invia test Discord" className="h-8 w-8 text-slate-500 hover:text-indigo-300">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Switch checked={hook.active} onCheckedChange={(value) => handleToggleWebhook(hook.id, value)} />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(hook.id, 'discord')} className="h-8 w-8 text-slate-500 hover:text-rose-500">
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
                placeholder="es: Growth Squad"
                value={newDiscordWebhookName}
                onChange={(e) => setNewDiscordWebhookName(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Discord Incoming Webhook URL</label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                value={newDiscordWebhookUrl}
                onChange={(e) => setNewDiscordWebhookUrl(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-1">
              <Button onClick={handleAddDiscordWebhook} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl h-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generic Webhook Management Section */}
      {showWebhooks && (
        <Card className="border-orange-500/20 bg-orange-500/5 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/20 p-2 text-orange-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gestione Webhooks</h3>
                <p className="text-xs text-slate-400">Invia eventi a Zapier, Make o ai tuoi server custom.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowWebhooks(false)} className="text-slate-500">
              Chiudi
            </Button>
          </div>

          <div className="space-y-3">
            {genericWebhooks.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
                Nessun webhook custom configurato.
              </div>
            )}

            {genericWebhooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{hook.name || "Webhook"}</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-slate-400 border-white/10">
                      {hook.events.length} Eventi
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">{hook.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(hook.id, 'generic')} title="Invia test" className="h-8 w-8 text-slate-500 hover:text-blue-400">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Switch checked={hook.active} onCheckedChange={(value) => handleToggleWebhook(hook.id, value)} />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(hook.id, 'generic')} className="h-8 w-8 text-slate-500 hover:text-rose-500">
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
                placeholder="es: Zapier Ads"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL Endpoint</label>
              <Input
                placeholder="https://hooks.zapier.com/..."
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="bg-black border-white/10 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:col-span-1">
              <Button onClick={handleAddWebhook} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl h-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

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
