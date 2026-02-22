import { DashboardSidebar } from "@/components/layout/DashboardSidebar"

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
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar plan={plan} userId={userId} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
