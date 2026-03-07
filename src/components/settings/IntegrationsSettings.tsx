// src/components/settings/IntegrationsSettings.tsx
'use client'

import { useState, useEffect } from "react"
import { Calendar, CheckCircle2, Circle, ExternalLink, Globe, Layout, Link2, MoreHorizontal, Plus, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Integration {
  id: string
  provider: string
  status: 'active' | 'error' | 'expired'
  settings: any
  updated_at: string
}

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
    id: 'zapier',
    name: 'Zapier / Webhooks',
    description: 'Collega RepsBrief a oltre 5000+ app tramite Webhooks.',
    icon: Globe,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  }
]

import { connectNotion, connectGoogle } from "@/app/actions/integrations"
import { addWebhookAction, deleteWebhookAction, toggleWebhookAction, testWebhookAction } from "@/app/actions/webhooks"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Trash2, Send } from "lucide-react"

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWebhooks, setShowWebhooks] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [newWebhookName, setNewWebhookName] = useState("")
  const [teamId, setTeamId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchIntegrations()
    fetchWebhooks()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_team_id')
        .eq('id', user.id)
        .single()

      if (!profile?.current_team_id) return
      setTeamId(profile.current_team_id)

      const { data, error } = await supabase
        .from('team_integrations')
        .select('*')
        .eq('team_id', profile.current_team_id)

      if (error) throw error
      setIntegrations(data || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhooks = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('current_team_id').eq('id', user.id).single()
    if (!profile?.current_team_id) return

    const { data } = await supabase
      .from('team_webhooks')
      .select('*')
      .eq('team_id', profile.current_team_id)
    
    setWebhooks(data || [])
  }

  const handleConnect = async (providerId: string) => {
    if (providerId === 'notion') {
      await connectNotion()
    } else if (providerId === 'google_calendar') {
      await connectGoogle()
    } else if (providerId === 'zapier') {
      setShowWebhooks(!showWebhooks)
    } else {
      toast.info(`L'integrazione con ${providerId} sarà disponibile a breve.`)
    }
  }

  const handleAddWebhook = async () => {
    if (!teamId || !newWebhookUrl) return
    const res = await addWebhookAction(teamId, newWebhookUrl, newWebhookName || "Zapier", ['idea.approved', 'brief.ready'])
    if (res.success) {
      toast.success("Webhook added!")
      setNewWebhookUrl("")
      setNewWebhookName("")
      fetchWebhooks()
    } else {
      toast.error(res.error)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    const res = await deleteWebhookAction(id)
    if (res.success) {
      toast.success("Webhook deleted")
      fetchWebhooks()
    }
  }

  const handleToggleWebhook = async (id: string, active: boolean) => {
    const res = await toggleWebhookAction(id, active)
    if (res.success) fetchWebhooks()
  }

  const handleTestWebhook = async (id: string) => {
    if (!teamId) return
    const tid = toast.loading("Sending test payload...")
    const res = await testWebhookAction(teamId, id)
    toast.success("Test sent!", { id: tid })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {AVAILABLE_PROVIDERS.map((provider) => {
          const connected = integrations.find(i => i.provider === provider.id)
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
                      {connected && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                          Connected
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
                  {connected ? (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Ultimo sync: {new Date(connected.updated_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Not connected
                    </span>
                  )}
                </div>
                
                <Button
                  variant={connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleConnect(provider.id)}
                  className={connected ? "border-white/10 bg-white/5 hover:bg-white/10" : "bg-white text-black hover:bg-slate-200"}
                >
                  {connected ? (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
              </div>

              {connected?.status === 'error' && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Errore di autenticazione. Riconnetti l'account.</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Webhook Management Section */}
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

          {/* Webhook List */}
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 group">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{wh.name}</span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter text-slate-400 border-white/10">
                      {wh.events.length} Eventi
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px] md:max-w-md">{wh.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleTestWebhook(wh.id)} title="Invia test" className="h-8 w-8 text-slate-500 hover:text-blue-400">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Switch checked={wh.active} onCheckedChange={(val) => handleToggleWebhook(wh.id, val)} />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(wh.id)} className="h-8 w-8 text-slate-500 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Webhook */}
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
          <h3 className="text-lg font-bold text-white">Richiedi un'integrazione</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Il tuo team usa un tool che non è ancora in lista? Faccelo sapere e lo aggiungeremo alla roadmap.
        </p>
        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
          Invia suggerimento
        </Button>
      </div>
    </div>
  )
}
