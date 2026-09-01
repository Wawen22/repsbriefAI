import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist"
import { UpgradeModal } from "@/components/ui/UpgradeModal"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  let plan = 'starter'
  let userEmail = user?.email || ''
  let userFullName: string | null = null
  let showChecklist = false
  let voiceConfigured = false
  let briefGenerated = false
  let ideaSaved = false

  if (user) {
    const profile = await getCachedProfile(user.id)

    if (profile?.plan) plan = profile.plan
    if (profile?.full_name) userFullName = profile.full_name
    if (profile?.email) userEmail = profile.email

    if (profile?.has_onboarded) {
      voiceConfigured = !!(profile.brand_voice)

      const supabase = await createClient()
      const [{ data: anyBrief }, { data: anySavedIdea }] = await Promise.all([
        supabase.from('briefs').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
        supabase.from('idea_history').select('id')
          .eq('team_id', profile.current_team_id ?? '')
          .eq('saved', true).limit(1).maybeSingle(),
      ])

      briefGenerated = !!anyBrief
      ideaSaved = !!anySavedIdea
      showChecklist = !(voiceConfigured && briefGenerated && ideaSaved)
    }
  }

  return (
    <div className="h-screen bg-[#000000] text-white flex flex-col overflow-hidden relative font-sans antialiased selection:bg-white/20 selection:text-white">
      <CommandPalette />
      
      {/* Mobile Top Bar */}
      <MobileNav plan={plan} userEmail={userEmail} userFullName={userFullName} />

      {/* Global Atmosphere & Technical Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/[0.02] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-emerald-500/[0.015] blur-[140px] rounded-full" />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <DashboardSidebar plan={plan} userEmail={userEmail} userFullName={userFullName} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {showChecklist && (
        <OnboardingChecklist
          voiceConfigured={voiceConfigured}
          briefGenerated={briefGenerated}
          ideaSaved={ideaSaved}
        />
      )}
      <UpgradeModal />
    </div>
  )
}
