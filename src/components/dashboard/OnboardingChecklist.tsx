'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface OnboardingChecklistProps {
  voiceConfigured: boolean
  briefGenerated: boolean
  ideaSaved: boolean
}

const ITEMS = [
  {
    key: 'voiceConfigured' as const,
    label: 'Set up your AI Voice',
    href: '/dashboard/settings?tab=voice',
    linkLabel: 'Go to Voice settings',
  },
  {
    key: 'briefGenerated' as const,
    label: 'Generate your first brief',
    href: '/dashboard',
    linkLabel: 'Go to Dashboard',
  },
  {
    key: 'ideaSaved' as const,
    label: 'Move an idea to production',
    href: '/dashboard/ideas',
    linkLabel: 'Go to Ideas board',
  },
]

export function OnboardingChecklist({ voiceConfigured, briefGenerated, ideaSaved }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const completionMap = { voiceConfigured, briefGenerated, ideaSaved }
  const completedCount = Object.values(completionMap).filter(Boolean).length
  const allDone = completedCount === 3

  if (allDone || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 rounded-[1.5rem] bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-white uppercase tracking-widest">Getting Started</p>
            <p className="text-[10px] text-slate-500 font-medium">{completedCount}/3 steps complete</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {collapsed
            ? <ChevronUp className="w-4 h-4 text-slate-600" />
            : <ChevronDown className="w-4 h-4 text-slate-600" />
          }
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
            className="ml-1 p-1 rounded-full hover:bg-white/10 text-slate-600 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-px bg-white/5 mx-5">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="px-5 py-4 space-y-3">
          {ITEMS.map(item => {
            const done = completionMap[item.key]
            return (
              <div key={item.key} className="flex items-center gap-3">
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <Circle className="w-4 h-4 text-white/20 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold truncate", done ? "text-slate-600 line-through" : "text-slate-300")}>
                    {item.label}
                  </p>
                  {!done && (
                    <Link
                      href={item.href}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors"
                    >
                      {item.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
