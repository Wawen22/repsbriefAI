'use client'

import { useState } from 'react'
import { Copy, Check, Gift, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReferralCardProps {
  referralCode: string
  referralCount: number
  plan: string
}

export function ReferralCard({ referralCode, referralCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false)
  const referralUrl = `https://repsbrief.com/r/${referralCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.07] via-transparent to-purple-500/[0.05] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-blue-400" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-black text-white tracking-tight">Refer & Earn</h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            Invite creators to RepsBrief. When they upgrade to Pro, you both get a free month.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-black text-white">{referralCount}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">referrals</span>
        </div>
        {referralCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </div>
        )}
      </div>

      {/* Referral link */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your invite link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-slate-400 font-mono truncate">
            repsbrief.com/r/<span className="text-white font-bold">{referralCode}</span>
          </div>
          <Button
            onClick={handleCopy}
            size="sm"
            className={cn(
              'shrink-0 h-9 px-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
              copied
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
        <ArrowRight className="w-3 h-3" />
        <span>Share link → they sign up → they upgrade → you both get 1 month free</span>
      </div>
    </div>
  )
}
