'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  History as HistoryIcon,
  Star,
  BarChart3,
  CalendarDays,
  Settings,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TeamSwitcher } from './TeamSwitcher'
import { UserProfileMenu } from './UserProfileMenu'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  plan?: string
  isMobile?: boolean
  userEmail?: string
  userFullName?: string | null
}

export function DashboardSidebar({ 
  plan = 'starter', 
  isMobile = false,
  userEmail = '',
  userFullName = null,
}: SidebarProps) {
  const pathname = usePathname()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const hasPaidPlan = plan === 'pro' || plan === 'team'

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

  const mainNav = [
    { name: 'This Week', href: '/dashboard', icon: LayoutGrid },
    { name: 'History', href: '/dashboard/history', icon: HistoryIcon },
    { name: 'Saved Ideas', href: '/dashboard/ideas', icon: Star },
  ]

  const planNav = [
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ]

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link key={item.name} href={item.href}>
        <div
          className={cn(
            'group relative flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer select-none',
            isActive
              ? 'text-white bg-white/[0.08] border border-white/[0.12] shadow-[0_1px_3px_rgba(0,0,0,0.5)]'
              : 'text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent'
          )}
        >
          <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/80')} />
          <span className={cn('truncate transition-colors', isActive && 'font-semibold text-white')}>{item.name}</span>
        </div>
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'w-[250px] border-r border-white/[0.08] bg-[#070707]/95 backdrop-blur-2xl flex flex-col flex-shrink-0 relative z-20 h-full select-none',
        !isMobile && 'hidden lg:flex'
      )}
    >
      {/* Brand & Studio Tag */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/[0.08] bg-[#0c0c0c]/50">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="RepsBrief"
            width={28}
            height={28}
            className="rounded-lg border border-white/[0.12]"
          />
          <span className="text-sm font-bold tracking-tight text-white group-hover:text-white/90">RepsBrief</span>
        </Link>
        <span className="font-mono text-[9px] uppercase tracking-wider text-white/40 border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 rounded">
          Studio
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3 py-3 custom-scrollbar space-y-5">
        {/* Team Switcher */}
        <div className="px-0.5">
          <TeamSwitcher />
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-white/35">
            Core Workspace
          </p>
          {mainNav.map(renderNavItem)}
        </div>

        {/* Plan & Tools */}
        <div className="space-y-1">
          <p className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-white/35">
            Studio Tools
          </p>
          {planNav.map(renderNavItem)}
        </div>

        {/* Settings */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1">
          <Link href="/dashboard/settings">
            <div
              className={cn(
                'group relative flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer',
                pathname === '/dashboard/settings'
                  ? 'text-white bg-white/[0.08] border border-white/[0.12]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03] border border-transparent'
              )}
            >
              <Settings className={cn('w-4 h-4 shrink-0 transition-colors', pathname === '/dashboard/settings' ? 'text-white' : 'text-white/40 group-hover:text-white/80')} />
              <span className={cn('transition-colors', pathname === '/dashboard/settings' && 'font-semibold text-white')}>
                Settings & API
              </span>
            </div>
          </Link>
        </div>

        {/* Upgrade CTA (free users only) */}
        {!hasPaidPlan && (
          <div className="mt-auto pt-4 px-0.5">
            <div className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-[#090909] p-3.5 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Pro Tier
                </span>
                <span className="font-mono text-[9px] text-white/40">$19/mo</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                Unlimited daily AI brief generation, multi-channel sync, and teleprompter mode.
              </p>
              <Button
                size="sm"
                className="w-full h-7 text-[11px] bg-white text-black hover:bg-white/90 font-medium rounded-md transition-all cursor-pointer shadow-sm"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Upgrade to Pro →</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Badge - Bottom */}
      <div className="shrink-0 border-t border-white/[0.08] px-3 py-2.5 bg-[#090909]/60">
        <UserProfileMenu
          email={userEmail}
          fullName={userFullName}
          plan={plan}
        />
      </div>
    </aside>
  )
}
