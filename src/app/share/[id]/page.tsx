// src/app/share/[id]/page.tsx

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, FileText, ArrowRight, Star, Orbit, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

// In Next.js 15/16, params is a Promise
export default async function SharedStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  
  const { data: share } = await supabase
    .from('shared_strategies')
    .select('*')
    .eq('id', id)
    .single()

  if (!share) {
    notFound()
  }

  const idea = share.idea_data as IdeaObject

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Orbit className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">RepsBrief</span>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full font-bold px-6 text-xs uppercase tracking-widest h-9">
            Try Free <ArrowUpRight className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-20">
        
        {/* Hero Section */}
        <header className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] uppercase font-black px-3 py-1 tracking-widest">
              Shared Content Strategy
            </Badge>
            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 text-[10px] uppercase font-black px-3 py-1 tracking-widest">
              {idea.format} Edition
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.1] text-white">
            {idea.title}
          </h1>
          
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-xl text-white">
              {share.creator_name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic Insight by</p>
              <p className="text-sm font-bold text-slate-200">{share.creator_name || 'Anonymous Creator'}</p>
            </div>
          </div>
        </header>

        {/* The Content Canvas */}
        <div className="grid grid-cols-1 gap-12">
          
          {/* 1. THE HOOK */}
          <section className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-5 h-5 text-blue-400" />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">The Hook</h4>
            </div>
            
            <div className="p-10 md:p-20 rounded-[3rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 relative overflow-hidden text-center shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-blue-500 rounded-full" />
              <p className="text-3xl md:text-6xl font-serif italic text-white leading-tight">
                &ldquo;{idea.hook}&rdquo;
              </p>
            </div>
          </section>

          {/* 2. THE SCRIPT */}
          <section className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Production Script</h4>
            </div>

            <div className="rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden shadow-inner">
              <div className="p-8 md:p-16 space-y-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block text-center">Strategic Concept</span>
                  <p className="text-slate-300 text-xl leading-relaxed font-light text-center">{idea.description}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="space-y-6 text-left">
                  <div className="bg-black/60 p-8 md:p-12 rounded-[2.5rem] border border-white/5 font-mono text-sm md:text-base text-slate-400 leading-relaxed whitespace-pre-wrap shadow-2xl text-left">
                    {idea.scriptDraft || "Script content is private or not generated."}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. WHY IT WORKS */}
          <section className="max-w-2xl mx-auto w-full">
            <div className="p-8 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Why it works</span>
              </div>
              <p className="text-sm text-emerald-100/60 leading-relaxed italic font-light">
                &ldquo;{idea.whyItWorks}&rdquo;
              </p>
            </div>
          </section>
        </div>

        {/* Final Conversion CTA */}
        <section className="pt-20 pb-10 text-center">
          <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="bg-black rounded-[2.3rem] px-8 py-12 md:px-16 md:py-16 space-y-8">
              <div className="space-y-3 text-center">
                <h3 className="text-3xl font-bold text-white">Create your own strategies</h3>
                <p className="text-slate-400 text-lg font-light">Join 1,000+ creators using RepsBrief to win the digital attention war.</p>
              </div>
              <Link href="/signup" className="inline-block">
                <Button className="bg-white text-black hover:bg-slate-200 rounded-full font-black px-10 h-14 text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Start Your Free Trial <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-600">
        <p className="text-xs font-bold uppercase tracking-widest">Powered by RepsBrief Studio</p>
      </footer>
    </div>
  )
}
