// src/app/(dashboard)/dashboard/settings/page.tsx

import { redirect } from "next/navigation"
import { Fingerprint, Settings, ShieldCheck, Target, Users } from "lucide-react"
import { BrandVoiceSettings } from "@/components/settings/BrandVoiceSettings"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"
import { TeamWorkspaceSettings } from "@/components/settings/TeamWorkspaceSettings"
import { LogoutButton } from "@/components/ui/LogoutButton"
import { UpgradeToProButton } from "@/components/settings/UpgradeToProButton"
import { Badge } from "@/components/ui/badge"
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
    <div className="mx-auto max-w-6xl space-y-8 pb-16 text-white">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-2.5">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Account Settings</p>
                <p className="text-sm text-slate-300">Workspace, niche e brand voice in un unico punto.</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              {planLabel} Plan
            </Badge>
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Settings
          </h1>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">{currentWorkspace}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Niche</p>
              <p className="mt-1 text-sm font-semibold text-white">{activeNicheLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Persona</p>
              <p className="mt-1 text-sm font-semibold text-white">{team?.brand_voice ? 'Configured' : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-black text-white">
                {initials}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">{user.email}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{planLabel} member</span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-widest text-slate-500">
                  <Users className="h-3 w-3" />
                  {currentWorkspace}
                </div>
              </div>
            </div>
            <div className="mt-5 border-t border-white/10 pt-4">
              <LogoutButton />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <Target className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold">Content Niche</h2>
              </div>
              <p className="text-xs text-slate-500">
                Seleziona il dominio in cui il motore trend genera i tuoi brief settimanali.
              </p>
            </div>

            <NicheSwitcher currentNiche={profile.active_niche || 'fitness'} />

            {profile.plan === 'starter' && (
              <div className="space-y-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-xs font-semibold text-white">Sblocca storico, filtri avanzati e automazioni complete.</p>
                <UpgradeToProButton />
              </div>
            )}
          </section>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
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
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
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
          </section>
        </div>
      </div>
    </div>
  )
}
