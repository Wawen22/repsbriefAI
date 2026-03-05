'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  ChevronDown, 
  Check, 
  PlusCircle, 
  LayoutGrid,
  Loader2,
  Orbit
} from "lucide-react"
import { getUserTeamsAction, switchTeamAction } from "@/app/actions/team"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function TeamSwitcher() {
  const [teams, setTeams] = useState<any[]>([])
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getUserTeamsAction()
      setTeams(res.teams)
      setCurrentTeamId(res.currentTeamId)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSwitch = async (teamId: string) => {
    if (teamId === currentTeamId) {
      setIsOpen(false)
      return
    }
    
    const tid = toast.loading("Switching workspace...")
    try {
      const res = await switchTeamAction(teamId)
      if (res.success) {
        toast.success("Switched!", { id: tid })
        window.location.reload()
      } else {
        toast.error(res.error || "Failed to switch", { id: tid })
      }
    } catch (e) {
      toast.error("Something went wrong", { id: tid })
    } finally {
      setIsOpen(false)
    }
  }

  const currentTeam = teams.find(t => t.id === currentTeamId)

  if (isLoading) return <div className="h-10 w-full animate-pulse bg-white/5 rounded-xl" />

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between h-12 px-3 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-all group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
              <span className="text-[10px] font-black text-white">{currentTeam?.name?.[0].toUpperCase()}</span>
            </div>
            <span className="text-sm font-bold text-white truncate">{currentTeam?.name || 'Select Workspace'}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2 bg-[#0a0a0a] border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl" align="start" sideOffset={8}>
        <div className="p-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-3">
          Your Workspaces
        </div>
        
        <div className="space-y-1">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSwitch(team.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group",
                team.id === currentTeamId ? "bg-blue-500/10" : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
                  team.id === currentTeamId ? "bg-blue-500 text-white" : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                )}>
                  {team.name[0].toUpperCase()}
                </div>
                <span className={cn("text-xs font-bold", team.id === currentTeamId ? "text-white" : "text-slate-400 group-hover:text-white")}>
                  {team.name}
                </span>
              </div>
              {team.id === currentTeamId && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/5 my-2" />
        
        <button 
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left text-slate-500 hover:text-white group"
          onClick={() => { toast.info("New workspace creation is coming soon!") }}
        >
          <PlusCircle className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          <span className="text-xs font-bold">Create Workspace</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}
