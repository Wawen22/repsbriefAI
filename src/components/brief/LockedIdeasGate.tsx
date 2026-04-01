'use client'

import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LockedIdeasGateProps {
  lockedCount: number
}

export function LockedIdeasGate({ lockedCount }: LockedIdeasGateProps) {
  return (
    <div className="col-span-full relative mt-2">
      {/* Faded preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none select-none">
        {Array.from({ length: Math.min(lockedCount, 3) }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 blur-sm opacity-40"
          />
        ))}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-t from-black via-black/80 to-transparent rounded-3xl px-8 py-12">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <p className="text-white font-black text-xl tracking-tight">
            {lockedCount} more strategies locked
          </p>
          <p className="text-slate-400 text-sm font-light max-w-xs">
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
      </div>
    </div>
  )
}
