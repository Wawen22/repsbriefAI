'use client'

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutGrid,
  Calendar,
  Star,
  Settings,
  LogOut,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Failed to log out')
    }
  }

  const isStrategyPage = pathname?.includes('/dashboard/strategy/')

  return (
    <>
      {/* Visual Indicator in UI - Repositioned based on context */}
      <div 
        id="command-palette-indicator" 
        className={cn(
          "fixed z-[250] hidden lg:block transition-all duration-500 ease-in-out",
          isStrategyPage 
            ? "bottom-8 left-8" 
            : "bottom-6 left-1/2 -translate-x-1/2"
        )}
      >
         <button 
           onClick={() => setOpen(true)}
           className={cn(
             "flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-3xl shadow-2xl group ring-1 ring-white/5",
             isStrategyPage && "hover:scale-105 active:scale-95"
           )}
         >
           <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Search</span>
           </div>
           <div className="h-3 w-px bg-white/10" />
           <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-slate-300 opacity-100">
             <span className="text-xs">⌘</span>K
           </kbd>
         </button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-[#090909] border border-white/[0.12] overflow-hidden rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.95)]">
          <CommandInput 
            placeholder="Search studio commands, routes, and features..." 
            className="h-12 border-b border-white/[0.08] px-4 text-xs font-mono text-white placeholder:text-white/40 focus:ring-0"
          />
          <CommandList className="max-h-[380px] custom-scrollbar p-2">
            <CommandEmpty className="py-8 text-center text-white/40 font-mono text-xs">
              No results found.
            </CommandEmpty>
            
            <CommandGroup heading="Workspace Navigation" className="text-[10px] font-mono uppercase tracking-wider text-white/35 px-2 pt-3 pb-1.5">
              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-white/[0.08] aria-selected:text-white text-white/70 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="font-medium">This Week&apos;s Brief</span>
                <CommandShortcut className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/50">G D</CommandShortcut>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/history"))}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-white/[0.08] aria-selected:text-white text-white/70 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-medium">History & Archive</span>
                <CommandShortcut className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/50">G H</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/ideas"))}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-white/[0.08] aria-selected:text-white text-white/70 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <Star className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="font-medium">Saved Ideas Library</span>
                <CommandShortcut className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/50">G S</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-white/[0.08] aria-selected:text-white text-white/70 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-white/[0.06] border border-white/[0.10]">
                  <Settings className="w-3.5 h-3.5 text-white/80" />
                </div>
                <span className="font-medium">Account & Settings</span>
                <CommandShortcut className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/50">G ,</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-1.5 bg-white/[0.06]" />

            <CommandGroup heading="Studio Actions" className="text-[10px] font-mono uppercase tracking-wider text-white/35 px-2 pt-1.5 pb-1.5">
              <CommandItem 
                onSelect={() => runCommand(() => {
                  router.push("/dashboard/ideas")
                })}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-white/[0.08] aria-selected:text-white text-white/70 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-white/[0.06] border border-white/[0.10]">
                  <Plus className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium text-white">Add New Idea</span>
                <CommandShortcut className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/50">N</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(handleLogout)}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer aria-selected:bg-rose-500/10 aria-selected:text-rose-400 text-white/50 text-xs transition-colors"
              >
                <div className="p-1.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="font-medium">Sign Out</span>
              </CommandItem>
            </CommandGroup>

            <div className="p-3 mt-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-2.5">
               <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
               <p className="text-[10.5px] text-white/50 leading-tight font-mono">
                 Press <kbd className="text-white bg-white/[0.08] border border-white/[0.12] px-1 py-0.2 rounded text-[10px]">⌘K</kbd> anywhere to navigate the studio.
               </p>
            </div>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  )
}
