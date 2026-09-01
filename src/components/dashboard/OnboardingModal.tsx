'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BrainCircuit, Zap, LayoutGrid, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { completeOnboardingAction } from "@/app/actions/profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface OnboardingModalProps {
  userName: string
}

const STEPS = [
  {
    id: 'voice',
    badge: 'Step 01 — Your Identity',
    badgeColor: 'text-emerald-400',
    icon: <BrainCircuit className="w-10 h-10 text-emerald-400" />,
    glowColor: 'bg-emerald-600/[0.05]',
    title: 'Train Your AI Voice',
    description: 'The AI writes in YOUR voice. Upload writing samples so every strategy sounds exactly like you — not a robot. This is what makes RepsBrief personal.',
    cta: 'Set Up My Voice',
    ctaStyle: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
  },
  {
    id: 'generate',
    badge: 'Step 02 — Market Intelligence',
    badgeColor: 'text-blue-400',
    icon: <Zap className="w-10 h-10 text-blue-400" />,
    glowColor: 'bg-blue-600/[0.05]',
    title: 'Generate Your First Brief',
    description: 'Generate 20 content strategies informed by available YouTube and RSS signals.',
    cta: 'Generate Now',
    ctaStyle: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
  },
  {
    id: 'kanban',
    badge: 'Step 03 — Production Pipeline',
    badgeColor: 'text-purple-400',
    icon: <LayoutGrid className="w-10 h-10 text-purple-400" />,
    glowColor: 'bg-purple-600/[0.05]',
    title: 'Move an Idea to Production',
    description: "The Kanban board is your content pipeline. Drag ideas from Backlog → In Progress → Done to track what you're publishing.",
    cta: 'Go to My Ideas',
    ctaStyle: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20',
  },
]

export function OnboardingModal({ userName }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const current = STEPS[step]

  const handleSkip = async () => {
    setIsOpen(false)
    await completeOnboardingAction()
    router.refresh()
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleCTA = async () => {
    if (current.id === 'voice') {
      setIsOpen(false)
      await completeOnboardingAction()
      router.refresh()
      router.push('/dashboard/settings?tab=voice')
    } else if (current.id === 'generate') {
      setGenerating(true)
      try {
        const res = await fetch('/api/generator/generate-now', { method: 'POST' })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Generation failed. Try again.')
          setGenerating(false)
          return
        }
        setIsOpen(false)
        await completeOnboardingAction()
        router.refresh()
      } catch {
        toast.error('Generation failed. Please try again.')
        setGenerating(false)
      }
    } else if (current.id === 'kanban') {
      setIsOpen(false)
      await completeOnboardingAction()
      router.refresh()
      router.push('/dashboard/ideas')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl p-0 bg-[#050505] border-white/10 overflow-hidden rounded-[3rem] shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to RepsBrief</DialogTitle>
          <DialogDescription>Get started in 3 steps.</DialogDescription>
        </DialogHeader>

        {/* Background glow */}
        <div className={cn("absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-colors duration-700", current.glowColor)} />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <div className="p-10 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Sparkles className="w-3 h-3" /> Studio Setup
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest h-8 border border-white/10 hover:border-white/20">
                Skip all
              </Button>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{userName || 'Creator'}</span>.
              </h2>
              <p className="text-slate-500 text-sm font-light mt-1">3 steps to your first content strategy.</p>
            </div>
          </div>

          {/* Step content */}
          <div className="px-10 py-6">
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2rem] p-8 space-y-5 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  {current.icon}
                </div>
                <div className="space-y-1.5">
                  <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-widest border-none px-0", current.badgeColor)}>
                    {current.badge}
                  </Badge>
                  <h3 className="text-2xl font-black text-white tracking-tight">{current.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{current.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 pb-10 pt-2 flex items-center justify-between gap-4">
            {/* Step dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === step ? "w-8 bg-blue-500" : i < step ? "w-3 bg-white/30" : "w-3 bg-white/10"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {step < STEPS.length - 1 && (
                <Button variant="ghost" onClick={handleNext} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                  Next →
                </Button>
              )}
              <Button
                onClick={handleCTA}
                disabled={generating}
                className={cn(
                  "rounded-full px-7 h-12 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 group",
                  current.ctaStyle
                )}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <>{current.cta} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
