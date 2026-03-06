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

export function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchIntegrations()
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

  const handleConnect = async (providerId: string) => {
    if (providerId === 'notion') {
      await connectNotion()
    } else if (providerId === 'google_calendar') {
      await connectGoogle()
    } else {
      toast.info(`L'integrazione con ${providerId} sarà disponibile a breve.`)
    }
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
