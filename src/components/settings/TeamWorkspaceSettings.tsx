'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, ChevronRight, CheckCircle2, UserPlus, Loader2 } from "lucide-react"
import { getUserTeamsAction, switchTeamAction } from "@/app/actions/team"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { InviteMemberModal } from "./InviteMemberModal"

type Team = {
  id: string;
  name: string;
  owner_id: string;
  role: string;
}

export function TeamWorkspaceSettings() {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)
  const [plan, setPlan] = useState<string>('starter')
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await getUserTeamsAction()
      setTeams(res.teams as any)
      setCurrentTeamId(res.currentTeamId)
      setPlan(res.plan)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleSwitch = async (teamId: string) => {
    if (teamId === currentTeamId) return
    setIsSwitching(teamId)
    const tid = toast.loading("Switching workspace...")
    try {
      const res = await switchTeamAction(teamId)
      if (res.success) {
        setCurrentTeamId(teamId)
        toast.success("Workspace switched!", { id: tid })
        window.location.reload() // Force reload to refresh all server components
      } else {
        toast.error(res.error || "Failed to switch", { id: tid })
      }
    } catch (e) {
      toast.error("Something went wrong", { id: tid })
    } finally {
      setIsSwitching(null)
    }
  }

  const isTeamPlan = plan === 'team'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-3">
        {teams.map((team) => {
          const isActive = team.id === currentTeamId
          return (
            <button
              key={team.id}
              onClick={() => handleSwitch(team.id)}
              disabled={!!isSwitching}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                isActive 
                  ? "bg-blue-500/10 border-blue-500/30" 
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center gap-4 text-left">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                  isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-slate-400"
                )}>
                  {team.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className={cn("font-bold text-sm", isActive ? "text-white" : "text-slate-300")}>
                    {team.name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    Role: {team.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                {isActive && (
                  <Badge variant="outline" className="text-blue-400 border-blue-500/20 bg-blue-500/5 text-[9px] uppercase tracking-widest font-black hidden sm:flex">
                    Active
                  </Badge>
                )}
                {isSwitching === team.id ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                  <ChevronRight className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Invite Member Section (Only for Team Plan) */}
      <div className="pt-6 border-t border-white/5 text-left">
        {!isTeamPlan ? (
          <div className="p-5 rounded-2xl bg-black/50 border border-white/5 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
               <Crown className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="space-y-2 flex-1 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Unlock Team Features</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                Upgrade to the Team Plan to invite collaborators, share your brand persona, and manage content approval workflows.
              </p>
            </div>
          </div>
        ) : (
          <InviteMemberModal />
        )}
      </div>
    </div>
  )
}
