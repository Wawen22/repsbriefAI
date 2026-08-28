'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, Users, Calendar, Layout, CheckCircle2 } from "lucide-react"
import Link from "next/link"

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
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm max-w-lg mx-auto">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        Check your inbox — your free brief is waiting.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-lg mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
      />
      <Button
        type="submit"
        disabled={state === 'loading'}
        className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 shrink-0"
      >
        {state === 'loading' ? 'Sending...' : 'Get Free Brief →'}
      </Button>
    </form>
  )
}

export function HeroSection() {
  const [briefCount, setBriefCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        if (typeof data.briefCount === 'number' && data.briefCount > 0) {
          setBriefCount(data.briefCount)
        }
      })
      .catch(() => { /* silently fail — fallback text shown */ })
  }, [])

  return (
    <section className="relative pt-24 pb-32 lg:pt-48 lg:pb-56 overflow-hidden text-center">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Content Intelligence Hub — v2.0</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black mb-8 tracking-tighter max-w-7xl mx-auto leading-[0.85] text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          GENERATE.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
            SYNC. SCALE.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          Move from trend discovery to a fully scheduled editorial calendar in 60 seconds. RepsBrief is the nexus where <b>Data</b> meets <b>Creation</b>.
        </p>

        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <EmailCaptureForm />

          <div className="flex items-center gap-3 text-slate-600 text-xs">
            <span>or</span>
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Create full account →
            </Link>
            <span>·</span>
            <Link href="#features" className="text-slate-500 hover:text-slate-400 font-medium transition-colors">
              Explore features
            </Link>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            Free plan forever · No credit card required · <span className="text-emerald-500 font-bold">Pro: 7-day trial, then $19/mo</span>
          </p>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-slate-500 text-xs font-bold uppercase tracking-widest animate-in fade-in duration-1000 delay-1000">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['bg-blue-500','bg-emerald-500','bg-purple-500','bg-orange-500'].map((c,i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-black`} />
              ))}
            </div>
            <span>
              {briefCount !== null
                ? `${briefCount.toLocaleString()}+ briefs generated`
                : '2,400+ briefs generated'}
            </span>
          </div>
          <span className="hidden sm:block text-white/10">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400">★★★★★</span>
            <span>Loved by solo creators & agencies</span>
          </div>
        </div>

        {/* Dynamic Integration Marquee (Simulated) */}
        <div className="mt-24 opacity-40 grayscale flex flex-wrap justify-center items-center gap-12 lg:gap-24 animate-in fade-in duration-1000 delay-1000">
           <div className="flex items-center gap-3">
              <Layout className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Notion</span>
           </div>
           <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Google Calendar</span>
           </div>
           <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Zapier</span>
           </div>
           <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-widest">Slack</span>
           </div>
        </div>
      </div>
    </section>
  )
}
