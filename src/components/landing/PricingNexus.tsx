'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Lock, Zap } from "lucide-react"
import Link from "next/link"
import { trackProductEvent } from '@/lib/analytics/events'

export function PricingNexus() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden bg-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[160px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-24 space-y-4">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
            Investment in Growth
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">Pick Your Power.</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-xl font-light">Start with verified fitness signals, then unlock a daily strategic workflow.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Starter Plan */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 lg:p-12 flex flex-col group hover:border-white/10 transition-all">
            <div className="mb-10">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Starter</span>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-6xl font-black text-white">Free</span>
              </div>
              <p className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-widest">For Solo Creators.</p>
            </div>
            <div className="space-y-5 mb-12 flex-1">
              {[
                '1 manual brief per week',
                '5 of 20 trend-backed ideas',
                'Fitness & Nutrition niche',
                'Source links on every idea'
              ].map((f, i) => (
                <div key={i} className="flex gap-4 text-sm text-slate-500 items-center font-medium">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" /> {f}
                </div>
              ))}
              {['Daily briefs', 'All 20 ideas', 'Brand voice and calendar'].map((f, i) => (
                <div key={i} className="flex gap-4 text-sm text-slate-800 items-center line-through opacity-40">
                  <Lock className="w-3.5 h-3.5 text-slate-800 shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full rounded-2xl border-white/10 text-slate-400 hover:bg-white hover:text-black h-14 text-xs font-black uppercase tracking-widest transition-all" asChild>
              <Link href="/signup" onClick={() => trackProductEvent('signup_cta_clicked', { location: 'pricing' })}>Start Simple</Link>
            </Button>
          </div>

          {/* Pro Plan (Nexus) */}
          <div className="relative group transform md:-translate-y-8">
            <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-[3.2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
            <div className="relative bg-[#050505] border border-blue-500/30 rounded-[3rem] p-10 lg:p-12 flex flex-col h-full shadow-2xl">
              <div className="absolute top-10 right-10">
                <Badge className="bg-blue-600 text-white font-black px-4 py-1.5 rounded-full border-none text-[10px] tracking-widest animate-pulse">
                  MOST POPULAR
                </Badge>
              </div>
              <div className="mb-10">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Pro Creator</span>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">7-day free trial</span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-7xl font-black text-white">$19</span>
                  <span className="text-blue-400/50 font-bold uppercase text-xs tracking-widest">/mo after trial</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Card required · Cancel anytime, no questions asked.</p>
              </div>
              <div className="space-y-5 mb-12 flex-1">
                {[
                  'One fresh brief every day',
                  'All 20 trend-backed ideas',
                  'AI brand voice and remixing',
                  'Editorial calendar',
                  'Public share links',
                  'Trend source badges'
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 text-sm text-slate-100 items-center font-bold">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                       <Zap className="w-3.5 h-3.5 text-blue-400" /> 
                    </div>
                    {f}
                  </div>
                ))}
              </div>
              <Button className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest h-16 shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95" asChild>
                <Link href="/signup" onClick={() => trackProductEvent('signup_cta_clicked', { location: 'pricing' })}>Start Free Trial →</Link>
              </Button>
              <p className="text-center text-[10px] text-slate-600 font-medium mt-3">Then $19/mo · Cancel anytime</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
