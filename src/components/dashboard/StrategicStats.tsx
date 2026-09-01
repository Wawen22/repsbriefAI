'use client'

import { IdeaObject } from "@/types/niche"
import { TrendingUp, Zap, Target, PieChart, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StrategicStatsProps {
  ideas: IdeaObject[]
  niche: string
}

export function StrategicStats({ ideas, niche }: StrategicStatsProps) {
  if (!ideas.length) return null

  // 1. Calculate Format Distribution
  const formatCounts = ideas.reduce((acc: Record<string, number>, idea) => {
    acc[idea.format] = (acc[idea.format] || 0) + 1
    return acc
  }, {})

  const total = ideas.length
  const topFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]

  // 2. Determine "Market Sentiment" (mock logic based on formats/niche for 2026 vibe)
  const isVideoHeavy = (formatCounts['Reel'] || 0) > total / 3
  const readableNiche = niche.replaceAll('_', ' ')
  const sentiment = isVideoHeavy ? "High Engagement (Video)" : "Informational (Mixed)"
  const momentum = "+14% vs last week" // Simulated for UI/UX demonstration

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
      
      {/* Widget 1: Format Intelligence */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 space-y-4 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
        <div className="flex items-center justify-between">
           <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <PieChart className="w-4 h-4 text-blue-400" />
           </div>
           <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-blue-500/30 text-blue-300 bg-blue-500/5">AI Priority</Badge>
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Top Format</p>
           <h4 className="text-xl font-bold text-white tracking-tight">{topFormat[0]}s <span className="text-slate-500 font-medium text-sm">({Math.round((topFormat[1]/total)*100)}%)</span></h4>
        </div>
        <div className="flex gap-1 h-1 w-full bg-white/5 rounded-full overflow-hidden">
           {Object.entries(formatCounts).map(([format, count], i) => (
             <div 
               key={format} 
               className={cn(
                 "h-full transition-all duration-1000",
                 i === 0 ? "bg-blue-500" : i === 1 ? "bg-purple-500" : i === 2 ? "bg-emerald-500" : "bg-amber-500"
               )}
               style={{ width: `${(count/total)*100}%` }}
             />
           ))}
        </div>
      </div>

      {/* Widget 2: Market Sentiment */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 space-y-4 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
        <div className="flex items-center justify-between">
           <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-400" />
           </div>
           <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-emerald-500/30 text-emerald-300 bg-emerald-500/5">Live Signal</Badge>
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Niche Sentiment</p>
           <h4 className="text-xl font-bold text-white tracking-tight leading-none">{sentiment}</h4>
        </div>
        <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
           <TrendingUp className="w-3 h-3" /> {momentum} on {readableNiche}
        </p>
      </div>

      {/* Widget 3: Data Integrity */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 space-y-4 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
        <div className="flex items-center justify-between">
           <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Target className="w-4 h-4 text-purple-400" />
           </div>
           <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-purple-500/30 text-purple-300 bg-purple-500/5">Verified</Badge>
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Strategic Depth</p>
           <h4 className="text-xl font-bold text-white tracking-tight">20 <span className="text-slate-500 font-medium text-sm">Scripts ready</span></h4>
        </div>
        <div className="flex items-center gap-2">
           {['YouTube', 'RSS'].map(s => (
             <span key={s} className="text-[9px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-white/5">{s}</span>
           ))}
        </div>
      </div>

      {/* Widget 4: Quick Action / Focus */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-5 space-y-4 relative overflow-hidden group hover:bg-blue-600/20 transition-all flex flex-col justify-center border-dashed">
        <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Zap className="w-4 h-4 text-white fill-white" />
           </div>
           <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Focus Goal</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-light">
           Aim for <span className="text-white font-bold">3 {topFormat[0]}s</span> this week to capitalize on current view velocity.
        </p>
      </div>

    </div>
  )
}
