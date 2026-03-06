// src/components/layout/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  LayoutGrid, 
  History as HistoryIcon, 
  Crown, 
  Zap, 
  Settings, 
  Star, 
  Loader2, 
  Sparkles, 
  BarChart3,
  CalendarDays
} from "lucide-react"
import { LogoutButton } from "@/components/ui/LogoutButton"
import { cn } from '@/lib/utils'
import { TeamSwitcher } from './TeamSwitcher'

export function DashboardSidebar({ 
  plan = 'starter', 
  isMobile = false 
}: { 
  plan?: string, 
  isMobile?: boolean 
}) {
  const pathname = usePathname()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const hasPaidPlan = plan === 'pro' || plan === 'team'

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
        })
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

  const navItems = [
    { name: 'This Week', href: '/dashboard', icon: LayoutGrid },
    { name: 'History', href: '/dashboard/history', icon: HistoryIcon },
    { name: 'Saved Ideas', href: '/dashboard/ideas', icon: Star },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <aside className={cn(
      "w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-8 flex-shrink-0 overflow-y-auto relative z-20 h-full",
      !isMobile && "hidden lg:flex shadow-2xl"
    )}>
      
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 pt-4 pb-2">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-sans">RepsBrief</span>
      </div>

      {/* Team Switcher */}
      <div className="px-1">
        <TeamSwitcher />
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} passHref>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3 h-10 px-4 rounded-xl transition-all duration-200",
                  isActive 
                    ? 'text-white bg-white/10 border border-white/5 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? 'text-blue-400' : '')} />
                <span className={cn("text-sm font-medium", isActive ? 'text-white' : '')}>{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Subscription Card */}
      <div className="mt-auto relative group overflow-hidden text-left">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-left" />
        
        <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 text-left">
          <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight text-left">
            {hasPaidPlan ? (
              <>
                <div className="p-1 rounded-md bg-blue-500/10 text-left"><Crown className="w-3.5 h-3.5 text-blue-400" /></div>
                {plan === 'team' ? 'Team Member' : 'Pro Member'}
              </>
            ) : (
              <>
                <div className="p-1 rounded-md bg-white/10 text-left"><Star className="w-3.5 h-3.5 text-slate-400" /></div>
                Free Plan
              </>
            )}
          </div>
          
          {hasPaidPlan ? (
            <div className="space-y-3 text-left">
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium text-left">Your next briefing is being prepared for Monday morning.</p>
              <Link href="/dashboard/settings" className="w-full inline-block text-left">
                <Button size="sm" variant="outline" className="w-full h-8 text-[11px] border-white/10 text-slate-300 hover:bg-white/5 rounded-lg transition-colors text-left">Manage Account</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <p className="text-[11px] text-slate-400 leading-relaxed text-left">Upgrade to Pro to automate your briefs and unlock history.</p>
              <Button 
                size="sm" 
                className="w-full h-8 text-[11px] bg-white text-black hover:bg-slate-200 font-bold rounded-lg transition-all text-left"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Upgrade Now
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Nav */}
      <div className="mt-2 pt-2 border-t border-white/5">
        <LogoutButton />
      </div>
    </aside>
  )
}
