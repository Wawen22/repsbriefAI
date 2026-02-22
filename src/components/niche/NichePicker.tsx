// src/components/niche/NichePicker.tsx

import { Button } from "@/components/ui/button"
import { NICHES } from "@/config/niches"
import { Dumbbell, PiggyBank, Briefcase, Baby, Cpu } from "lucide-react"

export function NichePicker() {
  const niches = [
    { id: 'fitness', label: 'Fitness & Nutrition', icon: <Dumbbell className="w-4 h-4" />, active: true },
    { id: 'finance', label: 'Personal Finance', icon: <PiggyBank className="w-4 h-4" />, active: false },
    { id: 'b2b', label: 'B2B Marketing', icon: <Briefcase className="w-4 h-4" />, active: false },
    { id: 'parenting', label: 'Parenting', icon: <Baby className="w-4 h-4" />, active: false },
    { id: 'tech', label: 'AI & Tech', icon: <Cpu className="w-4 h-4" />, active: false },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {niches.map((n) => (
        <Button
          key={n.id}
          variant={n.id === 'fitness' ? 'secondary' : 'ghost'}
          disabled={!n.active}
          className={`gap-2 h-9 px-4 rounded-full text-xs font-semibold ${
            n.active 
              ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30' 
              : 'text-slate-600 grayscale'
          }`}
        >
          {n.icon}
          {n.label}
          {!n.active && <span className="text-[10px] opacity-50 ml-1 italic font-normal">(Soon)</span>}
        </Button>
      ))}
    </div>
  )
}
