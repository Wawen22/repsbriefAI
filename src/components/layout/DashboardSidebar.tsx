'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutGrid, 
  History as HistoryIcon, 
  Zap, 
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
            'group relative flex items-center gap-3 h-10 px-3 rounded-xl transition-all duration-200 cursor-pointer',
            isActive
              ? 'text-white bg-white/[0.07]'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
          )}
        >
          {/* Active indicator bar */}
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300',
              isActive
                ? 'h-5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                : 'h-0 bg-transparent group-hover:h-3 group-hover:bg-white/20'
            )}
          />
          <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors', isActive && 'text-blue-400')} />
          <span className={cn('text-[13px] font-medium transition-colors', isActive && 'font-semibold')}>{item.name}</span>
        </div>
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        'w-[260px] border-r border-white/[0.06] bg-black/50 backdrop-blur-2xl flex flex-col flex-shrink-0 relative z-20 h-full',
        !isMobile && 'hidden lg:flex'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">RepsBrief</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3 pb-2 custom-scrollbar">
        {/* Team Switcher */}
        <div className="px-1 pt-2 pb-4">
          <TeamSwitcher />
        </div>

        {/* Main Navigation */}
        <div className="space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">
            Overview
          </p>
          {mainNav.map(renderNavItem)}
        </div>

        {/* Plan & Tools */}
        <div className="space-y-0.5 mt-6">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em]">
            Plan
          </p>
          {planNav.map(renderNavItem)}
        </div>

        {/* Settings — standalone */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <Link href="/dashboard/settings">
            <div
              className={cn(
                'group relative flex items-center gap-3 h-10 px-3 rounded-xl transition-all duration-200 cursor-pointer',
                pathname === '/dashboard/settings'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
              )}
            >
              <Settings className={cn('w-[18px] h-[18px] shrink-0 transition-colors', pathname === '/dashboard/settings' && 'text-slate-300')} />
              <span className={cn('text-[13px] font-medium transition-colors', pathname === '/dashboard/settings' && 'font-semibold text-white')}>
                Settings
              </span>
            </div>
          </Link>
        </div>

        {/* Upgrade CTA (free users only) */}
        {!hasPaidPlan && (
          <div className="mt-auto pt-6 px-1">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-transparent border border-blue-500/10 p-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative space-y-3">
                <p className="text-[12px] font-semibold text-white">
                  Unlock full power
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automate your briefs, access full history, and more.
                </p>
                <Button
                  size="sm"
                  className="w-full h-8 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      Upgrade to Pro
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Badge - Bottom */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-3">
        <UserProfileMenu
          email={userEmail}
          fullName={userFullName}
          plan={plan}
        />
      </div>
    </aside>
  )
}
