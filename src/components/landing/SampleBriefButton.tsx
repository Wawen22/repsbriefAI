'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Video, Layers, Hash, Mail, Sparkles, ArrowRight, Lightbulb, TrendingUp, Info } from 'lucide-react'

const SAMPLE_IDEAS = [
  {
    title: "Why 10K Steps Is a Scam (And What Actually Works)",
    hook: "Your step counter is lying to you. Here's what the science actually says about daily movement.",
    description: "Break down why the 10,000 steps recommendation was a marketing gimmick. Show what research says about NEAT, zone 2 cardio, and minimum effective dose for health.",
    format: "Reel" as const,
    whyItWorks: "Contrarian take on a universally accepted 'fact' — high engagement bait with real science to back it up.",
    trend: "+240% breakout"
  },
  {
    title: "The $5 Meal Prep That Outperforms Most Supplements",
    hook: "I spent $5 at Lidl and made a meal that covers more micronutrients than a $60 greens powder.",
    description: "Full meal prep recipe with cost breakdown. Compare the nutrient profile to popular supplements. Use a side-by-side comparison chart.",
    format: "Carousel" as const,
    whyItWorks: "Combines budget-friendly appeal with supplement skepticism — two trending topics in fitness right now.",
    trend: "High Intent"
  },
  {
    title: "The 3 Exercises Every Desk Worker Should Do Daily",
    hook: "If you sit more than 6 hours a day, your hip flexors are plotting against you.",
    description: "Thread covering 3 corrective exercises for anterior pelvic tilt. Each exercise includes form cues and sets/reps.",
    format: "Thread" as const,
    whyItWorks: "Targets the huge overlap between fitness audience and remote workers. Posture content is evergreen.",
    trend: "Viral Potential"
  },
]

const formatIcons: Record<string, React.ReactNode> = {
  Reel: <Video className="w-3.5 h-3.5" />,
  Carousel: <Layers className="w-3.5 h-3.5" />,
  Thread: <Hash className="w-3.5 h-3.5" />,
  Newsletter: <Mail className="w-3.5 h-3.5" />,
}

export function SampleBriefButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="h-14 px-8 text-base border-white/10 bg-white/5 backdrop-blur-md text-slate-300 w-full sm:w-auto hover:bg-white/10 hover:text-white hover:border-white/20 transition-all rounded-full group"
        >
          <Sparkles className="mr-2 w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          See a Sample Brief
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-black border-white/10 text-slate-50 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col">
        
        {/* Modal Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="p-8 pb-4 relative z-10">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                Monday Morning Briefing
              </Badge>
            </div>
            <DialogTitle className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Your Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">RepsBrief</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base max-w-2xl">
              This is exactly what our subscribers receive every Monday. Data-backed, trend-verified, and ready to record.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 relative z-10 custom-scrollbar">
          {SAMPLE_IDEAS.map((idea, i) => (
            <div key={i} className="group relative">
              {/* Card Decoration */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 transition-all duration-300 group-hover:bg-white/[0.05] group-hover:border-white/20">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      {formatIcons[idea.format]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                        {idea.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-white/5 text-slate-400 hover:bg-white/10 transition-colors text-[10px] px-1.5 py-0 border-none">
                          {idea.format}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          {idea.trend}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Idea {i + 1}/20</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full opacity-50" />
                    <p className="pl-5 text-base italic text-slate-200 leading-relaxed font-light">
                      &ldquo;{idea.hook}&rdquo;
                    </p>
                  </div>
                  
                  <p className="text-sm text-slate-400 leading-relaxed pl-5">
                    {idea.description}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Strategist Note</span>
                    </div>
                    <p className="text-xs text-slate-400 italic leading-snug">
                      {idea.whyItWorks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="py-12 flex flex-col items-center text-center">
             <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 animate-pulse">
                <Info className="w-8 h-8 text-blue-400" />
             </div>
             <h4 className="text-xl font-bold mb-2">And 17 more ideas...</h4>
             <p className="text-slate-500 max-w-sm">Every Monday morning, your content plan is ready before you even wake up.</p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-8 bg-gradient-to-t from-blue-900/20 to-transparent border-t border-white/10 relative z-20 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-white mb-1">Ready to scale your content?</p>
              <p className="text-sm text-slate-400">Join 500+ creators getting ahead with data.</p>
            </div>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 group" asChild>
              <a href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
