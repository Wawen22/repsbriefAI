import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Brief History</h1>
        <p className="text-slate-400">Past content briefs generated for your niches.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
        <p>Your history will appear here once you receive more briefs over the coming weeks.</p>
      </div>
    </>
  )
}
