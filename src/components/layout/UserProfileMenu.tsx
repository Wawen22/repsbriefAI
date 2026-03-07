'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Crown,
  CreditCard,
  LogOut,
  Loader2,
  ChevronUp,
  Sparkles,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserProfileMenuProps {
  email: string
  fullName?: string | null
  plan: string
}

export function UserProfileMenu({ email, fullName, plan }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isOpeningBilling, setIsOpeningBilling] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasPaidPlan = plan === 'pro' || plan === 'team'
  const displayName = fullName || email.split('@')[0]
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const planLabel = plan === 'team' ? 'Team' : plan === 'pro' ? 'Pro' : 'Free'

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Failed to log out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        throw new Error(errorBody?.error || 'Unable to start checkout')
      }

      const session = await res.json()
      if (session?.url) {
        window.location.href = session.url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleBilling = async () => {
    try {
      setIsOpeningBilling(true)
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        throw new Error(errorBody?.error || 'Unable to open billing portal')
      }

      const session = await res.json()
      if (session?.url) {
        window.location.href = session.url
        return
      }

      throw new Error('Missing billing portal URL')
    } catch (error) {
      console.error('Billing portal error:', error)
      toast.error('Unable to open billing portal')
    } finally {
      setIsOpeningBilling(false)
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 group',
            'hover:bg-white/[0.04] active:scale-[0.98]',
            isOpen && 'bg-white/[0.04]'
          )}
        >
          {/* Avatar */}
          <Avatar className="h-9 w-9 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-[11px] font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name & Plan */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider leading-none',
                  hasPaidPlan ? 'text-blue-400' : 'text-slate-500'
                )}
              >
                {hasPaidPlan ? (
                  <Crown className="w-2.5 h-2.5" />
                ) : (
                  <Star className="w-2.5 h-2.5" />
                )}
                {planLabel}
              </span>
            </div>
          </div>

          <ChevronUp
            className={cn(
              'w-4 h-4 text-slate-600 transition-transform duration-200',
              isOpen ? 'rotate-0' : 'rotate-180'
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="w-[240px] p-0 bg-[#0c0c0c] border-white/10 rounded-2xl shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden"
      >
        {/* User Info Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-slate-500 truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-1.5">
          {hasPaidPlan ? (
            <button
              onClick={handleBilling}
              disabled={isOpeningBilling}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors disabled:opacity-60"
            >
              {isOpeningBilling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              <span className="text-[13px] font-medium">Billing</span>
              <span className="ml-auto text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">
                {planLabel}
              </span>
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {isUpgrading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-[13px] font-medium">Upgrade to Pro</span>
            </button>
          )}
        </div>

        <div className="h-px bg-white/5 mx-3" />

        {/* Logout */}
        <div className="p-1.5">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="text-[13px] font-medium">Log out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
