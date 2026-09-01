import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { BriefList } from "@/components/brief/BriefList"
import type { ComponentType, SVGProps } from "react"
import { Button } from "@/components/ui/button"
import { 
  History, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Layers,
  Video,
  Hash,
  Mail
} from "lucide-react"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const dynamic = 'force-dynamic'

const NICHE_ICON_MAP: Record<string, string> = {
  fitness: '🏋️',
  personal_finance: '💰',
  b2b_marketing: '📊',
  parenting: '👨‍👩‍👧',
  tech_ai: '🤖',
}

const formatIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Reel: Video,
  Carousel: Layers,
  Thread: Hash,
  Newsletter: Mail,
}

export default async function HistoryPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()
  const [profile, { data: briefs }] = await Promise.all([
    getCachedProfile(user.id),
    supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('week_date', { ascending: false }),
  ])

  // Fetch saved ideas with their IDs to enable Studio access from history
  const { data: savedData } = await supabase
    .from('idea_history')
    .select('id, idea_hash')
    .eq('team_id', profile?.current_team_id)
    .eq('saved', true)

  // Create a map of hash -> db_id
  const savedIdsMap = new Map(savedData?.map(row => [row.idea_hash, row.id]) || [])
  const savedHashes = new Set(savedIdsMap.keys())
  
  const hasHistory = briefs && briefs.length > 0
  const totalIdeas = briefs?.reduce((acc, b) => acc + (b.ideas?.length || 0), 0) || 0
  const userPlan = profile?.plan || 'starter'

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/60">
            <History className="w-3 h-3 text-blue-400" />
            <span>Brief Archive & Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Historical Briefs
          </h1>
          <p className="text-white/50 text-sm md:text-base font-sans max-w-xl">
            Chronological archive of all weekly compiled content strategies and metrics.
          </p>
        </div>
        
        {hasHistory && (
          <div className="flex items-center gap-3">
            <div className="bg-[#070707] border border-white/[0.08] p-3 rounded-xl min-w-[110px] text-center space-y-0.5">
               <p className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider">Total Briefs</p>
               <p className="text-xl font-bold text-white font-mono">{briefs!.length}</p>
            </div>
            <div className="bg-[#070707] border border-white/[0.08] p-3 rounded-xl min-w-[110px] text-center space-y-0.5">
               <p className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider">Total Ideas</p>
               <p className="text-xl font-bold text-white font-mono">{totalIdeas}</p>
            </div>
          </div>
        )}
      </header>

      {!hasHistory ? (
        <div className="relative py-20 flex flex-col items-center justify-center text-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070707] shadow-2xl text-left">
          <div className="relative z-10 space-y-6 max-w-md text-center px-4">
            <div className="size-14 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mx-auto">
               <Clock className="w-7 h-7 text-white/40" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Vault is Empty</h2>
              <p className="text-white/50 text-sm leading-relaxed font-sans">
                Compile your first weekly brief to start building your strategic content archive.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
               <Link href="/dashboard">
                 <Button className="bg-white text-black hover:bg-white/90 rounded-xl font-mono text-xs uppercase tracking-wider font-bold h-10 px-6 gap-2">
                    Compile First Brief <ArrowRight className="w-3.5 h-3.5" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Accordion type="single" collapsible className="space-y-4">
            {briefs!.map((brief) => {
              const dateObj = new Date(brief.week_date)
              const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
              const day = dateObj.toLocaleDateString('en-US', { day: 'numeric' })
              const year = dateObj.getFullYear()
              const nicheIcon = NICHE_ICON_MAP[brief.niche] || '📌'
              
              // Group ideas by format for summary
              const formats = (brief.ideas || []).reduce((acc: Record<string, number>, curr: unknown) => {
                const idea = curr as { format?: string }
                const format = idea.format || 'Idea'
                acc[format] = (acc[format] || 0) + 1
                return acc
              }, {})

              return (
                <AccordionItem
                  key={brief.id}
                  value={brief.id}
                  className="bg-[#070707] border border-white/[0.08] rounded-xl overflow-hidden transition-all hover:border-white/[0.18] px-0 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                >
                  <AccordionTrigger className="hover:no-underline p-5 lg:p-6 group outline-none text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4 text-left">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex flex-col items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-lg w-14 h-16 shrink-0 group-hover:border-white/20 transition-colors text-left">
                           <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{month}</span>
                           <span className="text-xl font-bold font-mono text-white">{day}</span>
                           <span className="text-[9px] font-mono text-white/40">{year}</span>
                        </div>
                        <div className="space-y-1 text-left">
                           <div className="flex items-center gap-2 text-left">
                              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors tracking-tight text-left">Week of {month} {day}, {year}</h3>
                           </div>
                           <div className="flex items-center gap-2 text-left">
                              <span className="bg-white/[0.04] text-white/60 border border-white/[0.06] text-[9.5px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                                {nicheIcon} {brief.niche.replace('_', ' ')}
                              </span>
                              <div className="h-1 w-1 rounded-full bg-white/20" />
                              <span className="text-xs text-white/40 font-mono">{brief.ideas?.length || 0} strategies</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end text-left">
                         {(Object.entries(formats) as Array<[string, number]>).map(([format, count]) => {
                           const Icon = formatIcons[format] || Sparkles
                           return (
                             <div key={format} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/50 font-mono text-xs text-left">
                                <Icon className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] uppercase">{count} {format}s</span>
                             </div>
                           )
                         })}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="p-5 lg:p-8 bg-[#090909] border-t border-white/[0.08] animate-in fade-in duration-300 text-left">
                    <div className="space-y-6 text-left">
                       <BriefList 
                        ideas={brief.ideas || []} 
                        savedHashes={savedHashes} 
                        savedIdsMap={savedIdsMap}
                        plan={userPlan} 
                       />
                    </div>
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
