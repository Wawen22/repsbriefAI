import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { BriefCard } from "@/components/brief/BriefCard"

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((item) => {
            const ideaObj = item.idea_data || {
               title: item.idea_title,
               format: 'Idea',
               hook: `Saved manually on ${new Date(item.used_at).toLocaleDateString()}`,
               angle: 'This idea was saved without rich AI details.',
               description: 'You saved this idea directly from the dashboard before the rich data feature was added.',
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
