import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BriefList } from "@/components/brief/BriefList"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, FileText, Dumbbell } from "lucide-react"

export const dynamic = 'force-dynamic'

const NICHE_ICON_MAP: Record<string, string> = {
  fitness: '🏋️',
  personal_finance: '💰',
  b2b_marketing: '📊',
  parenting: '👨‍👩‍👧',
  tech_ai: '🤖',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Load briefs and saved idea hashes in parallel
  const [{ data: briefs }, { data: savedData }] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('week_date', { ascending: false }),
    supabase
      .from('idea_history')
      .select('idea_hash')
      .eq('user_id', user.id)
      .eq('saved', true),
  ])

  const savedHashes = new Set(savedData?.map(row => row.idea_hash) || [])
  const hasHistory = briefs && briefs.length > 0
  const totalIdeas = briefs?.reduce((acc, b) => acc + (b.ideas?.length || 0), 0) || 0

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Brief History</h1>
          <p className="text-slate-400 mt-2">All your past content briefs, sorted by most recent.</p>
        </div>
        {hasHistory && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-slate-700 text-slate-400 gap-1.5 py-1.5 px-3">
              <FileText className="w-3.5 h-3.5" />
              {briefs!.length} Brief{briefs!.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="border-slate-700 text-slate-400 gap-1.5 py-1.5 px-3">
              <Dumbbell className="w-3.5 h-3.5" />
              {totalIdeas} Ideas
            </Badge>
          </div>
        )}
      </header>

      {!hasHistory ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <p className="text-slate-300 font-semibold mb-1">No briefs yet</p>
            <p className="text-slate-500 text-sm max-w-xs">
              Your history will appear here after the first Monday cron job runs and generates your brief.
            </p>
          </div>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {briefs!.map((brief) => {
            const dateObj = new Date(brief.week_date)
            const readableDate = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            const nicheIcon = NICHE_ICON_MAP[brief.niche] || '📌'
            const ideaCount = brief.ideas?.length || 0

            return (
              <AccordionItem
                key={brief.id}
                value={brief.id}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline hover:bg-slate-800/50 px-4 py-4 rounded-xl transition-colors data-[state=open]:rounded-b-none data-[state=open]:border-b border-slate-800">
                  <div className="flex items-center gap-3 text-left w-full">
                    <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-100">Week of {readableDate}</h3>
                      <p className="text-sm text-slate-500 font-normal mt-0.5">
                        {nicheIcon} <span className="capitalize">{brief.niche.replace('_', ' ')}</span>
                        {' · '}
                        <span>{ideaCount} idea{ideaCount !== 1 ? 's' : ''}</span>
                        {brief.ai_model && (
                          <span className="ml-2 text-xs text-slate-600">via {brief.ai_model}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6 pb-4 px-4 bg-slate-950/50">
                  <BriefList ideas={brief.ideas || []} savedHashes={savedHashes} />
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </>
  )
}
