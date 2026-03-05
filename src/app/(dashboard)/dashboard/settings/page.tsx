// src/app/(dashboard)/dashboard/settings/page.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"
import { BrandVoiceSettings } from "@/components/settings/BrandVoiceSettings"
import { TeamWorkspaceSettings } from "@/components/settings/TeamWorkspaceSettings"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Zap, ShieldCheck, Sparkles, Fingerprint, Users } from "lucide-react"
import { LogoutButton } from "@/components/ui/LogoutButton"

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

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 text-left">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-0.5">
             <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
               System Settings
             </Badge>
             <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Manage your creator identity</p>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
          Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">Center</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Account & Niche */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Team Workspace Settings */}
          <section className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6">
             <div className="flex items-center gap-3 px-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Workspaces</h3>
                <p className="text-[10px] text-slate-500 font-medium">Switch or manage your teams</p>
              </div>
            </div>
            <TeamWorkspaceSettings />
          </section>

          {/* Profile Quick Look */}
          <section className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl">
                 {user.email?.[0].toUpperCase()}
               </div>
               <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white leading-tight">{user.email}</h3>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{profile.plan} Member</span>
                  </div>
               </div>
            </div>
            <div className="pt-4 border-t border-white/5">
               <LogoutButton />
            </div>
          </section>

          {/* Niche Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Strategic Niche</h3>
            </div>
            <NicheSwitcher currentNiche={profile.active_niche || 'fitness'} />
          </section>

        </div>

        {/* Right Column: AI Persona (New Name) */}
        <div className="lg:col-span-7 space-y-8">
          
          <section className="p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
            <div className="p-8 md:p-10 rounded-[2.8rem] bg-black/90 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">AI Brand Persona</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Define your unique content identity. Our AI will use this profile to write hooks, scripts, and remixes that sound exactly like you.
                </p>
              </div>

              <BrandVoiceSettings 
                currentAnalysis={profile.brand_voice || null} 
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
