'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react"
import Link from "next/link"
import { trackProductEvent } from '@/lib/analytics/events'
import { StudioMockup } from './StudioMockup'
import { SampleBriefButton } from './SampleBriefButton'

function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/email/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        trackProductEvent('waitlist_submitted', { location: 'hero' })
        setState('done')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-xs max-w-md mx-auto animate-in fade-in duration-300">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>You&apos;re on the list! You can now create your account to begin.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your creator email..."
        required
        className="w-full sm:flex-1 h-10 px-3.5 rounded-md bg-white/[0.04] border border-white/[0.12] text-white placeholder-white/40 text-xs font-sans focus:outline-none focus:border-white/40 focus:bg-white/[0.06] transition-all"
      />
      <Button
        type="submit"
        disabled={state === 'loading'}
        size="sm"
        className="w-full sm:w-auto h-10 px-4 rounded-md bg-white text-black hover:bg-white/90 text-xs font-medium transition-all shrink-0 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
      >
        {state === 'loading' ? 'Joining...' : 'Get Started →'}
      </Button>
    </form>
  )
}

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden text-center">
      {/* Background Atmosphere & Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.025] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-20 max-w-[1320px] flex flex-col items-center">
        
        {/* Top Status Pill */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/[0.10] bg-white/[0.03] px-3 py-1 text-xs text-white/70 backdrop-blur-md animate-in fade-in duration-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">The Strategic Content IDE — v2.0</span>
        </div>

        {/* Big Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-bold tracking-tight mb-5 leading-[1.08] text-white max-w-5xl animate-in fade-in duration-700 delay-150">
          Turn Real Trends Into <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
            High-Converting Content.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-3xl mb-8 font-sans leading-relaxed text-balance animate-in fade-in duration-700 delay-300">
          Run real-time trend scrapers, script generators, and neural brand voice side by side. 
          Editorial calendar, teleprompter, and 1-click Notion sync keep your pipeline moving.
        </p>

        {/* Dual Actions & Lead Capture */}
        <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto animate-in fade-in duration-700 delay-500">
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Button
              size="lg"
              className="h-11 px-6 rounded-md bg-white text-black hover:bg-white/90 text-sm font-medium transition-all w-full sm:w-auto shadow-sm cursor-pointer"
              asChild
            >
              <Link 
                href="/signup" 
                onClick={() => trackProductEvent('signup_cta_clicked', { location: 'hero' })}
                className="flex items-center justify-center gap-2"
              >
                <span>Start Free Brief</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <SampleBriefButton />
          </div>

          {/* Quick Email capture fallback */}
          <div className="w-full pt-2">
            <EmailCaptureForm />
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-mono text-white/40 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Starter: 1 manual brief/wk (Free)
            </span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" /> Pro: 7-day trial ($19/mo)
            </span>
            <span className="text-white/20 hidden sm:inline">·</span>
            <span>No lock-in</span>
          </div>
        </div>

        {/* Live Interactive ADE Mockup */}
        <div className="w-full">
          <StudioMockup />
        </div>

      </div>
    </section>
  )
}
