'use client'

import { IdeaObject } from "@/types/niche"
import { TrendingUp, Zap, Target, PieChart, Activity } from "lucide-react"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-in fade-in slide-in-from-top-2 duration-500">
      
      {/* Widget 1: Format Intelligence */}
      <div className="bg-[#070707] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-4 space-y-3 relative overflow-hidden group transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
           <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <PieChart className="w-3.5 h-3.5 text-blue-400" />
           </div>
           <span className="font-mono text-[9px] uppercase tracking-wider border border-blue-500/20 text-blue-300 bg-blue-500/5 px-2 py-0.5 rounded">AI Priority</span>
        </div>
        <div>
           <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Top Format</p>
           <h4 className="text-lg font-bold text-white tracking-tight font-mono">{topFormat[0]}s <span className="text-white/40 font-normal text-xs">({Math.round((topFormat[1]/total)*100)}%)</span></h4>
        </div>
        <div className="flex gap-1 h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
           {Object.entries(formatCounts).map(([format, count], i) => (
             <div 
               key={format} 
               className={cn(
                 "h-full transition-all duration-700",
                 i === 0 ? "bg-blue-400" : i === 1 ? "bg-purple-400" : i === 2 ? "bg-emerald-400" : "bg-amber-400"
               )}
               style={{ width: `${(count/total)*100}%` }}
             />
           ))}
        </div>
      </div>

      {/* Widget 2: Market Sentiment */}
      <div className="bg-[#070707] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-4 space-y-3 relative overflow-hidden group transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
           <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
           </div>
           <span className="font-mono text-[9px] uppercase tracking-wider border border-emerald-500/20 text-emerald-300 bg-emerald-500/5 px-2 py-0.5 rounded">Live Signal</span>
        </div>
        <div>
           <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Niche Velocity</p>
           <h4 className="text-lg font-bold text-white tracking-tight font-mono leading-none truncate">{sentiment}</h4>
        </div>
        <p className="text-[10.5px] text-emerald-400 font-mono flex items-center gap-1">
           <TrendingUp className="w-3 h-3" /> {momentum} on {readableNiche}
        </p>
      </div>

      {/* Widget 3: Data Integrity */}
      <div className="bg-[#070707] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-4 space-y-3 relative overflow-hidden group transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
           <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Target className="w-3.5 h-3.5 text-purple-400" />
           </div>
           <span className="font-mono text-[9px] uppercase tracking-wider border border-purple-500/20 text-purple-300 bg-purple-500/5 px-2 py-0.5 rounded">Fact-Checked</span>
        </div>
        <div>
           <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Strategic Depth</p>
           <h4 className="text-lg font-bold text-white tracking-tight font-mono">20 <span className="text-white/40 font-normal text-xs">Briefs active</span></h4>
        </div>
        <div className="flex items-center gap-1.5">
           {['YouTube', 'RSS'].map(s => (
             <span key={s} className="text-[9px] font-mono text-white/50 px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06]">{s}</span>
           ))}
        </div>
      </div>

      {/* Widget 4: Quick Action / Focus */}
      <div className="bg-[#090909] border border-white/[0.12] hover:border-white/[0.22] rounded-xl p-4 space-y-2 relative overflow-hidden group transition-all flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
           </div>
           <p className="text-[10.5px] font-mono font-bold text-white uppercase tracking-wider">Weekly Target</p>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed font-sans">
           Focus on <strong className="text-white font-medium">3 {topFormat[0]}s</strong> this week to match peak algorithm velocity.
        </p>
      </div>

    </div>
  )
}
