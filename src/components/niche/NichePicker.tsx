// src/components/niche/NichePicker.tsx
'use client'

import * as React from "react"
import { Check, ChevronsUpDown, Dumbbell, PiggyBank, Briefcase, Baby, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const niches = [
  { id: 'fitness', label: 'Fitness & Nutrition', icon: <Dumbbell className="w-4 h-4" />, active: true },
  { id: 'finance', label: 'Personal Finance', icon: <PiggyBank className="w-4 h-4" />, active: false },
  { id: 'b2b', label: 'B2B Marketing', icon: <Briefcase className="w-4 h-4" />, active: false },
  { id: 'parenting', label: 'Parenting', icon: <Baby className="w-4 h-4" />, active: false },
  { id: 'tech', label: 'AI & Tech', icon: <Cpu className="w-4 h-4" />, active: false },
]

export function NichePicker() {
  const [open, setOpen] = React.useState(false)
  const currentNiche = niches.find(n => n.id === 'fitness')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-between gap-3 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-full h-10 px-4 transition-all"
        >
          <div className="flex items-center gap-2 text-white">
            <div className="text-blue-400">
              {currentNiche?.icon}
            </div>
            <span className="text-sm font-semibold tracking-tight">{currentNiche?.label}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 bg-black border-white/10 shadow-2xl rounded-2xl overflow-hidden">
        <Command className="bg-transparent">
          <CommandInput 
            placeholder="Search niche..." 
            className="border-none focus:ring-0 text-white h-12 placeholder:text-slate-600" 
          />
          <CommandList className="custom-scrollbar">
            <CommandEmpty className="py-6 text-center text-sm text-slate-500">No niche found.</CommandEmpty>
            <CommandGroup className="p-2">
              {niches.map((n) => (
                <CommandItem
                  key={n.id}
                  disabled={!n.active}
                  onSelect={() => {
                    if (n.active) setOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 outline-none",
                    "aria-selected:bg-white/10 aria-selected:text-white",
                    n.id === 'fitness' 
                      ? "bg-blue-500/10 text-blue-400 aria-selected:bg-blue-500/20 aria-selected:text-blue-300" 
                      : "text-slate-400",
                    !n.active && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg border transition-colors",
                      n.id === 'fitness' ? "bg-blue-500/10 border-blue-500/20" : "bg-white/5 border-white/5"
                    )}>
                      {n.icon}
                    </div>
                    <div className="flex flex-col">
                       <span className="font-semibold text-sm">{n.label}</span>
                       {!n.active && <span className="text-[10px] opacity-70">Coming soon</span>}
                    </div>
                  </div>
                  {n.id === 'fitness' && <Check className="h-4 w-4 text-blue-400" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
