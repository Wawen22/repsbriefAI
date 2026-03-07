import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BriefList } from "@/components/brief/BriefList"
import type { ComponentType, SVGProps } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CalendarDays, 
  FileText, 
  Dumbbell, 
  History, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Orbit, 
  ArrowRight,
  ArrowUpRight,
  Layers,
  Video,
  Hash,
  Mail,
  Maximize2
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const [{ data: briefs }, { data: profile }] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('week_date', { ascending: false }),
    supabase
      .from('profiles')
      .select('plan, current_team_id')
      .eq('id', user.id)
      .single()
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
    <div className="space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left">
              <History className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-0.5 text-left">
               <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                 Strategy Vault
               </Badge>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-left">Archive of your content growth</p>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white text-left">
            Brief <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">History</span>
          </h1>
        </div>
        
        {hasHistory && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-3xl min-w-[140px] text-center space-y-1">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Briefs</p>
               <p className="text-2xl font-bold text-white tracking-tighter">{briefs!.length}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-3xl min-w-[140px] text-center space-y-1">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ideas Generated</p>
               <p className="text-2xl font-bold text-white tracking-tighter">{totalIdeas}</p>
            </div>
          </div>
        )}
      </header>

      {!hasHistory ? (
        <div className="relative py-32 flex flex-col items-center justify-center text-center overflow-hidden rounded-[3rem] border border-white/5 bg-white/[0.02] text-left">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)] text-left" />
          <div className="relative z-10 space-y-8 max-w-md text-left">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl text-left">
               <Clock className="w-12 h-12 text-slate-700" />
            </div>
            <div className="space-y-3 text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight text-left text-center">Vault is Empty</h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed px-6 text-center">
                Generate your first weekly brief to start building your strategic content archive.
              </p>
            </div>
            <div className="pt-4 flex justify-center text-left">
               <Link href="/dashboard">
                 <Button className="bg-white text-black hover:bg-slate-200 rounded-full font-bold h-12 px-8 group">
                    Generate My First Brief <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <Accordion type="single" collapsible className="space-y-6">
            {briefs!.map((brief) => {
              const dateObj = new Date(brief.week_date)
              const month = dateObj.toLocaleDateString('en-US', { month: 'long' })
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
                  className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/[0.04] hover:border-white/20 px-2"
                >
                  <AccordionTrigger className="hover:no-underline p-8 lg:p-10 group outline-none text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-8 text-left">
                      <div className="flex items-center gap-6 text-left">
                        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl w-20 h-24 shrink-0 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors text-left">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{month.slice(0,3)}</span>
                           <span className="text-3xl font-black text-white">{day}</span>
                           <span className="text-[10px] font-bold text-slate-600 mt-1">{year}</span>
                        </div>
                        <div className="space-y-2 text-left">
                           <div className="flex items-center gap-2 text-left">
                              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight text-left">Week of {month} {day}</h3>
                              <div className="p-1 rounded-full bg-white/10 group-data-[state=open]:rotate-180 transition-transform">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                           </div>
                           <div className="flex items-center gap-3 text-left">
                              <Badge variant="outline" className="bg-white/5 text-slate-400 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                                {nicheIcon} {brief.niche.replace('_', ' ')}
                              </Badge>
                              <div className="h-1 w-1 rounded-full bg-slate-700 text-left" />
                              <span className="text-xs text-slate-500 font-medium">{brief.ideas?.length || 0} strategic ideas</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end text-left">
                         {(Object.entries(formats) as Array<[string, number]>).map(([format, count]) => {
                           const Icon = formatIcons[format] || Sparkles
                           return (
                             <div key={format} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-left">
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{count} {format}s</span>
                             </div>
                           )
                         })}
                         <div className="hidden md:flex w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                            <ArrowUpRight className="w-5 h-5 text-blue-400 group-hover:text-white" />
                         </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="p-8 lg:p-12 bg-black/40 border-t border-white/5 pt-12 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                    <div className="space-y-10 text-left">
                       <div className="flex items-center gap-4 mb-8 text-left">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <div className="flex items-center gap-2 text-slate-500">
                             <Orbit className="w-4 h-4 animate-spin-slow" />
                             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Full Deployment Brief</span>
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent text-left" />
                       </div>
                       
                       {/* Pass the ID mapping to BriefList */}
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
