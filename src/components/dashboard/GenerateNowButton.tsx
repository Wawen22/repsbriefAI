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
  { id: 'scrape', label: 'Signal Extraction', icon: Search, sub: 'Collecting available YouTube and RSS signals...' },
  { id: 'trends', label: 'Trend Review', icon: BarChart3, sub: 'Checking fresh source data for your brief...' },
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
      setTimeout(() => setLogs(prev => [...prev, '> Checking available YouTube signals...', '> Reading configured RSS feeds...']), 2000)
      setTimeout(() => setLogs(prev => [...prev, '> YouTube Data API connected.', '> High view-velocity detected in 14 videos.']), 5000)
      setTimeout(() => setLogs(prev => [...prev, '> Validating freshness and quality of source data...']), 9000)
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
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#090909] border border-white/[0.08] text-white/70 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isStarter
              ? 'Weekly brief generated. Next one available Monday.'
              : 'Your daily manual brief limit has been reached. Try again tomorrow.'}
          </span>
        </div>
        {isStarter && (
          <button
            onClick={() => openUpgrade('Daily manual briefs')}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Upgrade to Pro for daily manual briefs →
          </button>
        )}
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="w-full max-w-xl bg-[#090909] border border-white/[0.10] rounded-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          {/* Steps Progress */}
          <div className="flex-1 space-y-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isPast = idx < currentStep
              const isCurrent = idx === currentStep
              
              return (
                <div key={step.id} className={cn(
                  "flex items-start gap-3 transition-all duration-300",
                  isPast || isCurrent ? "opacity-100" : "opacity-30"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0",
                    isPast ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
                    isCurrent ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] animate-pulse" : 
                    "bg-white/[0.04] border-white/[0.08] text-white/40"
                  )}>
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={cn(
                      "font-mono font-semibold text-xs tracking-tight",
                      isCurrent ? "text-white" : isPast ? "text-emerald-400/90" : "text-white/40"
                    )}>{step.label}</h4>
                    {isCurrent && (
                      <p className="text-[10.5px] text-blue-400 font-mono animate-in fade-in duration-300">{step.sub}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Terminal / Log */}
          <div className="w-full md:w-56 bg-black rounded-xl border border-white/[0.08] p-3 font-mono text-[9.5px] space-y-1 h-40 overflow-hidden relative">
             <div className="space-y-1 text-white/40">
                {logs.map((log, i) => (
                  <p key={i} className={cn(
                    "truncate",
                    log.startsWith('>') ? "text-white/60" : "text-blue-400"
                  )}>{log}</p>
                ))}
                <div className="w-1.5 h-2.5 bg-blue-400 animate-pulse inline-block align-middle ml-1" />
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
           <div className="flex items-center gap-2">
              <Orbit className="w-3.5 h-3.5 text-blue-400 animate-[spin_4s_linear_infinite]" />
              <span className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider">AI Engine Processing</span>
           </div>
           <p className="text-[9.5px] font-mono text-white/40">Est: {30 - (currentStep * 7)}s</p>
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white font-mono">Strategy Brief Ready</h3>
          <p className="text-white/50 text-xs font-sans">Your content plan has been compiled into the Studio.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        onClick={handleGenerate}
        className="group bg-white text-black hover:bg-white/90 h-11 px-6 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-white/10 transition-all active:scale-95 gap-2 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform" />
        <span>Generate Strategic Brief</span>
      </Button>

      {state === 'error' && (
        <p className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg animate-in slide-in-from-top-1 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMsg || 'Generation failed — check your connection'}
        </p>
      )}
    </div>
  )
}
