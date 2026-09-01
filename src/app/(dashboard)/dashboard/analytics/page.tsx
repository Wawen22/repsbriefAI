// src/app/(dashboard)/dashboard/analytics/page.tsx

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import type { ComponentType, SVGProps } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Video,
  Layers,
  Hash,
  Mail,
  Star,
  ArrowUpRight,
  Clock,
  Eye,
  CheckCircle2,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  BookOpen,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const FORMAT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'Reel': Video,
  'Carousel': Layers,
  'Thread': Hash,
  'Newsletter': Mail,
  'Idea': LightbulbIcon
}

const FORMAT_COLORS: Record<string, string> = {
  'Reel': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'Carousel': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Thread': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Newsletter': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Idea': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.1.7.9 1.2 1.7 1.5 2.9" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const profile = await getCachedProfile(user.id)
  const teamId = profile?.current_team_id

  // Fetch briefs for brief-level stats
  const { data: briefs } = await supabase
    .from('briefs')
    .select('id, ideas, week_date, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch saved ideas
  const { data: savedHistory } = await supabase
    .from('idea_history')
    .select('id, idea_data, idea_title, saved, status, views_count, performance_score, published_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  const allSaved = (savedHistory || []).filter(r => r.saved)
  const publishedIdeas = (savedHistory || []).filter(r => r.status === 'published')

  // Brief-level stats
  const totalBriefs = briefs?.length || 0
  const latestBrief = briefs?.[0]
  const latestIdeas: IdeaObject[] = latestBrief?.ideas || []
  const totalIdeasGenerated = (briefs || []).reduce((acc, b) => acc + ((b.ideas as IdeaObject[])?.length || 0), 0)

  // Format breakdown from ALL briefs combined
  const allIdeasFlat: IdeaObject[] = (briefs || []).flatMap(b => (b.ideas as IdeaObject[]) || [])
  const formatBreakdown = allIdeasFlat.reduce((acc: Record<string, number>, idea) => {
    const fmt = idea.format || 'Idea'
    acc[fmt] = (acc[fmt] || 0) + 1
    return acc
  }, {})
  const formatBreakdownList = Object.entries(formatBreakdown)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / allIdeasFlat.length) * 100) }))
    .sort((a, b) => b.count - a.count)

  // Published stats (for users who have them)
  const totalPublished = publishedIdeas.length
  const totalViews = publishedIdeas.reduce((acc, curr) => acc + (curr.views_count || 0), 0)

  const hasPublished = totalPublished > 0
  const hasBriefs = totalBriefs > 0

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20 text-white">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/60">
             <BarChart3 className="w-3 h-3 text-blue-400" />
             <span>Telemetry & Metrics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
          <p className="text-white/50 text-sm md:text-base font-sans">Track your content strategy, format distributions, and publication metrics.</p>
        </div>

        <div className="flex items-center gap-3 bg-[#070707] border border-white/[0.08] rounded-xl p-3.5 shadow-md">
           <div className="text-right">
              <p className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider mb-0.5">Strategy Velocity</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">{totalIdeasGenerated} Ideas</p>
           </div>
           <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
           </div>
        </div>
      </header>

      {/* Top-level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: 'Briefs Compiled', val: totalBriefs, icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Strategies Created', val: totalIdeasGenerated, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Strategies Saved', val: allSaved.length, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s, i) => (
          <div key={i} className="bg-[#070707] border border-white/[0.08] hover:border-white/[0.18] rounded-xl p-5 flex items-center gap-4 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
             <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center shrink-0", s.bg)}>
                <s.icon className={cn("w-6 h-6", s.color)} />
             </div>
             <div>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-2xl font-bold font-mono text-white tracking-tight">{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      {!hasBriefs ? (
        /* Empty state */
        <div className="bg-[#070707] border border-dashed border-white/[0.10] rounded-2xl p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-mono">Compile your first brief</h3>
            <p className="text-white/50 text-xs max-w-sm mx-auto font-sans">Analytics will populate as soon as you generate your first content brief.</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-white/90 rounded-xl px-5 h-9 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer">
              Go Compile Brief →
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Format Breakdown from briefs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold">Format Distribution</h3>
                <span className="border border-white/[0.08] bg-white/[0.02] text-[9.5px] font-mono uppercase px-2 py-0.5 rounded text-white/50">All Briefs</span>
              </div>

              <Card className="bg-[#070707] border-white/[0.08] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <CardContent className="p-6 space-y-5">
                  {formatBreakdownList.map((f, i) => {
                    const Icon = FORMAT_ICONS[f.name] || LayoutGrid
                    const colorClass = FORMAT_COLORS[f.name] || 'text-white/60'

                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-white/60" />
                            </div>
                            <span className="font-mono font-medium text-white text-xs">{f.name}s</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs font-semibold text-white">{f.count} ideas </span>
                            <span className="text-[10px] text-white/40">({f.pct}%)</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", colorClass.includes('pink') ? 'bg-pink-400' : colorClass.includes('blue') ? 'bg-blue-400' : colorClass.includes('cyan') ? 'bg-cyan-400' : colorClass.includes('emerald') ? 'bg-emerald-400' : 'bg-purple-400')}
                            style={{ width: `${Math.max(5, f.pct)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Latest Brief Snapshot */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 font-semibold px-1">Latest Compiled Brief</h3>
              <Card className="bg-[#070707] border-white/[0.08] rounded-xl overflow-hidden relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <CardContent className="p-6 flex flex-col h-full space-y-4 relative z-10">
                  {latestBrief ? (
                    <>
                      <div className="space-y-1">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                          Active Week
                        </span>
                        <p className="text-xs text-white/60 font-mono pt-1">
                          {latestBrief.week_date
                            ? new Date(latestBrief.week_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            : new Date(latestBrief.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.06]">
                          <p className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider mb-0.5">Strategies</p>
                          <p className="text-base font-bold font-mono text-white">{latestIdeas.length}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.06]">
                          <p className="text-[9.5px] font-mono text-white/40 uppercase tracking-wider mb-0.5">Formats</p>
                          <p className="text-base font-bold font-mono text-white">{new Set(latestIdeas.map(i => i.format)).size}</p>
                        </div>
                      </div>

                      <div className="pt-2 mt-auto">
                        <Link href="/dashboard">
                          <Button className="w-full bg-white text-black hover:bg-white/90 rounded-lg font-mono text-xs font-bold uppercase tracking-wider h-9 cursor-pointer">
                            <span>Open Studio Brief →</span>
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center opacity-40">
                      <p className="text-xs font-mono uppercase">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Published Performance — shown only when data exists, otherwise soft CTA */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Published Performance</h3>
              {hasPublished && (
                <Link href="/dashboard/history" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  Full History <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {hasPublished ? (
              <>
                {/* Published stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Published Strategies', val: totalPublished, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Tracked Views', val: totalViews.toLocaleString(), icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Avg Performance', val: `${(publishedIdeas.reduce((a, c) => a + (c.performance_score || 0), 0) / publishedIdeas.length).toFixed(1)}/5.0`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6">
                      <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0", s.bg)}>
                        <s.icon className={cn("w-7 h-7", s.color)} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{s.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {publishedIdeas.slice(0, 5).map((idea, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                          {(() => {
                            const ideaData = idea.idea_data as Partial<IdeaObject> | null
                            const Icon = FORMAT_ICONS[ideaData?.format || ''] || LayoutGrid
                            return <Icon className="w-5 h-5 text-slate-500" />
                          })()}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{idea.idea_title}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Published {new Date(idea.published_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Performance</p>
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="font-black text-white">{idea.performance_score}.0</span>
                          </div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reach</p>
                          <p className="font-black text-white">{idea.views_count?.toLocaleString()}</p>
                        </div>
                        <Link href={`/dashboard/strategy/${idea.id}`}>
                          <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:text-white hover:bg-white/5">
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-semibold">No published data yet</p>
                  <p className="text-slate-600 text-sm">When you mark ideas as published and log performance, detailed stats will appear here.</p>
                </div>
                <Link href="/dashboard/history" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest transition-colors">
                  View saved ideas <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
