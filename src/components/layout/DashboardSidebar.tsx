'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { LayoutGrid, Calendar, Inbox, Crown, Zap, Settings, Star, Loader2 } from "lucide-react"
import { LogoutButton } from "@/components/ui/LogoutButton"

export function DashboardSidebar({ plan = 'starter', userId, userEmail }: { plan?: string, userId?: string, userEmail?: string }) {
  const pathname = usePathname()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_1T3kiQQ8w32NjQAk6830MCV3',
          userId,
          userEmail
        })
      })
      
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
    { name: 'History', href: '/dashboard/history', icon: Calendar },
    { name: 'My Ideas', href: '/dashboard/ideas', icon: Inbox },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
        <aside className="w-64 border-r border-slate-900 bg-slate-950 p-6 hidden lg:flex flex-col gap-8 flex-shrink-0 overflow-y-auto">
           <div className="flex items-center gap-2 px-2">
             <Zap className="w-6 h-6 text-blue-500 fill-blue-500" />
             <span className="text-xl font-bold tracking-tight">RepsBrief</span>
           </div>
           
           <nav className="space-y-1">
             {navItems.map((item) => {
               const isActive = pathname === item.href
               const Icon = item.icon
               return (
                 <Link key={item.name} href={item.href} passHref>
                   <Button 
                     variant="ghost" 
                     className={`w-full justify-start gap-3 ${isActive ? 'text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-300' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                   >
                     <Icon className="w-4 h-4" /> {item.name}
                   </Button>
                 </Link>
               )
             })}
           </nav>

           <div className="mt-auto p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {plan === 'pro' ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-500" /> Pro Plan Active
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 text-slate-400" /> Starter Plan
                  </>
                )}
              </div>
              
              {plan === 'pro' ? (
                <>
                  <p className="text-[12px] text-slate-500">Your next strategy brief arrives next Monday morning.</p>
                  <Link href="/dashboard/settings" className="w-full inline-block">
                    <Button size="sm" variant="outline" className="w-full h-8 text-[12px] border-slate-700 text-slate-950 hover:bg-white">Manage Account</Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[12px] text-slate-500">Upgrade to Pro to automate your briefs.</p>
                  <Button 
                    size="sm" 
                    className="w-full h-8 text-[12px] bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Pro"}
                  </Button>
                </>
              )}
           </div>
           
           <div className="mt-2">
             <LogoutButton />
           </div>
        </aside>
  )
}
