'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Video, Layers, Hash, Mail, X } from 'lucide-react'

const SAMPLE_IDEAS = [
  {
    title: "Why 10K Steps Is a Scam (And What Actually Works)",
    hook: "Your step counter is lying to you. Here's what the science actually says about daily movement.",
    description: "Break down why the 10,000 steps recommendation was a marketing gimmick from a Japanese pedometer company. Show what research says about NEAT, zone 2 cardio, and minimum effective dose for health.",
    format: "Reel" as const,
    whyItWorks: "Contrarian take on a universally accepted 'fact' — high engagement bait with real science to back it up.",
  },
  {
    title: "The $5 Meal Prep That Outperforms Most Supplements",
    hook: "I spent $5 at Lidl and made a meal that covers more micronutrients than a $60 greens powder.",
    description: "Show a full meal prep recipe with cost breakdown per serving. Compare the nutrient profile to popular supplements. Use a side-by-side carousel of nutrients covered vs a typical greens powder.",
    format: "Carousel" as const,
    whyItWorks: "Combines budget-friendly appeal with supplement skepticism — two trending topics in fitness right now.",
  },
  {
    title: "The 3 Exercises Every Desk Worker Should Do Daily",
    hook: "If you sit more than 6 hours a day, your hip flexors are plotting against you.",
    description: "Thread covering 3 corrective exercises for anterior pelvic tilt and rounded shoulders. Each exercise includes form cues, sets/reps, and a visual reference. End with a before/after posture comparison.",
    format: "Thread" as const,
    whyItWorks: "Targets the huge overlap between fitness audience and remote workers. Posture content is evergreen and highly shareable.",
  },
  {
    title: "What I Learned Tracking Every Macro for 365 Days",
    hook: "One year of weighing food. Here's the uncomfortable truth nobody talks about.",
    description: "A deep dive into the psychological and physical lessons from a full year of macro tracking. Cover the benefits (awareness, precision), the downsides (obsession, social friction), and who should and shouldn't do it.",
    format: "Newsletter" as const,
    whyItWorks: "Personal story + data = the most engaging newsletter format. Long-form allows nuance that short content can't capture.",
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
    <>
      <Button
        size="lg"
        variant="outline"
        className="h-14 px-8 text-lg border-slate-700 text-slate-300 w-full sm:w-auto hover:bg-slate-900"
        onClick={() => setOpen(true)}
      >
        See a Sample Brief
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              Sample Brief — Fitness & Nutrition
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">Preview</Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This is what your Monday morning looks like with RepsBrief. 4 of 20 ideas shown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {SAMPLE_IDEAS.map((idea, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 gap-1.5 font-medium text-xs">
                    {formatIcons[idea.format]}
                    {idea.format}
                  </Badge>
                  <span className="text-xs text-slate-600">Idea {i + 1}/20</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{idea.title}</h3>
                <p className="text-sm italic text-blue-100/90 border-l-2 border-blue-500/30 pl-3">
                  &ldquo;{idea.hook}&rdquo;
                </p>
                <p className="text-sm text-slate-400">{idea.description}</p>
                <div className="pt-2 border-t border-slate-800 flex items-start gap-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Why it works</span>
                  <p className="text-[12px] text-emerald-400/80 italic leading-snug">{idea.whyItWorks}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-800 mt-2">
            <p className="text-sm text-slate-500">+ 16 more ideas in your full brief</p>
            <Button className="bg-blue-600 hover:bg-blue-700 px-8" asChild>
              <a href="/signup">Get Your First Brief Free</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
