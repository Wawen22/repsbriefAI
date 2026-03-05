// src/app/(dashboard)/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { BriefList } from "@/components/brief/BriefList"
import { NichePicker } from "@/components/niche/NichePicker"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { GenerateNowButton } from "@/components/dashboard/GenerateNowButton"
import { StrategicStats } from "@/components/dashboard/StrategicStats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Zap, Sparkles, Orbit } from "lucide-react"
import { stripe } from "@/lib/stripe"
import { resolvePlanFromPriceId } from "@/lib/billing"

export const dynamic = 'force-dynamic'

const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due']

async function syncProfileAfterCheckout(
  checkoutSessionId: string,
  userId: string,
  userEmail: string | undefined,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ['subscription'],
  })

  const sessionUserId = session.metadata?.userId || session.client_reference_id
  if (sessionUserId && sessionUserId !== userId) return

  const emailMatches = !session.customer_email || session.customer_email === userEmail
  if (!sessionUserId && !emailMatches) return

  const subscription =
    typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription

  if (!subscription) return

  const priceId = subscription.items.data[0]?.price?.id
  const metadataPlan = subscription.metadata?.plan
  const planFromMetadata = metadataPlan === 'team' || metadataPlan === 'pro' ? metadataPlan : null
  const planFromPrice = resolvePlanFromPriceId(priceId)
  const resolvedPaidPlan =
    planFromPrice !== 'starter' ? planFromPrice : planFromMetadata || 'pro'

  const nextPlan = ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
    ? resolvedPaidPlan
    : 'starter'
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  await supabase
    .from('profiles')
    .update({
      plan: nextPlan,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscription.id,
    })
    .eq('id', userId)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ upgrade?: string; session_id?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const params = searchParams ? await searchParams : undefined
  if (params?.upgrade === 'success' && params.session_id) {
    try {
      await syncProfileAfterCheckout(params.session_id, user.id, user.email, supabase)
    } catch (error) {
      console.error('[Dashboard] Checkout sync fallback failed:', error)
    }
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ data: brief }, { data: generatedToday }, { data: profile }] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('briefs')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('active_niche, plan, current_team_id')
      .eq('id', user.id)
      .single()
  ])

  const { data: savedHistory } = await supabase
    .from('idea_history')
    .select('id, idea_hash, idea_data, saved')
    .eq('team_id', profile?.current_team_id)

  // Create a map of remixed/saved data by hash for merging
  const historyMap = new Map(
    (savedHistory || []).map(row => [row.idea_hash, row])
  )

  const rawIdeas: IdeaObject[] = brief?.ideas || []
  
  // Merge: If an idea from the brief has a match in history with idea_data, use the history version
  const ideas: IdeaObject[] = rawIdeas.map(idea => {
    const hash = Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
    const historyEntry = historyMap.get(hash)
    if (historyEntry?.idea_data) {
      return historyEntry.idea_data as IdeaObject
    }
    return idea
  })

  const hasBrief = ideas.length > 0
  const alreadyGeneratedToday = !!generatedToday
  const savedHashes = new Set(
    (savedHistory || [])
      .filter(row => row.saved)
      .map(row => row.idea_hash)
  )
  const activeNiche = profile?.active_niche || 'fitness'
  const userPlan = profile?.plan || 'starter'

  const briefDate = brief?.week_date
    ? new Date(brief.week_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="space-y-10">
      {/* Upper Utility Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <NichePicker />
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <Orbit className="w-3 h-3 animate-[spin_4s_linear_infinite]" />
            Live Data Feed
          </div>
        </div>
        
        {hasBrief && briefDate && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[11px] font-bold uppercase tracking-wider border border-white/5">
            <CalendarDays className="w-3.5 h-3.5" />
            Week of {briefDate}
          </div>
        )}
      </div>

      {/* Main Action Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-tight">
            The Weekly <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Reps</span>
          </h1>
          <p className="text-slate-400 text-lg font-light max-w-xl">
            20 high-impact content ideas, AI-filtered from the top 1% of digital trends.
          </p>
        </div>

        <div className="shrink-0">
          <AddIdeaModal />
        </div>
      </header>

      {!hasBrief ? (
        <div className="relative py-24 flex flex-col items-center justify-center text-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl group cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/20 transition-all duration-500">
               <Sparkles className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">Your briefing is ready to generate</h2>
              <p className="text-slate-400 text-lg leading-relaxed font-light px-6">
                Our engine has analyzed the latest Reddit, YouTube, and Google trends for your niche.
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <GenerateNowButton alreadyGeneratedToday={alreadyGeneratedToday} />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Takes ~30 seconds to analyze</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Strategic Impact Stats Section */}
          <StrategicStats ideas={ideas} niche={activeNiche} />

          <Tabs defaultValue="all" className="space-y-8">
            {/* Pill Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-auto gap-1 self-start">
                {[
                  { value: 'all', label: 'All Formats' },
                  { value: 'reel', label: 'Reels' },
                  { value: 'carousel', label: 'Carousels' },
                  { value: 'thread', label: 'Threads' },
                  { value: 'newsletter', label: 'Newsletters' }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white hover:bg-white/5 data-[state=active]:bg-white data-[state=active]:text-black transition-all shadow-none border-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                 <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                 <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Analysis Verified</span>
              </div>
            </div>

            <div className="min-h-[400px]">
              <TabsContent value="all" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BriefList ideas={ideas} savedHashes={savedHashes} plan={userPlan} />
              </TabsContent>
              <TabsContent value="reel" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BriefList ideas={ideas.filter(i => i.format === 'Reel')} savedHashes={savedHashes} plan={userPlan} />
              </TabsContent>
              <TabsContent value="carousel" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BriefList ideas={ideas.filter(i => i.format === 'Carousel')} savedHashes={savedHashes} plan={userPlan} />
              </TabsContent>
              <TabsContent value="thread" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BriefList ideas={ideas.filter(i => i.format === 'Thread')} savedHashes={savedHashes} plan={userPlan} />
              </TabsContent>
              <TabsContent value="newsletter" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <BriefList ideas={ideas.filter(i => i.format === 'Newsletter')} savedHashes={savedHashes} plan={userPlan} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  )
}
