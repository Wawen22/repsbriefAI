import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { DeleteIdeaButton } from "@/components/ui/DeleteIdeaButton"
import { Clock } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MyIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: ideas } = await supabase
    .from('idea_history')
    .select('*')
    .eq('user_id', user.id)
    .order('used_at', { ascending: false })

  const hasIdeas = ideas && ideas.length > 0

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Ideas</h1>
          <p className="text-slate-400 mt-2">Your manually saved ideas and inspirations.</p>
        </div>
        {hasIdeas && <AddIdeaModal />}
      </header>

      {!hasIdeas ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center gap-6">
          <p>You haven't added any ideas yet. Save inspirations here so you don't forget them.</p>
          <AddIdeaModal />
        </div>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start justify-between gap-4 group hover:border-blue-500/50 transition-colors">
              <div className="space-y-2">
                <p className="text-slate-100 font-medium leading-relaxed">{idea.idea_title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(idea.used_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteIdeaButton id={idea.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
