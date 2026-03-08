'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Users, Calendar, Layout } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-widest w-full sm:w-auto shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-1 group" asChild>
            <Link href="/signup">
              Start Building Now
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-widest w-full sm:w-auto" asChild>
            <Link href="#features">Explore Features</Link>
          </Button>
        </div>

        {/* Dynamic Integration Marquee (Simulated) */}
        <div className="mt-32 opacity-40 grayscale flex flex-wrap justify-center items-center gap-12 lg:gap-24 animate-in fade-in duration-1000 delay-1000">
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
