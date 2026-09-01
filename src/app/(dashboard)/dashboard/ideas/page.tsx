import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { Star, LayoutGrid, CheckCircle2, Video, PenTool } from "lucide-react"

export const dynamic = 'force-dynamic'

type KanbanIdeaRecord = {
  id: string
  idea_title: string
  idea_data: {
    title: string
    format: 'Reel' | 'Carousel' | 'Thread' | 'Newsletter' | 'Idea'
    hook: string
    description: string
    whyItWorks: string
  }
  status: string
  niche: string
}

export default async function MyIdeasPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const profile = await getCachedProfile(user.id)

  const { data: allIdeas } = await supabase
    .from('idea_history')
    .select('*')
    .eq('team_id', profile?.current_team_id)
    .eq('saved', true)
    .order('used_at', { ascending: false })

  const totalCount = allIdeas?.length || 0
  const hasIdeas = totalCount > 0
  const userPlan = profile?.plan || 'starter'

  // Stats for the header
  const stats = (allIdeas || []).reduce((acc: Record<string, number>, curr) => {
    const status = curr.status || 'backlog'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Header with Workflow Stats */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/60">
            <LayoutGrid className="w-3 h-3 text-blue-400" />
            <span>Kanban Pipeline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Saved Ideas & Board
          </h1>
          <p className="text-white/50 text-sm md:text-base font-sans max-w-xl">
            Manage your active production pipeline from backlog to published.
          </p>
        </div>
        
        {hasIdeas && (
          <div className="flex flex-wrap items-center gap-2">
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070707] border border-white/[0.08] text-white/60 font-mono text-xs">
                <PenTool className="w-3 h-3 text-blue-400" />
                <span>{stats['scripting'] || 0} Scripting</span>
             </div>
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070707] border border-white/[0.08] text-white/60 font-mono text-xs">
                <Video className="w-3 h-3 text-purple-400" />
                <span>{stats['producing'] || 0} Producing</span>
             </div>
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070707] border border-white/[0.08] text-white/60 font-mono text-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{stats['published'] || 0} Published</span>
             </div>
             <div className="h-5 w-px bg-white/10 mx-1" />
             <AddIdeaModal />
          </div>
        )}
      </header>

      {!hasIdeas ? (
        <div className="relative py-20 flex flex-col items-center justify-center text-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070707] shadow-2xl text-left">
          <div className="relative z-10 space-y-6 max-w-md text-center px-4">
            <div className="size-14 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mx-auto">
               <Star className="w-7 h-7 text-white/40" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Board is Empty</h2>
              <p className="text-white/50 text-sm leading-relaxed font-sans">
                Bookmark ideas from your weekly brief or add custom strategies manually.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <AddIdeaModal />
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-2">
          <KanbanBoard 
            initialIdeas={allIdeas as unknown as KanbanIdeaRecord[]} 
            plan={userPlan} 
          />
        </div>
      )}
    </div>
  )
}
