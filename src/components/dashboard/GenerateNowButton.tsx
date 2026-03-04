'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const LOADING_MESSAGES = [
  'Scraping Reddit trends...',
  'Analyzing YouTube viral videos...',
  'Checking Google Trends...',
  'Reading niche RSS feeds...',
  'Filtering the signal from the noise...',
  'Briefing your AI content strategist...',
  'Generating 20 ideas...',
  'Validating your brief...',
  'Almost ready...',
]

type State = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'

interface GenerateNowButtonProps {
  /** Pass true if the user already generated today - button shows as disabled with message */
  alreadyGeneratedToday?: boolean
}

export function GenerateNowButton({ alreadyGeneratedToday = false }: GenerateNowButtonProps) {
  const router = useRouter()
  const [state, setState] = useState<State>(alreadyGeneratedToday ? 'rate_limited' : 'idle')
  const [msgIndex, setMsgIndex] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cycle through messages while loading
  useEffect(() => {
    if (state === 'loading') {
      setMsgIndex(0)
      intervalRef.current = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 3000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state])

  const handleGenerate = async () => {
    setState('loading')

    try {
      const res = await fetch('/api/generator/generate-now', { method: 'POST' })
      const data = await res.json()

      if (res.status === 429) {
        setState('rate_limited')
        toast.info('You already generated a brief today. Come back tomorrow!')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setState('success')
      toast.success(`Your brief is ready! ${data.count} ideas generated.`)

      // Refresh the page data — brief will now appear
      setTimeout(() => router.refresh(), 800)
    } catch (err: any) {
      const message = err.message || 'Something went wrong. Try again.'
      setErrorMsg(message)
      setState('error')
      toast.error(message)
      // Reset to idle after a moment
      setTimeout(() => setState('idle'), 5000)
    }
  }

  if (state === 'rate_limited') {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Brief already generated today. Next one available tomorrow.</span>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Brief generated! Loading your ideas...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={state === 'loading'}
        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base font-semibold gap-2 disabled:opacity-80 min-w-[220px]"
      >
        {state === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-white" />
            Generate My Brief Now
          </>
        )}
      </Button>

      {state === 'loading' && (
        <p className="text-xs text-slate-500 animate-pulse text-center min-h-[16px] transition-all duration-500">
          {LOADING_MESSAGES[msgIndex]}
        </p>
      )}

      {state === 'idle' && (
        <p className="text-xs text-slate-600 text-center">
          Takes ~30s · Limited to once per day
        </p>
      )}

      {state === 'error' && (
        <p className="text-xs text-rose-400 flex items-center gap-1 text-center max-w-sm">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {errorMsg || 'Generation failed — please try again'}
        </p>
      )}
    </div>
  )
}
