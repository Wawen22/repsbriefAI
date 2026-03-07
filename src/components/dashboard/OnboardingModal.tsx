'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Zap, 
  Orbit, 
  Video, 
  BrainCircuit, 
  ArrowRight, 
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  Lock,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { completeOnboardingAction } from "@/app/actions/profile"
import { useRouter } from "next/navigation"

interface OnboardingModalProps {
  userName: string
}

export function OnboardingModal({ userName }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState(1)
  const router = useRouter()

  const handleClose = async () => {
    setIsOpen(false)
    await completeOnboardingAction()
  }

  const handleGoToPersona = async () => {
    setIsOpen(false)
    await completeOnboardingAction()
    router.push('/dashboard/settings?tab=voice')
  }

  const steps = [
    {
      title: "Discover Trending Intel",
      desc: "Every Monday, RepsBrief delivers 20 high-impact content strategies based on live trends from Reddit, YouTube, and Google Trends.",
      icon: <Orbit className="w-10 h-10 text-blue-400" />,
      badge: "Market Intelligence",
      color: "blue"
    },
    {
      title: "The Production Studio",
      desc: "Click any idea to enter the Full-Screen Studio. AI will draft your script, remix strategies, and provide a live Teleprompter.",
      icon: <Video className="w-10 h-10 text-purple-400" />,
      badge: "Creator Workflow",
      color: "purple"
    },
    {
      title: "AI Brand Persona",
      desc: "Train the AI on your unique voice. Upload writing samples so every strategy sounds exactly like you, not a robot.",
      icon: <BrainCircuit className="w-10 h-10 text-emerald-400" />,
      badge: "Your Identity",
      color: "emerald"
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl p-0 bg-[#050505] border-white/10 overflow-hidden rounded-[3rem] shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to RepsBrief Studio</DialogTitle>
          <DialogDescription>A quick guide to mastering your new content workflow.</DialogDescription>
        </DialogHeader>

        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/[0.05] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
          
          {/* Header */}
          <div className="p-10 pb-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
               <Sparkles className="w-3 h-3" />
               Studio Onboarding
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{userName || 'Creator'}</span>.
            </h2>
            <p className="text-slate-500 text-lg font-light">Let&apos;s set up your new strategic workflow in 30 seconds.</p>
          </div>

          {/* Steps Content */}
          <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6 custom-scrollbar">
             <div className="grid gap-4">
                {steps.map((s, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "group relative p-6 rounded-[2rem] border transition-all duration-500 flex items-start gap-6",
                      step === i + 1 
                        ? "bg-white/[0.03] border-white/10 shadow-2xl" 
                        : "bg-transparent border-transparent opacity-40 grayscale"
                    )}
                    onMouseEnter={() => setStep(i + 1)}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                      step === i + 1 ? "bg-white/5 scale-110 shadow-xl" : "bg-white/[0.02]"
                    )}>
                      {s.icon}
                    </div>
                    <div className="space-y-1">
                       <Badge variant="outline" className={cn(
                         "text-[9px] uppercase font-black tracking-widest border-none px-0 mb-1",
                         s.color === 'blue' && "text-blue-400",
                         s.color === 'purple' && "text-purple-400",
                         s.color === 'emerald' && "text-emerald-400",
                       )}>
                         Step 0{i + 1}: {s.badge}
                       </Badge>
                       <h3 className="text-xl font-bold text-white tracking-tight">{s.title}</h3>
                       <p className="text-sm text-slate-400 leading-relaxed font-light">{s.desc}</p>
                    </div>
                    {step === i + 1 && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>

          {/* Footer CTA */}
          <div className="p-10 bg-black/40 backdrop-blur-xl border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      step === i ? "w-8 bg-blue-500" : "w-2 bg-white/10"
                    )} 
                  />
                ))}
             </div>
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={handleClose}
                  className="flex-1 sm:flex-none text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                >
                  Skip
                </Button>
                <Button 
                  onClick={handleGoToPersona}
                  className="flex-1 sm:flex-none bg-white text-black hover:bg-slate-200 rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                >
                  Configure Persona
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
