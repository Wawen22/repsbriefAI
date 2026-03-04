import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { NicheFilterBar } from "@/components/ui/NicheFilterBar"
import { BriefCard } from "@/components/brief/BriefCard"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, BookmarkX } from "lucide-react"
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

  // Build niche counts for filter bar
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

  // Apply filter
  const ideas = nicheFilter
    ? (allIdeas || []).filter(i => i.niche === nicheFilter)
    : (allIdeas || [])

  const totalCount = allIdeas?.length || 0
  const hasIdeas = totalCount > 0

  return (
    <>
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Ideas</h1>
          <p className="text-slate-400 mt-2">Your manually saved ideas and inspirations.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasIdeas && (
            <Badge variant="outline" className="border-slate-700 text-slate-400 gap-1.5 py-1.5 px-3">
              <Lightbulb className="w-3.5 h-3.5" />
              {totalCount} saved
            </Badge>
          )}
          <AddIdeaModal />
        </div>
      </header>

      {/* Niche Filter Bar — only show if multiple niches present */}
      {nicheOptions.length > 1 && (
        <div className="mb-6">
          <Suspense>
            <NicheFilterBar niches={nicheOptions} />
          </Suspense>
        </div>
      )}

      {!hasIdeas ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
            <Lightbulb className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <p className="text-slate-300 font-semibold mb-1">No saved ideas yet</p>
            <p className="text-slate-500 text-sm max-w-sm">
              Save ideas from your weekly brief using the bookmark icon, or add your own notes here.
            </p>
          </div>
          <AddIdeaModal />
        </div>
      ) : ideas.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center flex flex-col items-center gap-4">
          <BookmarkX className="w-8 h-8 text-slate-600" />
          <p className="text-slate-500 text-sm">No ideas saved in this niche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((item) => {
            const ideaObj = item.idea_data || {
              title: item.idea_title,
              format: 'Idea',
              hook: `Saved on ${new Date(item.used_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
              angle: 'This idea was saved without rich AI details.',
              description: 'You saved this idea directly from the dashboard.',
              whyItWorks: 'It caught your attention!'
            }

            return (
              <BriefCard key={item.id} idea={ideaObj} hideSaveButton dbId={item.id} />
            )
          })}
        </div>
      )}
    </>
  )
}
