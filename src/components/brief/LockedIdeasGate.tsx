'use client'

import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LockedIdeasGateProps {
  lockedCount: number
}

// Fake content to make blurred cards look realistic
const FAKE_CARDS = [
  { format: 'Reel', formatColor: 'bg-pink-500/10 text-pink-400', title: 'Why Most Creators Plateau at 10K (And How to Break Through)', hook: '"The algorithm doesn\'t reward consistency — it rewards pattern interrupts."', desc: 'Deep dive into the velocity-vs-retention trap that kills momentum for mid-tier accounts.' },
  { format: 'Carousel', formatColor: 'bg-blue-500/10 text-blue-400', title: '5 Counter-Intuitive Nutrition Hacks Elite Athletes Swear By', hook: '"Everything you learned about meal timing is backwards."', desc: 'Science-backed breakdown of the fasted training myth and why your pre-workout ritual may be hurting gains.' },
  { format: 'Thread', formatColor: 'bg-cyan-500/10 text-cyan-400', title: 'I Analyzed 200 Viral Fitness Posts — Here\'s The Exact Pattern', hook: '"Viral content isn\'t luck — it\'s a formula you can copy today."', desc: 'Data-driven thread with screenshots, engagement rates, and the hidden structural element 94% of top posts share.' },
  { format: 'Newsletter', formatColor: 'bg-emerald-500/10 text-emerald-400', title: 'The Recovery Protocol That\'s Replacing Ice Baths for Pro Athletes', hook: '"Cold plunges are out. This is what the science actually says."', desc: 'Evidence review on HRV-guided recovery windows — with a plug-and-play weekly schedule you can share directly.' },
  { format: 'Reel', formatColor: 'bg-pink-500/10 text-pink-400', title: 'This Single Mindset Shift 10x\'d My Client\'s Consistency', hook: '"Stop chasing motivation. Start designing your environment."', desc: 'Behavioral-change framework applied to fitness routines — the same system used by Olympic coaches.' },
]

export function LockedIdeasGate({ lockedCount }: LockedIdeasGateProps) {
  const cardsToShow = Math.min(lockedCount, FAKE_CARDS.length)

  return (
    <div className="col-span-full relative mt-2">
      {/* Blurred fake cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none pointer-events-none">
        {Array.from({ length: cardsToShow }).map((_, i) => {
          const card = FAKE_CARDS[i % FAKE_CARDS.length]
          return (
            <div
              key={i}
              className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.03] flex flex-col"
              style={{ filter: 'blur(4px)', opacity: i === 0 ? 0.55 : i === 1 ? 0.35 : 0.2 }}
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
          )
        })}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6 px-8 py-12"
           style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.98) 40%, rgba(0,0,0,0.7) 70%, transparent 100%)' }}>
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Lock className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2 max-w-xs">
          <p className="text-white font-black text-xl tracking-tight">
            {lockedCount} more strategies locked
          </p>
          <p className="text-slate-400 text-sm font-light">
            Upgrade to Pro to unlock all 20 trend-backed ideas every week.
          </p>
        </div>
        <Button
          className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all"
          asChild
        >
          <Link href="/dashboard/settings?tab=billing">
            <Zap className="w-4 h-4 mr-2" />
            Unlock All 20 — $19/mo
          </Link>
        </Button>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No commitment · Cancel anytime</p>
      </div>
    </div>
  )
}
