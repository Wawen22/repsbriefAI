'use client'

import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader
} from "@/components/ui/sheet"
import { Menu, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "./DashboardSidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function MobileNav({ plan, userId, userEmail }: { plan: string, userId: string, userEmail: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sheet on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">RepsBrief</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access dashboard sections and account settings.</SheetDescription>
        </SheetHeader>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-black border-r border-white/5 w-72">
          {/* We reuse the sidebar but without the 'hidden lg:flex' classes */}
          <div className="h-full flex flex-col">
             <DashboardSidebar plan={plan} userId={userId} userEmail={userEmail} isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
