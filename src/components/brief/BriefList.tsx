'use client'

// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"
import { Lock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUpgradeModal } from "@/components/ui/UpgradeModal"

interface BriefListProps {
  ideas: IdeaObject[]
  savedHashes?: Set<string>
  savedIdsMap?: Map<string, string>
  plan?: string
}

type IdeaWithMeta = IdeaObject & {
  id?: string
  idea_hash?: string
}

const FREE_IDEAS_LIMIT = 5

// Realistic fake cards to fill locked grid slots
const FAKE_CARDS = [
  {
    format: 'Reel',
    formatColor: 'bg-pink-500/10 text-pink-400',
    title: 'Why Most Creators Plateau at 10K (And How to Break Through)',
    hook: '"The algorithm doesn\'t reward consistency — it rewards pattern interrupts."',
    desc: 'Deep dive into the velocity-vs-retention trap that kills momentum for mid-tier accounts.',
  },
  {
    format: 'Carousel',
    formatColor: 'bg-blue-500/10 text-blue-400',
    title: '5 Counter-Intuitive Nutrition Hacks Elite Athletes Swear By',
    hook: '"Everything you learned about meal timing is backwards."',
    desc: 'Science-backed breakdown of the fasted training myth and why your pre-workout ritual may be hurting gains.',
  },
  {
    format: 'Thread',
    formatColor: 'bg-cyan-500/10 text-cyan-400',
    title: 'I Analyzed 200 Viral Fitness Posts — Here\'s The Exact Pattern',
    hook: '"Viral content isn\'t luck — it\'s a formula you can copy today."',
    desc: 'Data-driven thread with screenshots, engagement rates, and the hidden structural element 94% of top posts share.',
  },
]

export function BriefList({ ideas, savedHashes, savedIdsMap, plan }: BriefListProps) {
  const isStarter = !plan || plan === 'starter'
  const openUpgrade = useUpgradeModal((s) => s.open)
  const visibleIdeas = isStarter ? ideas.slice(0, FREE_IDEAS_LIMIT) : ideas
  const lockedCount = isStarter ? Math.max(0, ideas.length - FREE_IDEAS_LIMIT) : 0
  const fakeCardsToShow = Math.min(lockedCount, FAKE_CARDS.length)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
      {/* Real visible cards */}
      {visibleIdeas.map((idea, idx) => {
        const ideaWithMeta = idea as IdeaWithMeta
        const hash = ideaWithMeta.idea_hash || Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
        const isSaved = savedHashes?.has(hash)
        const dbId = ideaWithMeta.id || savedIdsMap?.get(hash)

        return (
          <BriefCard
            key={idx}
            idea={idea}
            isSaved={isSaved}
            dbId={dbId}
            plan={plan}
          />
        )
      })}

      {/* Fake blurred cards — rendered as normal grid items so they fill the next slots */}
      {lockedCount > 0 && FAKE_CARDS.slice(0, fakeCardsToShow).map((card, i) => (
        <div
          key={`locked-${i}`}
          className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.03] flex flex-col pointer-events-none select-none"
          style={{ filter: 'blur(4px)', opacity: i === 0 ? 0.5 : i === 1 ? 0.3 : 0.15 }}
          aria-hidden="true"
        >
          <div className="p-8 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 ${card.formatColor}`}>
                {card.format} Strategy
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">
              {card.title}
            </h3>
          </div>
          <div className="px-8 pb-6 space-y-4 flex-1">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">The Hook</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium italic">{card.hook}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategy Preview</span>
              <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-2">{card.desc}</p>
            </div>
          </div>
          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
            <div className="h-10 w-32 rounded-xl bg-white/5" />
            <div className="h-10 w-28 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}

      {/* Absolute overlay covering the fake cards area at the bottom of the grid */}
      {lockedCount > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end pb-12 gap-5 pointer-events-none"
          style={{
            height: '420px',
            background: 'linear-gradient(to top, rgba(0,0,0,1) 30%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.4) 75%, transparent 100%)',
          }}
        >
          <div className="pointer-events-auto flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-2 text-center max-w-xs">
              <p className="text-white font-black text-xl tracking-tight">
                {lockedCount} more strategies locked
              </p>
              <p className="text-slate-400 text-sm font-light">
                Upgrade to Pro to unlock all 20 trend-backed ideas every week.
              </p>
            </div>
            <Button
              onClick={() => openUpgrade('20 Ideas Unlocked')}
              className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Unlock All 20 — $19/mo
            </Button>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No commitment · Cancel anytime</p>
          </div>
        </div>
      )}
    </div>
  )
}
