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
        <div className="bg-black border-white/10 overflow-hidden rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
          <CommandInput 
            placeholder="Search commands or navigation..." 
            className="h-14 border-none focus:ring-0 text-white placeholder:text-slate-600"
          />
          <CommandList className="max-h-[400px] custom-scrollbar p-2">
            <CommandEmpty className="py-10 text-center text-slate-500 font-light">
              No results found.
            </CommandEmpty>
            
            <CommandGroup heading="Navigation" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pt-4 pb-2">
              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-white/5 aria-selected:text-white text-slate-400"
              >
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <LayoutGrid className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-semibold">This Week&apos;s Brief</span>
                <CommandShortcut>G D</CommandShortcut>
              </CommandItem>
              
              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/history"))}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-white/5 aria-selected:text-white text-slate-400"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-semibold">History & Archive</span>
                <CommandShortcut>G H</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/ideas"))}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-white/5 aria-selected:text-white text-slate-400"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <span className="font-semibold">Saved Ideas Library</span>
                <CommandShortcut>G S</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-white/5 aria-selected:text-white text-slate-400"
              >
                <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
                  <Settings className="w-4 h-4 text-slate-400" />
                </div>
                <span className="font-semibold">Account Settings</span>
                <CommandShortcut>G ,</CommandShortcut>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-2 bg-white/5" />

            <CommandGroup heading="Actions" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pt-2 pb-2">
              <CommandItem 
                onSelect={() => runCommand(() => {
                  router.push("/dashboard/ideas")
                })}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-white/5 aria-selected:text-white text-slate-400"
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white">Add New Idea</span>
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>

              <CommandItem 
                onSelect={() => runCommand(handleLogout)}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer aria-selected:bg-rose-500/10 aria-selected:text-rose-400 text-slate-500"
              >
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <LogOut className="w-4 h-4 text-rose-500" />
                </div>
                <span className="font-semibold">Logout</span>
              </CommandItem>
            </CommandGroup>

            <div className="p-4 mt-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
               <Sparkles className="w-4 h-4 text-blue-400" />
               <p className="text-[10px] text-slate-500 leading-tight">
                 Tip: Use <kbd className="text-slate-300 font-mono">⌘K</kbd> anywhere to quickly jump between strategies and your library.
               </p>
            </div>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  )
}
