// src/app/(dashboard)/dashboard/analytics/page.tsx

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import type { ComponentType, SVGProps } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <div className="mx-auto max-w-6xl space-y-12 pb-20 text-white">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
             <BarChart3 className="w-3.5 h-3.5" />
             Performance Engine
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Analytics Dashboard</h1>
          <p className="text-slate-500 text-lg font-light">Track your content strategy and execution metrics.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Strategy Velocity</p>
              <p className="text-xl font-black text-emerald-400">{totalIdeasGenerated} Ideas</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
           </div>
        </div>
      </header>

      {/* Top-level Stats — always visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Briefs Generated', val: totalBriefs, icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Ideas Created', val: totalIdeasGenerated, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Ideas Saved', val: allSaved.length, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
             <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", s.bg)}>
                <s.icon className={cn("w-8 h-8", s.color)} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
             </div>
          </div>
        ))}
      </div>

      {!hasBriefs ? (
        /* Empty state — no briefs yet */
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] p-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Generate your first brief</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Your analytics will populate as soon as you generate your first content brief.</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest">
              Go Generate a Brief
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Format Breakdown from briefs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Format Breakdown</h3>
                <Badge variant="outline" className="border-white/5 bg-white/5 text-[9px] uppercase font-bold text-slate-500">All Briefs</Badge>
              </div>

              <Card className="bg-black/40 border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <CardContent className="p-10 space-y-8">
                  {formatBreakdownList.map((f, i) => {
                    const Icon = FORMAT_ICONS[f.name] || LayoutGrid
                    const colorClass = FORMAT_COLORS[f.name] || 'text-slate-400 bg-white/5 border-white/10'

                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="font-bold text-white uppercase text-xs tracking-widest">{f.name}s</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-white">{f.count} ideas</span>
                            <span className="text-[10px] text-slate-500 block">{f.pct}% of total</span>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", colorClass.includes('pink') ? 'bg-gradient-to-r from-pink-600 to-pink-400' : colorClass.includes('blue') ? 'bg-gradient-to-r from-blue-600 to-blue-400' : colorClass.includes('cyan') ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' : colorClass.includes('emerald') ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-purple-600 to-purple-400')}
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
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-2">Latest Brief</h3>
              <Card className="bg-gradient-to-br from-blue-600/20 via-black to-black border-blue-500/30 rounded-[2.5rem] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-48 h-48" />
                </div>
                <CardContent className="p-10 flex flex-col h-full space-y-6 relative z-10">
                  {latestBrief ? (
                    <>
                      <div className="space-y-2">
                        <Badge className="bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border-none">
                          Most Recent
                        </Badge>
                        <p className="text-sm text-slate-400">
                          {latestBrief.week_date
                            ? new Date(latestBrief.week_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            : new Date(latestBrief.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ideas</p>
                          <p className="text-lg font-black text-white">{latestIdeas.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Formats</p>
                          <p className="text-lg font-black text-white">{new Set(latestIdeas.map(i => i.format)).size}</p>
                        </div>
                      </div>

                      <div className="pt-2 mt-auto">
                        <Link href="/dashboard">
                          <Button className="w-full bg-white text-black hover:bg-slate-200 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] h-12 shadow-2xl">
                            View Brief <ArrowUpRight className="ml-2 w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="py-20 text-center opacity-40">
                      <p className="text-xs font-bold uppercase tracking-widest">No data available</p>
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
