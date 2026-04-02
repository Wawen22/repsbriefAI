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
    <div className="h-screen bg-black text-slate-50 flex flex-col overflow-hidden relative font-sans">
      <CommandPalette />
      
      {/* Mobile Top Bar */}
      <MobileNav plan={plan} userEmail={userEmail} userFullName={userFullName} />

      {/* Background Gradients & Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <DashboardSidebar plan={plan} userEmail={userEmail} userFullName={userFullName} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 scroll-smooth custom-scrollbar">
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
