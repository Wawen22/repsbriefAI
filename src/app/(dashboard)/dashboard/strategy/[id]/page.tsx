// src/app/(dashboard)/dashboard/strategy/[id]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { StrategicBriefView } from "@/components/brief/StrategicBriefView"

export const dynamic = 'force-dynamic'

export default async function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the strategy from idea_history
  const { data: idea } = await supabase
    .from('idea_history')
    .select('*')
    .eq('id', id)
    .single()

  if (!idea) {
    // If not found in history, check if it's a shared strategy (optional fallback)
    return notFound()
  }

  return (
    <div className="fixed inset-0 z-[50] bg-[#050505] overflow-hidden">
      <StrategicBriefView 
        idea={idea.idea_data} 
        ideaId={idea.id}
      />
    </div>
  )
}
