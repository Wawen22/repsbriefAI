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
    <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.08] bg-[#070707]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo.png"
          alt="RepsBrief"
          width={28}
          height={28}
          className="rounded-lg border border-white/[0.12]"
        />
        <span className="text-sm font-bold tracking-tight text-white">RepsBrief</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access dashboard sections and account settings.</SheetDescription>
        </SheetHeader>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/[0.05] h-8 w-8 rounded-lg">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#070707] border-r border-white/[0.08] w-72">
          <div className="h-full flex flex-col">
             <DashboardSidebar plan={plan} isMobile userEmail={userEmail} userFullName={userFullName} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
