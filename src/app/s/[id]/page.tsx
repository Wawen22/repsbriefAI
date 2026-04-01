// src/app/s/[id]/page.tsx
// Public page — no auth required. Anyone with the link can view.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { IdeaObject } from '@/types/niche'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FORMAT_COLORS: Record<string, string> = {
  Reel: 'text-red-400 bg-red-500/10 border-red-500/20',
  Carousel: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Thread: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Newsletter: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Idea: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default async function SharedStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getServiceClient()

  const { data: share } = await supabase
    .from('shared_strategies')
    .select('idea_data, niche, creator_name, created_at')
    .eq('id', id)
    .single()

  if (!share) return notFound()

  const idea = share.idea_data as IdeaObject
  const formatColor = FORMAT_COLORS[idea.format] || FORMAT_COLORS.Idea

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shared via RepsBrief</p>
            <p className="text-xs text-slate-400 font-medium">by {share.creator_name}</p>
          </div>
        </div>

        {/* Strategy card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-black tracking-tight leading-tight text-white">
              {idea.title}
            </h1>
            <Badge className={`shrink-0 text-[9px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${formatColor}`}>
              {idea.format}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hook</p>
            <p className="text-slate-300 text-sm leading-relaxed font-medium italic">"{idea.hook}"</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Strategy</p>
            <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Why It Works</p>
            <p className="text-slate-400 text-sm leading-relaxed">{idea.whyItWorks}</p>
          </div>
        </div>

        {/* Viral CTA */}
        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">Want 20 strategies like this, every week?</p>
          <Button
            className="rounded-full px-10 h-14 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all group"
            asChild
          >
            <Link href="/signup">
              Generate My Free Brief
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Free · No credit card</p>
        </div>
      </div>
    </div>
  )
}
