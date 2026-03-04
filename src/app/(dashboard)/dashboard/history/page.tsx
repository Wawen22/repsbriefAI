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
import { CalendarDays, FileText, Dumbbell, History, ChevronRight, Clock } from "lucide-react"

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
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
              Archive
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Brief <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">History</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-light">
              Explore all your past content plans and data-driven insights.
            </p>
          </div>
        </div>
        
        {hasHistory && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <FileText className="w-4 h-4 text-slate-500" />
              {briefs!.length} Briefs
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
              <Dumbbell className="w-4 h-4 text-slate-500" />
              {totalIdeas} Ideas
            </div>
          </div>
        )}
      </header>

      {!hasHistory ? (
        <div className="relative py-24 flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          <div className="relative z-10 space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
               <Clock className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">No history found</h2>
              <p className="text-slate-500 leading-relaxed font-light px-6">
                Your archive will automatically populate after your first weekly briefing is generated.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
                  className="bg-white/[0.02] border border-white/10 rounded-2xl px-2 overflow-hidden transition-all hover:bg-white/[0.04] hover:border-white/20"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-6 rounded-2xl transition-all data-[state=open]:rounded-b-none data-[state=open]:bg-white/5 group">
                    <div className="flex items-center gap-5 text-left w-full">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                        <CalendarDays className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Week of {readableDate}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                           <Badge variant="outline" className="bg-white/5 text-slate-400 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                             {nicheIcon} {brief.niche.replace('_', ' ')}
                           </Badge>
                           <div className="h-1 w-1 rounded-full bg-slate-700" />
                           <span className="text-xs text-slate-500 font-medium">{ideaCount} ideas curated</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-10 pb-10 px-6 bg-black/40">
                    <BriefList ideas={brief.ideas || []} savedHashes={savedHashes} />
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      )}
    </div>
  )
}
