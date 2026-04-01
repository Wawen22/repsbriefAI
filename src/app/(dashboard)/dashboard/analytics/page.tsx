// src/app/(dashboard)/dashboard/analytics/page.tsx

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import type { ComponentType, SVGProps } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Video, 
  Layers, 
  Hash, 
  Mail, 
  Star, 
  ArrowUpRight, 
  Clock,
  Eye,
  CheckCircle2,
  LayoutGrid,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const FORMAT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'Reel': Video,
  'Carousel': Layers,
  'Thread': Hash,
  'Newsletter': Mail,
  'Idea': LightbulbIcon
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.1.7.9 1.2 1.7 1.5 2.9" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const profile = await getCachedProfile(user.id)
  const teamId = profile?.current_team_id

  // Fetch published ideas with performance data
  const { data: publishedIdeas } = await supabase
    .from('idea_history')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const ideas = publishedIdeas || []
  const totalPublished = ideas.length
  const totalViews = ideas.reduce((acc, curr) => acc + (curr.views_count || 0), 0)
  const avgScore = ideas.length > 0 
    ? (ideas.reduce((acc, curr) => acc + (curr.performance_score || 0), 0) / ideas.length).toFixed(1)
    : 0

  // Aggregate by format
  const formatStats = ideas.reduce((acc: Record<string, { count: number; views: number; score: number }>, curr) => {
    const data = curr.idea_data as IdeaObject
    const format = data?.format || 'Idea'
    if (!acc[format]) {
      acc[format] = { count: 0, views: 0, score: 0 }
    }
    acc[format].count += 1
    acc[format].views += (curr.views_count || 0)
    acc[format].score += (curr.performance_score || 0)
    return acc
  }, {})

  const formatList = Object.keys(formatStats).map(format => ({
    name: format,
    ...formatStats[format],
    avgScore: (formatStats[format].score / formatStats[format].count).toFixed(1)
  })).sort((a, b) => b.views - a.views)

  const topPerformer = [...ideas].sort((a, b) => (b.views_count || 0) - (a.views_count || 0))[0]

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-20 text-white">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
             <BarChart3 className="w-3.5 h-3.5" />
             Performance Engine
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Analytics Dashboard</h1>
          <p className="text-slate-500 text-lg font-light">Track how your strategies perform across social platforms.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Global Health</p>
              <p className="text-xl font-black text-emerald-400">92% Optimal</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
           </div>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Published Strategies', val: totalPublished, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Tracked Views', val: totalViews.toLocaleString(), icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Avg Performance', val: `${avgScore}/5.0`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' }
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
             <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", s.bg)}>
                <s.icon className={cn("w-8 h-8", s.color)} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Format Performance Bar Chart (Custom CSS) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Format Distribution</h3>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[9px] uppercase font-bold text-slate-500">By Total Views</Badge>
           </div>
           
           <Card className="bg-black/40 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
              <CardContent className="p-10 space-y-10">
                 {formatList.length === 0 ? (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                         <Clock className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-medium">No published data yet. Mark some ideas as &quot;Published&quot; to see stats.</p>
                   </div>
                 ) : (
                   formatList.map((f, i) => {
                     const Icon = FORMAT_ICONS[f.name] || LayoutGrid
                     const percentage = Math.max(10, (f.views / totalViews) * 100)
                     
                     return (
                       <div key={i} className="space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                   <Icon className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="font-bold text-white uppercase text-xs tracking-widest">{f.name}s</span>
                             </div>
                             <div className="text-right">
                                <span className="text-xs font-black text-white">{f.views.toLocaleString()} Views</span>
                                <span className="text-[10px] text-slate-500 block">Avg. Score: {f.avgScore}</span>
                             </div>
                          </div>
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000" 
                               style={{ width: `${percentage}%` }}
                             />
                          </div>
                       </div>
                     )
                   })
                 )}
              </CardContent>
           </Card>
        </div>

        {/* Top Performer Card */}
        <div className="space-y-6">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Top Performer</h3>
           <Card className="bg-gradient-to-br from-blue-600/20 via-black to-black border-blue-500/30 rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <Star className="w-48 h-48" />
              </div>
              <CardContent className="p-10 flex flex-col h-full space-y-8 relative z-10">
                 {topPerformer ? (
                   <>
                     <div className="space-y-2">
                        <Badge className="bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none">
                           Highest Impact
                        </Badge>
                        <h4 className="text-2xl font-bold tracking-tight text-white leading-tight">
                           {topPerformer.idea_title}
                        </h4>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Views</p>
                           <p className="text-lg font-black text-white">{topPerformer.views_count?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</p>
                           <p className="text-lg font-black text-amber-400">{topPerformer.performance_score}.0</p>
                        </div>
                     </div>

                     <div className="pt-4 mt-auto">
                        <Link href={`/dashboard/strategy/${topPerformer.id}`}>
                           <Button className="w-full bg-white text-black hover:bg-slate-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-12 shadow-2xl">
                              Review Strategy <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                           </Button>
                        </Link>
                     </div>
                   </>
                 ) : (
                   <div className="py-20 text-center opacity-40">
                      <p className="text-xs font-bold uppercase tracking-widest">No data available</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Recent History Table Style List */}
      <section className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Publications</h3>
            <Link href="/dashboard/history" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
               Full History <ChevronRight className="w-3 h-3" />
            </Link>
         </div>

         <div className="space-y-3">
            {ideas.slice(0, 5).map((idea, i) => (
              <div 
                key={i} 
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                       {(() => {
                         const ideaData = idea.idea_data as Partial<IdeaObject> | null
                         const Icon = FORMAT_ICONS[ideaData?.format || ''] || LayoutGrid
                         return <Icon className="w-5 h-5 text-slate-500" />
                       })()}
                    </div>
                    <div>
                       <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{idea.idea_title}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          Published on {new Date(idea.published_at).toLocaleDateString()}
                       </p>
                    </div>
                 </div>

                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Performance</p>
                       <div className="flex items-center gap-1 justify-end">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="font-black text-white">{idea.performance_score}.0</span>
                       </div>
                    </div>
                    <div className="text-right min-w-[80px]">
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reach</p>
                       <p className="font-black text-white">{idea.views_count?.toLocaleString()}</p>
                    </div>
                    <Link href={`/dashboard/strategy/${idea.id}`}>
                       <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-white hover:bg-white/5">
                          <ArrowUpRight className="w-4 h-4" />
                       </Button>
                    </Link>
                 </div>
              </div>
            ))}

            {ideas.length === 0 && (
              <div className="bg-white/[0.01] border border-dashed border-white/10 p-20 rounded-[3rem] text-center">
                 <p className="text-slate-600 font-medium italic">Your publication history is empty.</p>
              </div>
            )}
         </div>
      </section>

    </div>
  )
}
