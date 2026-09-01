// src/app/s/[id]/page.tsx
// Public page — no auth required. Anyone with the link can view.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { IdeaObject } from '@/types/niche'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = getServiceClient()

  const { data: share } = await supabase
    .from('shared_strategies')
    .select('idea_data, creator_name')
    .eq('id', id)
    .single()

  if (!share) return {}

  const idea = share.idea_data as IdeaObject
  const title = `"${idea.title}" — shared by ${share.creator_name}`
  const description = idea.hook || 'A trend-backed content strategy from RepsBrief.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://repsbrief.com/s/${id}`,
      siteName: 'RepsBrief',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: 'RepsBrief' }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/logo.png'],
    },
  }
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
    <div className="min-h-screen bg-black text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/6 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-16">
        <div className="w-full max-w-xl space-y-8">

          {/* Top nav */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="RepsBrief" width={24} height={24} className="rounded-md" />
              <span className="text-sm font-black text-white tracking-tight">RepsBrief</span>
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trend-backed</span>
            </div>
          </div>

          {/* Attribution */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strategy shared by</p>
              <p className="text-sm text-white font-bold">{share.creator_name}</p>
            </div>
          </div>

          {/* Strategy card */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-7 space-y-6">
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
              <p className="text-slate-300 text-sm leading-relaxed font-medium italic">&ldquo;{idea.hook}&rdquo;</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Strategy</p>
              <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
            </div>

            {idea.whyItWorks && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Why It Works</p>
                <p className="text-slate-400 text-sm leading-relaxed">{idea.whyItWorks}</p>
              </div>
            )}
          </div>

          {/* Viral CTA block */}
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.08] to-transparent p-7 space-y-5 text-center">
            <div className="space-y-1.5">
              <p className="text-white font-black text-lg tracking-tight">
                Get source-backed strategies for your next post
              </p>
              <p className="text-slate-400 text-sm font-light">
                Start with one manual brief per week, then unlock daily manual generation with Pro.
              </p>
            </div>

            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 w-full h-13 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/25 transition-all hover:scale-[1.02] group"
            >
              Start Free — Create My Brief
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <span className="text-emerald-500/80">✓ Free forever</span>
              <span>·</span>
              <span className="text-emerald-500/80">✓ Pro: 7-day trial</span>
              <span>·</span>
              <span className="text-emerald-500/80">✓ Cancel anytime</span>
            </div>
          </div>

          {/* Powered by */}
          <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-widest">
            Powered by RepsBrief — AI Content Intelligence
          </p>
        </div>
      </div>
    </div>
  )
}
