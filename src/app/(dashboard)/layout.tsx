import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let plan = 'starter'
  let userId = ''
  let userEmail = ''

  if (user) {
    userId = user.id
    userEmail = user.email || ''

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
      
    if (profile?.plan) {
      plan = profile.plan
    }
  }

  return (
    <div className="h-screen bg-black text-slate-50 flex flex-col overflow-hidden relative font-sans">
      <CommandPalette />
      
      {/* Mobile Top Bar */}
      <MobileNav plan={plan} userId={userId} userEmail={userEmail} />

      {/* Background Gradients & Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <DashboardSidebar plan={plan} userId={userId} userEmail={userEmail} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
