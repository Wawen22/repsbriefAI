import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"

export const dynamic = 'force-dynamic'

export default async function MyIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">My Ideas</h1>
        <p className="text-slate-400">Your manually saved ideas and inspirations.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center gap-6">
        <p>You haven't added any ideas yet. Save inspirations here so you don't forget them.</p>
        <AddIdeaModal />
      </div>
    </>
  )
}
