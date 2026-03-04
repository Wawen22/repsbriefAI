// src/app/(dashboard)/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { BriefList } from "@/components/brief/BriefList"
import { NichePicker } from "@/components/niche/NichePicker"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { GenerateNowButton } from "@/components/dashboard/GenerateNowButton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, LayoutGrid, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get the most recent brief (not just today's — cron runs on Monday but users open on other days)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ data: brief }, { data: savedData }, { data: generatedToday }] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('idea_history')
      .select('idea_hash')
      .eq('user_id', user.id)
      .eq('saved', true),
    supabase
      .from('briefs')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle(),
  ])

  const ideas: IdeaObject[] = brief?.ideas || []
  const hasBrief = ideas.length > 0
  const alreadyGeneratedToday = !!generatedToday
  const savedHashes = new Set(savedData?.map(row => row.idea_hash) || [])

  // Format the brief's date for display
  const briefDate = brief?.week_date
    ? new Date(brief.week_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <NichePicker />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">The Weekly Reps</h1>
          <p className="text-slate-400 mt-2">Your 20 high-impact content ideas generated from this week's data.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasBrief && briefDate && (
            <Badge variant="outline" className="border-slate-700 text-slate-500 gap-1.5 py-1.5 px-3">
              <CalendarDays className="w-3.5 h-3.5" />
              {briefDate}
            </Badge>
          )}
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1.5 px-3">
            <Zap className="w-3.5 h-3.5 mr-1.5 fill-emerald-500" /> Fresh Data
          </Badge>
          <AddIdeaModal />
        </div>
      </header>

      {!hasBrief ? (
        // ── Empty State ────────────────────────────────────────────────────────
        <div className="flex flex-col items-center justify-center gap-10 py-20">
          {/* Decorative grid */}
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="relative grid grid-cols-2 gap-3 opacity-40 pointer-events-none select-none">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="h-3 w-16 bg-blue-500/30 rounded-full" />
                  <div className="h-2 w-full bg-slate-800 rounded-full" />
                  <div className="h-2 w-4/5 bg-slate-800 rounded-full" />
                  <div className="h-2 w-3/5 bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-slate-100">Your brief isn't here yet</h2>
            <p className="text-slate-500 leading-relaxed">
              The weekly cron runs every Monday at 6 AM. Can't wait? Generate your first brief right now — it takes about 30 seconds.
            </p>
          </div>

          <GenerateNowButton alreadyGeneratedToday={alreadyGeneratedToday} />

          <div className="flex items-center gap-8 text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Reddit trends
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              YouTube data
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Google Trends
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              RSS feeds
            </span>
          </div>
        </div>
      ) : (
        // ── Brief Tabs ─────────────────────────────────────────────────────────
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="bg-slate-900 border-slate-800 p-1">
            <TabsTrigger value="all" className="text-slate-400 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 px-6">All Formats</TabsTrigger>
            <TabsTrigger value="reel" className="text-slate-400 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 px-6">Reels</TabsTrigger>
            <TabsTrigger value="carousel" className="text-slate-400 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 px-6">Carousels</TabsTrigger>
            <TabsTrigger value="thread" className="text-slate-400 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 px-6">Threads</TabsTrigger>
            <TabsTrigger value="newsletter" className="text-slate-400 data-[state=active]:text-slate-100 data-[state=active]:bg-slate-800 px-6">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="focus-visible:outline-none">
            <BriefList ideas={ideas} savedHashes={savedHashes} />
          </TabsContent>
          <TabsContent value="reel" className="focus-visible:outline-none">
            <BriefList ideas={ideas.filter(i => i.format === 'Reel')} savedHashes={savedHashes} />
          </TabsContent>
          <TabsContent value="carousel" className="focus-visible:outline-none">
            <BriefList ideas={ideas.filter(i => i.format === 'Carousel')} savedHashes={savedHashes} />
          </TabsContent>
          <TabsContent value="thread" className="focus-visible:outline-none">
            <BriefList ideas={ideas.filter(i => i.format === 'Thread')} savedHashes={savedHashes} />
          </TabsContent>
          <TabsContent value="newsletter" className="focus-visible:outline-none">
            <BriefList ideas={ideas.filter(i => i.format === 'Newsletter')} savedHashes={savedHashes} />
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}
