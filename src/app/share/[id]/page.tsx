// src/app/share/[id]/page.tsx
/* eslint-disable @next/next/no-img-element */

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, FileText, ArrowRight, Orbit, ArrowUpRight, Sparkles } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SharedStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  
  // Fetch shared strategy and join with team branding
  const { data: share } = await supabase
    .from('shared_strategies')
    .select(`
      *,
      teams (
        name,
        logo_url,
        primary_color
      )
    `)
    .eq('id', id)
    .single()

  if (!share) {
    notFound()
  }

  const idea = share.idea_data as IdeaObject
  const team = share.teams as { name?: string; logo_url?: string; primary_color?: string } | null
  const brandColor = team?.primary_color || '#3b82f6' // Default blue-500
  const agencyLogo = team?.logo_url
  const agencyName = team?.name || 'RepsBrief Studio'

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20" 
          style={{ backgroundColor: brandColor }}
        />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4 group">
          {agencyLogo ? (
            <img src={agencyLogo} alt={agencyName} className="h-8 md:h-10 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform"
                style={{ backgroundColor: brandColor }}
              >
                <Orbit className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter uppercase">{agencyName}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/signup">
            <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full font-black px-6 text-[10px] uppercase tracking-widest h-10">
              Try RepsBrief <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-20">
        
        {/* Hero Section */}
        <header className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge 
              variant="outline" 
              className="text-[10px] uppercase font-black px-4 py-1.5 tracking-[0.2em] border-none"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              Exclusive Strategy
            </Badge>
            <Badge variant="outline" className="bg-white/5 text-slate-400 border-white/10 text-[10px] uppercase font-black px-4 py-1.5 tracking-[0.2em]">
              {idea.format} Edition
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            {idea.title}
          </h1>
          
          <div className="flex items-center justify-center gap-4 pt-6">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-2xl text-white border border-white/10"
              style={{ backgroundColor: brandColor }}
            >
              {share.creator_name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Strategic Brief by</p>
              <p className="text-lg font-bold text-white tracking-tight">{share.creator_name || agencyName}</p>
            </div>
          </div>
        </header>

        {/* The Content Canvas */}
        <div className="grid grid-cols-1 gap-12">
          
          {/* 1. THE HOOK */}
          <section className="space-y-8">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-5 h-5" style={{ color: brandColor }} />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">The Opening Hook</h4>
            </div>
            
            <div className="p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden text-center shadow-2xl group">
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 rounded-full blur-[1px]" 
                style={{ backgroundColor: brandColor }}
              />
              <p className="text-4xl md:text-7xl font-bold italic text-white leading-[1.1] tracking-tight">
                &ldquo;{idea.hook}&rdquo;
              </p>
            </div>
          </section>

          {/* 2. THE SCRIPT */}
          <section className="space-y-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Strategic Scripting</h4>
            </div>

            <div className="rounded-[3rem] bg-white/[0.01] border border-white/5 overflow-hidden shadow-inner backdrop-blur-sm">
              <div className="p-10 md:p-20 space-y-16">
                <div className="space-y-6 text-center max-w-2xl mx-auto">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Core Concept</span>
                  <p className="text-slate-300 text-2xl leading-relaxed font-light">{idea.description}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Script Draft</span>
                     <Badge variant="outline" className="text-[9px] font-bold uppercase border-white/5 bg-white/5">Auto-Generated</Badge>
                  </div>
                  <div className="bg-black/60 p-10 md:p-14 rounded-[3rem] border border-white/5 font-mono text-sm md:text-lg text-slate-400 leading-relaxed whitespace-pre-wrap shadow-2xl text-left border-l-4" style={{ borderLeftColor: brandColor }}>
                    {idea.scriptDraft || "This section is restricted to the production team."}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. WHY IT WORKS */}
          <section className="max-w-2xl mx-auto w-full">
            <div 
              className="p-10 rounded-[3rem] border space-y-5 text-center transition-all hover:bg-opacity-10"
              style={{ backgroundColor: `${brandColor}05`, borderColor: `${brandColor}20` }}
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 fill-current" style={{ color: brandColor }} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: brandColor }}>Strategic Intent</span>
              </div>
              <p className="text-base text-slate-300 leading-relaxed italic font-light">
                &ldquo;{idea.whyItWorks}&rdquo;
              </p>
            </div>
          </section>
        </div>

        {/* Agency Info */}
        <section className="pt-20 border-t border-white/5 flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-3">
              {agencyLogo ? (
                <img src={agencyLogo} alt={agencyName} className="h-12 object-contain" />
              ) : (
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  <Orbit className="w-6 h-6" />
                </div>
              )}
              <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">{agencyName}</h3>
              <p className="text-sm text-slate-500 font-medium">Verified Content Strategy Studio</p>
           </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="pt-10 pb-10 text-center">
          <div 
            className="inline-block p-1 rounded-[3rem] transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: brandColor }}
          >
            <div className="bg-[#050505] rounded-[2.8rem] px-10 py-16 md:px-20 md:py-24 space-y-10">
              <div className="space-y-4 text-center">
                <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                  READY TO <br />
                  WIN THE TREND?
                </h3>
                <p className="text-slate-400 text-xl font-light max-w-md mx-auto">Build data-backed strategies like this one in seconds.</p>
              </div>
              <Link href="/signup" className="inline-block">
                <Button 
                  className="text-white rounded-full font-black px-12 h-16 text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                  style={{ backgroundColor: brandColor }}
                >
                  Start Your Studio <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center text-slate-700 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
           <Zap className="w-4 h-4 fill-current" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Powered by RepsBrief Studio Architecture</p>
        </div>
        <p className="text-[9px] font-mono">&copy; 2026 {agencyName}. All Rights Reserved.</p>
      </footer>
    </div>
  )
}
