// src/components/dashboard/GenerateNowButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Sparkles, Orbit, Search, BarChart3, Brain, Database, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUpgradeModal } from '@/components/ui/UpgradeModal'

const STEPS = [
  { id: 'scrape', label: 'Signal Extraction', icon: Search, sub: 'Scraping Reddit & YouTube view velocity...' },
  { id: 'trends', label: 'Trend Correlation', icon: BarChart3, sub: 'Cross-referencing Google Trends data...' },
  { id: 'analyze', label: 'AI Synthesis', icon: Brain, sub: 'Clustering topics and drafting hooks...' },
  { id: 'finalize', label: 'Brief Validation', icon: Database, sub: 'Optimizing for high-engagement formats...' },
]

type State = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'

interface GenerateNowButtonProps {
  alreadyGeneratedToday?: boolean
  plan?: string
}

export function GenerateNowButton({ alreadyGeneratedToday = false, plan }: GenerateNowButtonProps) {
  const router = useRouter()
  const [state, setState] = useState<State>(alreadyGeneratedToday ? 'rate_limited' : 'idle')
  const isStarter = !plan || plan === 'starter'
  const openUpgrade = useUpgradeModal((s) => s.open)
  const [currentStep, setCurrentStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  // Simulation of steps progression while waiting for the real API
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (state === 'loading') {
      const runSimulation = () => {
        if (currentStep < STEPS.length - 1) {
          timeout = setTimeout(() => {
            setCurrentStep(prev => prev + 1)
          }, 7000) // Transition steps every 7s (total ~28s)
        }
      }
      runSimulation()
    }
    return () => clearTimeout(timeout)
  }, [state, currentStep])

  const handleGenerate = async () => {
    setState('loading')
    setCurrentStep(0)
    setLogs(['> Initializing content engine...', '> Target Niche: Fitness & Nutrition'])

    try {
      // Start the real request
      const resPromise = fetch('/api/generator/generate-now', { method: 'POST' })
      
      // Add logs dynamically
      setTimeout(() => setLogs(prev => [...prev, '> Accessing Reddit API...', '> Scanning r/fitness, r/nutrition...']), 2000)
      setTimeout(() => setLogs(prev => [...prev, '> YouTube Data API connected.', '> High view-velocity detected in 14 videos.']), 5000)
      setTimeout(() => setLogs(prev => [...prev, '> Cross-referencing Google Trends breakout queries...']), 9000)
      setTimeout(() => setLogs(prev => [...prev, '> Passing 42 raw signals to AI Strategist...']), 14000)

      const res = await resPromise
      const data = await res.json()

      if (res.status === 429) {
        setState('rate_limited')
        toast.info('Daily limit reached. Come back tomorrow!')
        return
      }

      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setState('success')
      setLogs(prev => [...prev, '> Brief validated.', `> ${isStarter ? '5' : '20'} ideas ready for deployment.`])
      toast.success(`Success! ${isStarter ? '5 ideas unlocked' : '20 ideas generated'}.`, {
        icon: <Sparkles className="w-4 h-4 text-blue-400" />
      })

      setTimeout(() => router.refresh(), 1200)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setErrorMsg(message)
      setState('error')
      toast.error(message)
      setTimeout(() => setState('idle'), 5000)
    }
  }

  if (state === 'rate_limited') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            {isStarter
              ? 'Weekly brief generated. Next one available Monday.'
              : 'Daily brief already generated. New ideas available tomorrow.'}
          </span>
        </div>
        {isStarter && (
          <button
            onClick={() => openUpgrade('Daily Briefs')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors"
          >
            Upgrade to Pro for daily briefs →
          </button>
        )}
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-10 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden shadow-2xl">
        {/* Animated background lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-scan-slow" />
           <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent animate-scan-slow delay-700" />
           <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-scan-slow delay-300" />
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          {/* Steps Progress */}
          <div className="flex-1 space-y-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isPast = idx < currentStep
              const isCurrent = idx === currentStep
              
              return (
                <div key={step.id} className={cn(
                  "flex items-start gap-4 transition-all duration-500",
                  isPast || isCurrent ? "opacity-100" : "opacity-30"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                    isPast ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : 
                    isCurrent ? "bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" : 
                    "bg-white/5 border-white/10 text-slate-500"
                  )}>
                    {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className={cn(
                      "font-bold text-sm tracking-tight",
                      isCurrent ? "text-white" : isPast ? "text-emerald-400/80" : "text-slate-500"
                    )}>{step.label}</h4>
                    {isCurrent && (
                      <p className="text-[11px] text-blue-400 animate-in fade-in slide-in-from-left-2 duration-500">{step.sub}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Terminal / Log */}
          <div className="w-full md:w-64 bg-black/60 rounded-2xl border border-white/5 p-4 font-mono text-[10px] space-y-1.5 h-48 overflow-hidden relative">
             <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
             </div>
             <div className="space-y-1 text-slate-500">
                {logs.map((log, i) => (
                  <p key={i} className={cn(
                    "animate-in fade-in slide-in-from-bottom-1 duration-300",
                    log.startsWith('>') ? "text-slate-400" : "text-blue-400"
                  )}>{log}</p>
                ))}
                <div className="w-1.5 h-3 bg-blue-500 animate-pulse inline-block align-middle ml-1" />
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
           <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4 text-blue-500 animate-[spin_4s_linear_infinite]" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Neural Engine Processing</span>
           </div>
           <p className="text-[10px] text-slate-500 font-medium italic">Estimated completion: {30 - (currentStep * 7)}s</p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-sparkle">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Strategy Brief Ready</h3>
          <p className="text-slate-400">Your custom content plan has been deployed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        onClick={handleGenerate}
        className="group bg-blue-600 hover:bg-blue-500 text-white h-14 px-10 rounded-full text-lg font-black shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 gap-3 animate-float"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        Generate My Brief Now
      </Button>

      {state === 'error' && (
        <p className="text-xs text-rose-400 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg || 'Generation failed — check your connection'}
        </p>
      )}
    </div>
  )
}
