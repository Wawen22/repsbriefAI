import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { NicheFilterBar } from "@/components/ui/NicheFilterBar"
import { BriefCard } from "@/components/brief/BriefCard"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, BookmarkX, Star, Sparkles, Filter } from "lucide-react"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ niche?: string }>
}

export default async function MyIdeasPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = await searchParams
  const nicheFilter = params?.niche

  const { data: allIdeas } = await supabase
    .from('idea_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('saved', true)
    .order('used_at', { ascending: false })

  const nicheCounts = (allIdeas || []).reduce<Record<string, number>>((acc, idea) => {
    const n = idea.niche || 'fitness'
    acc[n] = (acc[n] || 0) + 1
    return acc
  }, {})

  const nicheOptions = Object.entries(nicheCounts).map(([id, count]) => ({
    id,
    label: id.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count,
  }))

  const ideas = nicheFilter
    ? (allIdeas || []).filter(i => i.niche === nicheFilter)
    : (allIdeas || [])

  const totalCount = allIdeas?.length || 0
  const hasIdeas = totalCount > 0

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Star className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </div>
            <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
              Favorites
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Saved <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Ideas</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-light">
              Your personal library of inspiration and content concepts.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasIdeas && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <Lightbulb className="w-4 h-4 text-slate-500" />
              {totalCount} Total
            </div>
          )}
          <AddIdeaModal />
        </div>
      </header>

      {/* Filter Section */}
      {nicheOptions.length > 1 && (
        <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl w-fit">
          <div className="pl-3 pr-1 text-slate-500">
             <Filter className="w-4 h-4" />
          </div>
          <Suspense>
            <NicheFilterBar niches={nicheOptions} />
          </Suspense>
        </div>
      )}

      {!hasIdeas ? (
        <div className="relative py-32 flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
               <Star className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">No ideas saved yet</h2>
              <p className="text-slate-400 text-lg leading-relaxed font-light px-6">
                Bookmark ideas from your weekly briefings or add your own custom sparks to build your content vault.
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <AddIdeaModal />
            </div>
          </div>
        </div>
      ) : ideas.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center border border-dashed border-white/10 rounded-3xl">
          <BookmarkX className="w-10 h-10 text-slate-700 mb-4" />
          <p className="text-slate-500 font-medium">No ideas match this niche filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {ideas.map((item) => {
            const ideaObj = item.idea_data || {
              title: item.idea_title,
              format: 'Idea',
              hook: `Saved on ${new Date(item.used_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
              description: 'You saved this idea directly from the dashboard.',
              whyItWorks: 'It caught your attention!'
            }

            return (
              <BriefCard key={item.id} idea={ideaObj} hideSaveButton dbId={item.id} />
            )
          })}
        </div>
      )}
    </div>
  )
}
