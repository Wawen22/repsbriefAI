// src/app/(dashboard)/dashboard/settings/page.tsx

import { redirect } from "next/navigation"
import { Fingerprint, ShieldCheck, Target, Users, User, Link2, Activity, CreditCard, Zap, Check } from "lucide-react"
import { BrandVoiceSettings } from "@/components/settings/BrandVoiceSettings"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"
import { TeamWorkspaceSettings } from "@/components/settings/TeamWorkspaceSettings"
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings"
import { AutomationLogsSettings } from "@/components/settings/AutomationLogsSettings"
import { LogoutButton } from "@/components/ui/LogoutButton"
import { UpgradeToProButton } from "@/components/settings/UpgradeToProButton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NICHES } from "@/config/niches"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedFullProfile } from "@/lib/supabase/cached-queries"

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const params = searchParams ? await searchParams : undefined
  const defaultTab = params?.tab || "account"

  const [profile, supabase] = await Promise.all([
    getCachedFullProfile(user.id),
    createClient(),
  ])

  if (!profile) return null

  let team: { name: string } | null = null
  let brandVoice: string | null = profile.brand_voice || null
  let canEditBrandVoice = true
  if (profile.current_team_id) {
    const { data } = await supabase
      .from('teams')
      .select('name')
      .eq('id', profile.current_team_id)
      .maybeSingle()

    team = data

    const { data: teamVoice } = await supabase
      .from('teams')
      .select('brand_voice')
      .eq('id', profile.current_team_id)
      .maybeSingle()

    if (teamVoice?.brand_voice) {
      brandVoice = teamVoice.brand_voice
    }

    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', profile.current_team_id)
      .eq('user_id', user.id)
      .maybeSingle()

    canEditBrandVoice = membership ? ['owner', 'admin'].includes(membership.role) : false
  }

  const activeNicheLabel = NICHES[profile.active_niche]?.label || 'Fitness & Nutrition'
  const planLabel = profile.plan === 'team' ? 'Team' : profile.plan === 'pro' ? 'Pro' : 'Starter'
  const currentWorkspace = team?.name || 'Personal Workspace'
  const initials = user.email?.[0]?.toUpperCase() || 'U'

  const triggerClasses = "h-9 shrink-0 rounded-xl border border-transparent bg-transparent px-4 text-slate-400 hover:bg-white/[0.04] hover:text-white data-[state=active]:border-white/10 data-[state=active]:bg-white/[0.07] data-[state=active]:text-white transition-all"

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 text-white">
      {/* Compact Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="text-sm text-slate-500">Manage your account, content strategy, and workspace.</p>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
          {planLabel} Plan
        </Badge>
      </header>

      <Tabs defaultValue={defaultTab} className="gap-0">
        {/* Tab Navigation — grouped with separators */}
        <TabsList className="h-auto w-full justify-start gap-0 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overflow-x-auto overflow-y-hidden">
          {/* Personal */}
          <TabsTrigger value="account" className={triggerClasses}>
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>

          {/* Separator */}
          <div className="mx-1.5 hidden h-5 w-px shrink-0 bg-white/[0.08] sm:block" aria-hidden />

          {/* Content */}
          <TabsTrigger value="niche" className={triggerClasses}>
            <Target className="h-4 w-4" />
            Niche
          </TabsTrigger>
          <TabsTrigger value="voice" className={triggerClasses}>
            <Fingerprint className="h-4 w-4" />
            Brand Voice
          </TabsTrigger>

          {/* Separator */}
          <div className="mx-1.5 hidden h-5 w-px shrink-0 bg-white/[0.08] sm:block" aria-hidden />

          {/* Workspace & Connections */}
          <TabsTrigger value="workspace" className={triggerClasses}>
            <Users className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="integrations" className={triggerClasses}>
            <Link2 className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="automation-logs" className={triggerClasses}>
            <Activity className="h-4 w-4" />
            Automation Logs
          </TabsTrigger>

          {/* Separator */}
          <div className="mx-1.5 hidden h-5 w-px shrink-0 bg-white/[0.08] sm:block" aria-hidden />

          {/* Billing */}
          <TabsTrigger value="billing" className={triggerClasses}>
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* ─── Account ─── */}
        <TabsContent value="account" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
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
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Workspace</p>
                <p className="mt-1 text-sm font-semibold text-white">{currentWorkspace}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
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

            <div className="border-t border-white/[0.06] pt-4">
              <LogoutButton />
            </div>
          </div>
        </TabsContent>

        {/* ─── Niche ─── */}
        <TabsContent value="niche" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
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

        {/* ─── Brand Voice ─── */}
        <TabsContent value="voice" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Fingerprint className="h-4 w-4 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">AI Brand Voice</h2>
            </div>
            <p className="text-sm text-slate-500">
              Definisci lo stile editoriale condiviso dal team per script, caption e remix.
            </p>
          </div>
          <BrandVoiceSettings
            currentAnalysis={brandVoice}
            canEdit={canEditBrandVoice}
          />
        </TabsContent>

        {/* ─── Workspace ─── */}
        <TabsContent value="workspace" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
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

        {/* ─── Integrations ─── */}
        <TabsContent value="integrations" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Link2 className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Connections & Plugins</h2>
            </div>
            <p className="text-sm text-slate-500">
              Collega RepsBrief ai tuoi strumenti di lavoro preferiti.
            </p>
          </div>
          <IntegrationsSettings />
        </TabsContent>

        {/* ─── Automation Logs ─── */}
        <TabsContent value="automation-logs" className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
          <div className="mb-6 space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Automation Logs</h2>
            </div>
            <p className="text-sm text-slate-500">
              Monitora tutte le esportazioni e notifiche inviate dal tuo workspace.
            </p>
          </div>
          <AutomationLogsSettings />
        </TabsContent>

        {/* ─── Billing ─── */}
        <TabsContent value="billing" className="mt-5 space-y-6">
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <CreditCard className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Plans & Billing</h2>
            </div>
            <p className="text-sm text-slate-500">You&apos;re currently on the <span className="text-white font-semibold">{planLabel}</span> plan.</p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Starter */}
            <div className={`rounded-3xl border p-6 space-y-5 flex flex-col ${profile.plan === 'starter' ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Starter</span>
                  {profile.plan === 'starter' && <Badge className="bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-widest">Current</Badge>}
                </div>
                <p className="text-3xl font-black text-white">Free</p>
                <p className="text-xs text-slate-500">Forever</p>
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  '1 brief per week (20 ideas)',
                  '5 ideas visible per brief',
                  'Hook + Strategy preview',
                  'Share publicly',
                  'Schedule to calendar',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="h-10 flex items-center justify-center rounded-2xl border border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Your current plan
              </div>
            </div>

            {/* Pro — highlighted */}
            <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent p-6 space-y-5 flex flex-col relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest">Most Popular</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Pro</span>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">7-day free trial</span>
                </div>
                <p className="text-3xl font-black text-white">$19<span className="text-sm font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-500">No charge today · Cancel anytime</p>
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Daily brief (20 ideas/day)',
                  'All 20 ideas unlocked',
                  'Full production script',
                  'AI Strategy Remix',
                  'Live Recording Mode',
                  'Export PDF & Markdown',
                  'Notion integration',
                  'Google Calendar sync',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {profile.plan === 'starter' ? (
                <UpgradeToProButton />
              ) : profile.plan === 'pro' ? (
                <div className="h-10 flex items-center justify-center rounded-2xl border border-blue-500/30 text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Active plan
                </div>
              ) : null}
            </div>

            {/* Team */}
            <div className={`rounded-3xl border p-6 space-y-5 flex flex-col ${profile.plan === 'team' ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-400">Team</span>
                  {profile.plan === 'team' && <Badge className="bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-widest">Current</Badge>}
                </div>
                <p className="text-3xl font-black text-white">$39<span className="text-sm font-normal text-slate-400">/mo</span></p>
                <p className="text-xs text-slate-500">Billed monthly</p>
              </div>
              <ul className="space-y-2 flex-1">
                {[
                  'Everything in Pro',
                  'Up to 10 team members',
                  'Approval workflow',
                  'White-label branding',
                  'Shared brand voice',
                  'Webhook automations',
                  'Automation logs',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {profile.plan === 'team' ? (
                <div className="h-10 flex items-center justify-center rounded-2xl border border-purple-500/30 text-xs font-bold text-purple-400 uppercase tracking-widest">
                  Active plan
                </div>
              ) : (
                <a
                  href="/api/stripe/checkout?plan=team"
                  className="h-10 flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade to Team
                </a>
              )}
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
