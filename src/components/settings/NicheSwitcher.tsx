'use client'

import { useState } from 'react'
import { Briefcase, Cpu, Dumbbell, Loader2, PiggyBank, Sparkles, Baby, Check } from 'lucide-react'
import { updateActiveNicheAction } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { NICHES } from '@/config/niches'
import { cn } from '@/lib/utils'

const NICHE_META = {
  fitness: { label: 'Fitness & Nutrition', icon: Dumbbell, accent: 'text-blue-400', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
  personal_finance: { label: 'Personal Finance', icon: PiggyBank, accent: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
  b2b_marketing: { label: 'B2B Marketing', icon: Briefcase, accent: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/20 text-violet-300' },
  parenting: { label: 'Parenting', icon: Baby, accent: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/20 text-rose-300' },
  tech_ai: { label: 'AI & Tech', icon: Cpu, accent: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
} as const

const DISPLAY_ORDER = ['fitness', 'personal_finance', 'b2b_marketing', 'parenting', 'tech_ai'] as const

interface NicheSwitcherProps {
  currentNiche: string
}

export function NicheSwitcher({ currentNiche }: NicheSwitcherProps) {
  const [selected, setSelected] = useState(currentNiche)
  const [loading, setLoading] = useState<string | null>(null)

  const nicheOptions = DISPLAY_ORDER.map((id) => {
    const config = NICHES[id]
    const meta = NICHE_META[id]
    return {
      id,
      label: config?.label || meta.label,
      icon: meta.icon,
      accent: meta.accent,
      badge: meta.badge,
      active: config?.active ?? false,
    }
  })

  const handleSwitch = async (nicheId: string) => {
    if (nicheId === selected || loading) return

    setLoading(nicheId)
    try {
      const result = await updateActiveNicheAction(nicheId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setSelected(nicheId)
        toast.success('Content niche updated.')
      }
    } catch {
      toast.error('Failed to update niche')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {nicheOptions.map((niche) => {
        const Icon = niche.icon
        const isSelected = selected === niche.id
        const isLoading = loading === niche.id

        return (
          <button
            key={niche.id}
            onClick={() => niche.active && handleSwitch(niche.id)}
            disabled={!niche.active || !!loading}
            aria-pressed={isSelected}
            className={cn(
              'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
              isSelected && 'border-blue-500/40 bg-blue-500/[0.08] shadow-[0_0_24px_-16px_rgba(59,130,246,0.9)]',
              !isSelected && niche.active && 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]',
              !niche.active && 'cursor-not-allowed border-white/5 bg-white/[0.01] opacity-55'
            )}
          >
            {isSelected && (
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            )}

            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  'rounded-xl border p-2.5 transition-colors',
                  isSelected ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 bg-white/5'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                ) : (
                  <Icon className={cn('h-4 w-4', isSelected ? 'text-blue-300' : niche.accent)} />
                )}
              </div>

              {isSelected && (
                <Badge className="border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                  Active
                </Badge>
              )}
              {!niche.active && (
                <Badge className={cn('border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest', niche.badge)}>
                  Coming Soon
                </Badge>
              )}
            </div>

            <div className="mt-3 space-y-1">
              <p className={cn('font-semibold tracking-tight', isSelected ? 'text-white' : 'text-slate-200')}>
                {niche.label}
              </p>
              {isSelected ? (
                <p className="text-[11px] text-blue-300">Currently used for trend scouting and brief generation.</p>
              ) : niche.active ? (
                <p className="text-[11px] text-slate-500">Available now. Click to switch your strategy focus.</p>
              ) : (
                <p className="text-[11px] text-slate-600">Planned for future releases.</p>
              )}
            </div>

            {isSelected && (
              <div className="absolute bottom-4 right-4 rounded-full border border-blue-500/30 bg-blue-500/10 p-1">
                <Check className="h-3 w-3 text-blue-300" />
              </div>
            )}
            {!niche.active && (
              <Sparkles className="absolute bottom-4 right-4 h-3.5 w-3.5 text-slate-700" />
            )}
          </button>
        )
      })}
    </div>
  )
}
