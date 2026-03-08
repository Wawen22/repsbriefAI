import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { KanbanBoard } from "@/components/dashboard/KanbanBoard"
import { Badge } from "@/components/ui/badge"
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, current_team_id')
    .eq('id', user.id)
    .single()

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
    <div className="space-y-10">
      {/* Header with Workflow Stats */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-left">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left">
              <LayoutGrid className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-0.5 text-left">
               <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                 Production Board
               </Badge>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-left">Execute your content strategy</p>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white text-left">
            Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">Board</span>
          </h1>
        </div>
        
        {hasIdeas && (
          <div className="flex flex-wrap items-center gap-2 text-left">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-left">
                <PenTool className="w-3 h-3 text-blue-400" />
                {stats['scripting'] || 0} Scripting
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-left">
                <Video className="w-3 h-3 text-purple-400" />
                {stats['producing'] || 0} Producing
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-left">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {stats['published'] || 0} Published
             </div>
             <div className="h-8 w-px bg-white/10 mx-2 text-left" />
             <AddIdeaModal />
          </div>
        )}
      </header>

      {!hasIdeas ? (
        <div className="relative py-32 flex flex-col items-center justify-center text-center overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.02] shadow-2xl text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] text-left" />
          <div className="relative z-10 space-y-8 max-w-lg text-left">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl text-left text-left">
               <Star className="w-12 h-12 text-slate-700" />
            </div>
            <div className="space-y-3 text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight text-left">Your Board is Empty</h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed px-6 text-left">
                Start saving ideas from your weekly brief or add your own sparks to populate your production workflow.
              </p>
            </div>
            <div className="pt-4 flex justify-center text-left">
              <AddIdeaModal />
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 text-left">
          <KanbanBoard initialIdeas={(allIdeas || []) as KanbanIdeaRecord[]} plan={userPlan} />
        </div>
      )}
    </div>
  )
}
