// src/app/(dashboard)/dashboard/settings/page.tsx

import { redirect } from "next/navigation"
import { Fingerprint, Settings, ShieldCheck, Target, Users, User } from "lucide-react"
import { BrandVoiceSettings } from "@/components/settings/BrandVoiceSettings"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"
import { TeamWorkspaceSettings } from "@/components/settings/TeamWorkspaceSettings"
import { LogoutButton } from "@/components/ui/LogoutButton"
import { UpgradeToProButton } from "@/components/settings/UpgradeToProButton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NICHES } from "@/config/niches"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  let team: { name: string; brand_voice: string | null } | null = null
  if (profile.current_team_id) {
    const { data } = await supabase
      .from('teams')
      .select('name, brand_voice')
      .eq('id', profile.current_team_id)
      .maybeSingle()

    team = data
  }

  const activeNicheLabel = NICHES[profile.active_niche]?.label || 'Fitness & Nutrition'
  const planLabel = profile.plan === 'team' ? 'Team' : profile.plan === 'pro' ? 'Pro' : 'Starter'
  const currentWorkspace = team?.name || 'Personal Workspace'
  const initials = user.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 text-white">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%)]" />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Settings Hub</p>
                <p className="text-sm text-slate-300">Organizzato per feature, con flusso a tab.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              {planLabel} Plan
            </Badge>
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Settings
          </h1>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-white/15 bg-black/30 text-slate-300">
              Workspace: {currentWorkspace}
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-black/30 text-slate-300">
              Niche: {activeNicheLabel}
            </Badge>
            <Badge variant="outline" className="border-white/15 bg-black/30 text-slate-300">
              Persona: {team?.brand_voice ? 'Configured' : 'Not configured'}
            </Badge>
          </div>
        </div>
      </header>

      <Tabs defaultValue="account" className="gap-5">
        <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="account" className="h-9 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-slate-300 hover:bg-white/[0.08] hover:text-white data-[state=active]:border-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="workspace" className="h-9 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-slate-300 hover:bg-white/[0.08] hover:text-white data-[state=active]:border-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
            <Users className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="niche" className="h-9 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-slate-300 hover:bg-white/[0.08] hover:text-white data-[state=active]:border-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
            <Target className="h-4 w-4" />
            Niche
          </TabsTrigger>
          <TabsTrigger value="voice" className="h-9 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-slate-300 hover:bg-white/[0.08] hover:text-white data-[state=active]:border-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
            <Fingerprint className="h-4 w-4" />
            Brand Voice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-0 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-black text-white">
                {initials}
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-white">{user.email}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{planLabel} member</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Workspace</p>
                <p className="mt-1 text-sm font-semibold text-white">{currentWorkspace}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Niche</p>
                <p className="mt-1 text-sm font-semibold text-white">{activeNicheLabel}</p>
              </div>
            </div>

            {profile.plan === 'starter' && (
              <div className="space-y-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-xs font-semibold text-white">Passa a Pro per sbloccare storico e controlli avanzati.</p>
                <UpgradeToProButton />
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <LogoutButton />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="mt-0 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Workspace Management</h2>
            </div>
            <p className="text-sm text-slate-500">
              Cambia workspace, gestisci branding e controlla i permessi del team.
            </p>
          </div>
          <TeamWorkspaceSettings />
        </TabsContent>

        <TabsContent value="niche" className="mt-0 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Target className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Content Niche</h2>
            </div>
            <p className="text-sm text-slate-500">
              Seleziona la nicchia usata per trend scouting e generazione dei tuoi brief.
            </p>
          </div>
          <div className="space-y-5">
            <NicheSwitcher currentNiche={profile.active_niche || 'fitness'} />
          </div>
        </TabsContent>

        <TabsContent value="voice" className="mt-0 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Fingerprint className="h-4 w-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">AI Brand Voice</h2>
            </div>
            <p className="text-sm text-slate-500">
              Definisci lo stile editoriale condiviso dal team per script, caption e remix.
            </p>
          </div>
          <BrandVoiceSettings currentAnalysis={team?.brand_voice || null} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
