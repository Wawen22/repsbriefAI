'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Layers, 
  Hash, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  TrendingUp, 
  Info,
  Orbit,
  Star,
  ChevronRight,
  Maximize2,
  CalendarDays,
  Zap,
  Youtube,
  Rss
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SourceIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>

const SAMPLE_IDEAS = [
  {
    title: "Why 10K Steps Is a Scam (And What Actually Works)",
    hook: "Your step counter is lying to you. Here's what the science actually says about daily movement.",
    description: "Break down why the 10,000 steps recommendation was a marketing gimmick. Show what research says about NEAT, zone 2 cardio, and minimum effective dose for health.",
    format: "Reel" as const,
    whyItWorks: "Contrarian take on a universally accepted fact — high engagement bait with real science to back it up.",
    niche: "Fitness",
    sources: ["reddit", "google-trends"],
    scriptDraft: "[Scene: Holding a fitness tracker]\nNarrator: Stop obsessing over this number.\n[Cut to: Science paper screenshot]\nNarrator: Research shows that after 7,000 steps, benefits plateau. Here is what you should focus on instead..."
  },
  {
    title: "The $5 Meal Prep That Outperforms Most Supplements",
    hook: "I spent $5 at Lidl and made a meal that covers more micronutrients than a $60 greens powder.",
    description: "Full meal prep recipe with cost breakdown. Compare the nutrient profile to popular supplements. Use a side-by-side comparison chart.",
    format: "Carousel" as const,
    whyItWorks: "Combines budget-friendly appeal with supplement skepticism — two trending topics in fitness right now.",
    niche: "Fitness",
    sources: ["youtube", "rss"]
  },
  {
    title: "The 3 Exercises Every Desk Worker Should Do Daily",
    hook: "If you sit more than 6 hours a day, your hip flexors are plotting against you.",
    description: "Thread covering 3 corrective exercises for anterior pelvic tilt. Each exercise includes form cues and sets/reps.",
    format: "Thread" as const,
    whyItWorks: "Targets the huge overlap between fitness audience and remote workers. Posture content is evergreen.",
    niche: "Fitness",
    sources: ["reddit"]
  },
  {
    title: "The 'Lazy' Morning Routine for 2x Focus",
    hook: "Productivity isn't about waking up at 4 AM. It's about what you DON'T do in the first 60 minutes.",
    description: "Explain dopamine fasting in the morning. No phone, no coffee for 90 mins, just sunlight and 5 mins of planning.",
    format: "Newsletter" as const,
    whyItWorks: "Reverses the 'hustle culture' narrative which is currently seeing a massive backlash on social media.",
    niche: "Self-Improvement",
    sources: ["rss", "google-trends"]
  },
  {
    title: "How to Build a 'Second Brain' for Content Ideas",
    hook: "I stopped 'thinking' of ideas. Now I just collect them from my digital environment.",
    description: "A deep dive into capture systems using Notion or Obsidian. How to turn random comments into full-scale content strategies.",
    format: "Carousel" as const,
    whyItWorks: "Tool-based productivity is a high-CPM niche with very loyal engagement.",
    niche: "Tech & AI",
    sources: ["reddit", "youtube"]
  },
  {
    title: "The Future of AI: From Chatbots to Agents",
    hook: "ChatGPT was just the tutorial. We're moving from 'AI you talk to' to 'AI that works for you'.",
    description: "Explain the shift to autonomous agents. Give 3 examples of current tools that are already doing this.",
    format: "Reel" as const,
    whyItWorks: "High authority content that positions you as a forward-thinker in the fastest moving industry.",
    niche: "Tech & AI",
    sources: ["youtube", "google-trends"],
    scriptDraft: "[Visual: AI interface typing]\nNarrator: Stop thinking of AI as a search engine.\n[Visual: Automation flow]\nNarrator: The real revolution is happening here..."
  }
]

const FORMAT_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  'Reel': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  'Carousel': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Thread': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Newsletter': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Idea': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Strategy': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
}

const SourceBadge = ({ source }: { source: string }) => {
  const configs: Record<string, { icon: SourceIcon; color: string; bg: string; label: string }> = {
    'reddit': { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Reddit' },
    'youtube': { icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', label: 'YouTube' },
    'google-trends': { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Trends' },
    'rss': { icon: Rss, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'RSS' },
  }
  const config = configs[source] || { icon: Sparkles, color: 'text-slate-400', bg: 'bg-white/5', label: source }
  const Icon = config.icon
  return (
    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/5", config.bg)}>
      <Icon className={cn("w-2.5 h-2.5", config.color)} />
      <span className="text-[7px] font-black uppercase tracking-widest text-white/70">{config.label}</span>
    </div>
  )
}

export function SampleBriefButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="h-16 px-10 text-[10px] font-black uppercase tracking-[0.2em] border-white/10 bg-white/5 backdrop-blur-md text-slate-300 w-full sm:w-auto hover:bg-white/10 hover:text-white hover:border-white/20 transition-all rounded-full group"
        >
          <Sparkles className="mr-3 w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          See a Sample Brief
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] md:max-w-7xl max-h-[90vh] overflow-hidden p-0 bg-[#050505] border-white/10 text-slate-50 shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)] flex flex-col rounded-[3rem] border-solid">
        
        {/* Hidden but required for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>Weekly Brief Sample</DialogTitle>
          <DialogDescription>A sample of the weekly content briefing delivered to our subscribers.</DialogDescription>
        </DialogHeader>

        {/* Modal Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/[0.03] rounded-full blur-[120px] pointer-events-none" />

        {/* Header (Dashboard Style) */}
        <div className="p-10 border-b border-white/5 relative z-10 bg-black/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <Orbit className="w-6 h-6 text-blue-400 animate-[spin_4s_linear_infinite]" />
                </div>
                <div className="space-y-0.5">
                   <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                     Live Strategy Sample
                   </Badge>
                   <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Monday, March 9, 2026</p>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                The Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Reps</span>
              </h2>
              <p className="text-slate-400 text-lg font-light max-w-2xl leading-relaxed">
                20 high-impact content ideas, AI-filtered from the top 1% of digital trends. This is a snapshot of our latest strategic output.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
               <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
               <div className="flex flex-col">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">Analysis Verified</span>
                  <span className="text-[9px] text-emerald-500/60 uppercase font-bold tracking-tighter mt-1">98.4% Confidence Score</span>
               </div>
            </div>
          </div>
        </div>

        {/* Content Area (Dashboard Style Grid) */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SAMPLE_IDEAS.map((idea, i) => {
              const colors = FORMAT_COLORS[idea.format] || FORMAT_COLORS['Strategy']
              return (
                <div 
                  key={i} 
                  className="group bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-500 rounded-[2.5rem] overflow-hidden text-left flex flex-col h-full relative"
                >
                  <div className="p-8 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1", colors.bg, colors.text, colors.border)}>
                          {idea.format} Strategy
                        </Badge>
                        {idea.sources?.map(s => <SourceBadge key={s} source={s} />)}
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                            <Star className="w-4 h-4" />
                         </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300">
                      {idea.title}
                    </h3>
                  </div>

                  <div className="px-8 pb-6 space-y-4 flex-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">The Hook</span>
                      <p className="text-sm text-slate-200 leading-relaxed font-medium italic">&ldquo;{idea.hook}&rdquo;</p>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategy Preview</span>
                      <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-3">
                        {idea.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-8 pb-4 flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                     <div className="flex items-center gap-1.5">
                        <div className={cn("w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]", colors.text, "bg-current")} />
                        <span>AI Verified</span>
                     </div>
                     {idea.scriptDraft && (
                       <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                          <span>Script Ready</span>
                       </div>
                     )}
                  </div>

                  <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="ghost" 
                        className="h-10 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest gap-2"
                      >
                        <Maximize2 className="w-4 h-4" />
                        Preview Studio
                      </Button>
                    </div>
                    <div className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                       Draft Mode
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="py-20 flex flex-col items-center text-center">
             <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                <Info className="w-10 h-10 text-slate-700" />
             </div>
             <h4 className="text-3xl font-bold mb-4 tracking-tight">And 14 more strategic ideas...</h4>
             <p className="text-slate-500 max-w-md text-lg font-light leading-relaxed">
               Every Monday morning, your workspace is updated with 20 fresh strategies tailored to your niche.
             </p>
          </div>
        </div>

        {/* Footer CTA (Studio Style) */}
        <div className="p-10 bg-black border-t border-white/5 relative z-20 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            <div className="text-left space-y-1">
              <p className="text-2xl font-black text-white tracking-tighter uppercase">Ready to scale your content?</p>
              <p className="text-slate-500 font-medium tracking-tight">Join high-impact studios getting ahead with strategic data.</p>
            </div>
            <Button className="w-full md:w-auto bg-white text-black hover:bg-slate-200 px-10 h-16 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 group" asChild>
              <a href="/signup">
                Claim Your Workspace
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
