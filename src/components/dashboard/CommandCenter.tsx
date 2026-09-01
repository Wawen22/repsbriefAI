import Link from 'next/link'
import { ArrowRight, CalendarDays, Check, Circle, Sparkles } from 'lucide-react'

import { GenerateNowButton } from '@/components/dashboard/GenerateNowButton'
import { getBriefIntelligence } from '@/lib/dashboard/brief-intelligence'
import { getWorkflowSteps } from '@/lib/dashboard/workflow'
import { cn } from '@/lib/utils'
import type { IdeaObject } from '@/types/niche'

interface CommandCenterProps {
  ideas: IdeaObject[]
  hasBrief: boolean
  savedIdeaCount: number
  plan: string
  niche: string
  briefDate: string | null
  alreadyGeneratedToday: boolean
}

export function CommandCenter({ ideas, hasBrief, savedIdeaCount, plan, niche, briefDate, alreadyGeneratedToday }: CommandCenterProps) {
  const intelligence = getBriefIntelligence(ideas)

  return (
    <section className="space-y-5">
      <CommandCenterHero
        hasBrief={hasBrief}
        ideaCount={ideas.length}
        plan={plan}
        niche={niche}
        briefDate={briefDate}
        alreadyGeneratedToday={alreadyGeneratedToday}
      />
      <WorkflowRail hasBrief={hasBrief} savedIdeaCount={savedIdeaCount} />
      {hasBrief && <BriefIntelligence ideaCount={ideas.length} niche={niche} sourceLabels={intelligence.sourceLabels} formatCounts={intelligence.formatCounts} topFormat={intelligence.topFormat} briefDate={briefDate} />}
    </section>
  )
}

interface CommandCenterHeroProps {
  hasBrief: boolean
  ideaCount: number
  plan: string
  niche: string
  briefDate: string | null
  alreadyGeneratedToday: boolean
}

export function CommandCenterHero({ hasBrief, ideaCount, plan, niche, briefDate, alreadyGeneratedToday }: CommandCenterHeroProps) {
  return (
    <div className="border border-white/[0.12] bg-[#080808] p-5 sm:p-7 rounded-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">This week&apos;s command center</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {hasBrief ? 'This week’s direction' : 'Your next strategic move is ready.'}
          </h1>
          <p className="text-sm leading-relaxed text-white/50 sm:text-base">
            {hasBrief
              ? `${ideaCount} strategies are ready for ${niche.replaceAll('_', ' ')}. Review an idea, refine it, then move it to your calendar.`
              : 'Generate a verified strategic brief from active sources, then choose what to produce first.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {hasBrief ? (
            <>
              <Link href="#brief-inventory" className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-xs font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Review ideas <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/dashboard/calendar" className="inline-flex h-11 items-center rounded-md border border-white/[0.12] px-4 text-xs font-medium text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Open calendar
              </Link>
            </>
          ) : (
            <GenerateNowButton alreadyGeneratedToday={alreadyGeneratedToday} plan={plan} />
          )}
        </div>
      </div>
      {briefDate && <div className="mt-6 flex items-center gap-2 border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-wider text-white/40"><CalendarDays className="size-3.5 text-emerald-400" /> Brief period: {briefDate}</div>}
    </div>
  )
}

export function WorkflowRail({ hasBrief, savedIdeaCount }: Pick<CommandCenterProps, 'hasBrief' | 'savedIdeaCount'>) {
  const steps = getWorkflowSteps({ hasBrief, savedIdeaCount })

  return (
    <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
        {steps.map((step, index) => {
          const current = step.state === 'current'
          const complete = step.state === 'complete'
          return <li key={step.id} className="bg-[#050505] p-4">
            <div className="flex items-center gap-2">
              {complete ? <Check className="size-3.5 text-emerald-400" /> : current ? <Sparkles className="size-3.5 text-white" /> : <Circle className="size-3.5 text-white/25" />}
              <span className={cn('font-mono text-[10px] uppercase tracking-wider', current ? 'text-white' : complete ? 'text-emerald-400' : 'text-white/35')}>0{index + 1} {step.label}</span>
            </div>
          </li>
        })}
    </ol>
  )
}

interface BriefIntelligenceProps {
  ideaCount: number
  niche: string
  sourceLabels: string[]
  formatCounts: Record<string, number>
  topFormat?: string
  briefDate: string | null
}

export function BriefIntelligence({ ideaCount, niche, sourceLabels, formatCounts, topFormat, briefDate }: BriefIntelligenceProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">Signal intelligence</p>
        <p className="mt-2 text-sm text-white/75">
          {sourceLabels.length ? sourceLabels.join(' · ') : 'Source attribution is unavailable for this brief.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(formatCounts).map(([format, count]) => (
            <span key={format} className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/55">
              {format} {count}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">This week&apos;s inventory</p>
        <p className="mt-2 text-sm text-white/75">{ideaCount} strategies{topFormat ? ` · top format: ${topFormat}` : ''}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">{niche.replaceAll('_', ' ')}{briefDate ? ` · ${briefDate}` : ''}</p>
      </div>
    </div>
  )
}
