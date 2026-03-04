'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dumbbell, PiggyBank, Briefcase, Baby, Cpu, Check, Loader2, Sparkles } from 'lucide-react'
import { updateActiveNicheAction } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

const NICHE_OPTIONS = [
  { id: 'fitness', label: 'Fitness & Nutrition', icon: Dumbbell, active: true, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'personal_finance', label: 'Personal Finance', icon: PiggyBank, active: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'b2b_marketing', label: 'B2B Marketing', icon: Briefcase, active: false, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'parenting', label: 'Parenting', icon: Baby, active: false, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'tech_ai', label: 'AI & Tech', icon: Cpu, active: false, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              relative group flex flex-col items-start gap-4 p-5 rounded-2xl border transition-all text-left overflow-hidden
              ${isSelected
                ? 'bg-white/[0.05] border-blue-500/40 shadow-[0_0_20px_-12px_rgba(59,130,246,0.5)]'
                : niche.active
                ? 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                : 'bg-white/[0.01] border-white/5 opacity-40 cursor-not-allowed'
              }
            `}
          >
            {/* Background Glow for Selected */}
            {isSelected && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-center justify-between w-full">
              <div className={`p-2.5 rounded-xl border transition-colors ${
                isSelected ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5 group-hover:bg-white/10'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                ) : (
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                )}
              </div>
              {isSelected && (
                 <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                    Active
                 </Badge>
              )}
              {!niche.active && (
                <div className="p-1 rounded-md bg-white/5">
                   <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p className={`font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {niche.label}
              </p>
              {!niche.active ? (
                <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">Coming Q2 2026</p>
              ) : (
                <p className="text-[11px] text-slate-500 leading-none">
                  {isSelected ? 'Generating your briefings' : 'Available for strategy'}
                </p>
              )}
            </div>

            {/* Selection indicator dot */}
            {isSelected && (
               <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
