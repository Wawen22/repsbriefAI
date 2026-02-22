'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { LayoutGrid, Calendar, Inbox, Crown, Zap } from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'This Week', href: '/dashboard', icon: LayoutGrid },
    { name: 'History', href: '/dashboard/history', icon: Calendar },
    { name: 'My Ideas', href: '/dashboard/ideas', icon: Inbox },
  ]

  return (
        <aside className="w-64 border-r border-slate-900 bg-slate-950 p-6 hidden lg:flex flex-col gap-8 sticky top-0 h-screen">
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
                <Crown className="w-4 h-4 text-yellow-500" /> Pro Plan Active
              </div>
              <p className="text-[12px] text-slate-500">Your next strategy brief arrives next Monday morning.</p>
              <Button size="sm" variant="outline" className="w-full h-8 text-[12px] border-slate-700">Manage Billing</Button>
           </div>
        </aside>
  )
}
