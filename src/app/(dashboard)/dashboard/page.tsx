// src/app/(dashboard)/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getCachedProfile } from "@/lib/supabase/cached-queries"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { BriefList } from "@/components/brief/BriefList"
import { NichePicker } from "@/components/niche/NichePicker"
import { CommandCenter } from "@/components/dashboard/CommandCenter"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { getBriefIntelligence } from "@/lib/dashboard/brief-intelligence"
import { getSavedIdeaCountForCurrentBrief } from "@/lib/dashboard/workflow"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Zap } from "lucide-react"
import { stripe } from "@/lib/stripe"
import { resolvePlanFromPriceId } from "@/lib/billing"
import { OnboardingModal } from "@/components/dashboard/OnboardingModal"

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
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

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

  const [profile, { data: brief }, { data: generatedToday }] = await Promise.all([
    getCachedProfile(user.id),
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
  
  // Create a proper map of hash -> id for saved ideas
  const savedIdsMap = new Map<string, string>(
    (savedHistory || [])
      .filter(row => row.saved)
      .map(row => [row.idea_hash, row.id])
  )
  const savedHashes = new Set(savedIdsMap.keys())
  const currentBriefIdeaHashes = new Set(
    rawIdeas.map((idea) => Buffer.from(idea.title.trim()).toString('base64').substring(0, 64))
  )
  const savedIdeaCount = getSavedIdeaCountForCurrentBrief(currentBriefIdeaHashes, savedHashes)
  const briefIntelligence = getBriefIntelligence(ideas)
  
  const activeNiche = profile?.active_niche || 'fitness'
  const userPlan = profile?.plan || 'starter'

  const briefDate = brief?.week_date
    ? new Date(brief.week_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null

  const showOnboarding = !profile?.has_onboarded

  return (
    <div className="space-y-8">
      {showOnboarding && <OnboardingModal userName={user.user_metadata?.full_name || user.email?.split('@')[0]} />}
      {/* Upper Utility Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <NichePicker />
          <div className="h-3.5 w-px bg-white/[0.10]" />
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 uppercase tracking-wider">
            <span className={`size-1.5 rounded-full ${briefIntelligence.sourceLabels.length ? 'bg-emerald-400' : 'bg-white/25'}`} />
            <span>{briefIntelligence.sourceLabels.length ? `${briefIntelligence.sourceLabels.join(' + ')} verified` : 'Awaiting source verification'}</span>
          </div>
        </div>
        
        {hasBrief && briefDate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] text-white/60 text-[11px] font-mono border border-white/[0.08]">
            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
            <span>Week of {briefDate}</span>
          </div>
        )}
        <AddIdeaModal compact />
      </div>

      <CommandCenter
        ideas={ideas}
        hasBrief={hasBrief}
        savedIdeaCount={savedIdeaCount}
        plan={userPlan}
        niche={activeNiche}
        briefDate={briefDate}
        alreadyGeneratedToday={alreadyGeneratedToday}
      />

      {hasBrief && (
        <div id="brief-inventory" className="scroll-mt-6 space-y-8">
          <Tabs defaultValue="all" className="space-y-6">
            {/* Pill Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-[#0c0c0c] border border-white/[0.08] p-1 rounded-xl h-auto gap-1 self-start">
                {[
                  { value: 'all', label: 'All Formats' },
                  { value: 'Reel', label: 'Reels' },
                  { value: 'Carousel', label: 'Carousels' },
                  { value: 'Thread', label: 'Threads' },
                  { value: 'Newsletter', label: 'Newsletters' }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium text-white/50 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold transition-all shadow-none border-none cursor-pointer"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                 <Zap className="w-3.5 h-3.5 text-emerald-400" />
                 <span className="text-[10.5px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">Analysis Verified</span>
              </div>
            </div>

            <div className="min-h-[400px]">
              <TabsContent value="all" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
                <BriefList ideas={ideas} savedHashes={savedHashes} savedIdsMap={savedIdsMap} plan={userPlan} />
              </TabsContent>
              <TabsContent value="Reel" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
                <BriefList ideas={ideas.filter(i => i.format === 'Reel')} savedHashes={savedHashes} savedIdsMap={savedIdsMap} plan={userPlan} />
              </TabsContent>
              <TabsContent value="Carousel" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
                <BriefList ideas={ideas.filter(i => i.format === 'Carousel')} savedHashes={savedHashes} savedIdsMap={savedIdsMap} plan={userPlan} />
              </TabsContent>
              <TabsContent value="Thread" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
                <BriefList ideas={ideas.filter(i => i.format === 'Thread')} savedHashes={savedHashes} savedIdsMap={savedIdsMap} plan={userPlan} />
              </TabsContent>
              <TabsContent value="Newsletter" className="mt-0 focus-visible:outline-none animate-in fade-in duration-300">
                <BriefList ideas={ideas.filter(i => i.format === 'Newsletter')} savedHashes={savedHashes} savedIdsMap={savedIdsMap} plan={userPlan} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  )
}
