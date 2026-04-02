'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Zap, Loader2, X, Sparkles } from 'lucide-react'
import { create } from 'zustand'

// ─── Global store ─────────────────────────────────────────────────────────────
interface UpgradeModalStore {
  isOpen: boolean
  featureName: string | null
  open: (featureName?: string) => void
  close: () => void
}

export const useUpgradeModal = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  featureName: null,
  open: (featureName) => set({ isOpen: true, featureName: featureName || null }),
  close: () => set({ isOpen: false, featureName: null }),
}))

// ─── Pro features list ────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Daily brief — 20 fresh ideas every day',
  'All 20 ideas unlocked per brief',
  'Full production script for every idea',
  'AI Strategy Remix — rewrite in any style',
  'Live Recording / Teleprompter Mode',
  'Export PDF & Markdown',
  'Notion integration',
  'Google Calendar sync',
]

// ─── Component ────────────────────────────────────────────────────────────────
export function UpgradeModal() {
  const { isOpen, featureName, close } = useUpgradeModal()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })
      if (!res.ok) throw new Error('Unable to start checkout')
      const session = await res.json()
      if (session?.url) window.location.href = session.url
    } catch {
      // fall through
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogContent className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-0 max-w-md w-full shadow-2xl overflow-hidden gap-0">

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header glow */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-blue-600/10 to-transparent border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_70%)]" />
          <div className="relative space-y-3">
            {featureName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{featureName} · Pro Feature</span>
              </div>
            )}
            <h2 className="text-2xl font-black text-white tracking-tight">
              Unlock the full Studio
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$19</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            <p className="text-slate-400 text-sm">Cancel anytime. No contracts.</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="px-8 py-6 space-y-3">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-blue-400" />
              </div>
              <span className="text-sm text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-8 pb-8 space-y-3">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all gap-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro — $19/mo
              </>
            )}
          </Button>
          <button
            onClick={close}
            className="w-full text-center text-[11px] text-slate-600 hover:text-slate-400 transition-colors font-medium py-1"
          >
            Maybe later
          </button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
