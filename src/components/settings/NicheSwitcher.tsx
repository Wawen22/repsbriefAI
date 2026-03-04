'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dumbbell, PiggyBank, Briefcase, Baby, Cpu, Check, Loader2 } from 'lucide-react'
import { updateActiveNicheAction } from '@/app/actions/profile'
import { toast } from 'sonner'

const NICHE_OPTIONS = [
  { id: 'fitness', label: 'Fitness & Nutrition', icon: Dumbbell, active: true },
  { id: 'personal_finance', label: 'Personal Finance', icon: PiggyBank, active: false },
  { id: 'b2b_marketing', label: 'B2B Marketing', icon: Briefcase, active: false },
  { id: 'parenting', label: 'Parenting', icon: Baby, active: false },
  { id: 'tech_ai', label: 'AI & Tech', icon: Cpu, active: false },
]

interface NicheSwitcherProps {
  currentNiche: string
}

export function NicheSwitcher({ currentNiche }: NicheSwitcherProps) {
  const [selected, setSelected] = useState(currentNiche)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSwitch = async (nicheId: string) => {
    if (nicheId === selected || loading) return

    setLoading(nicheId)
    try {
      const result = await updateActiveNicheAction(nicheId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setSelected(nicheId)
        toast.success('Content niche updated!')
      }
    } catch {
      toast.error('Failed to update niche')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {NICHE_OPTIONS.map((niche) => {
        const Icon = niche.icon
        const isSelected = selected === niche.id
        const isLoading = loading === niche.id

        return (
          <button
            key={niche.id}
            onClick={() => niche.active && handleSwitch(niche.id)}
            disabled={!niche.active || !!loading}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
              ${isSelected
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                : niche.active
                ? 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
                : 'bg-slate-950/30 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : isSelected ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{niche.label}</p>
              {!niche.active && (
                <p className="text-[11px] text-slate-600 italic">Coming soon</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
