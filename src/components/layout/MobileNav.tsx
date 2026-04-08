'use client'

import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "./DashboardSidebar"
import { useState } from "react"

export function MobileNav({ plan, userEmail, userFullName }: { plan: string; userEmail: string; userFullName: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden flex items-center justify-between px-6 h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="RepsBrief"
          width={32}
          height={32}
          className="rounded-lg"
        />
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
             <DashboardSidebar plan={plan} isMobile userEmail={userEmail} userFullName={userFullName} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
