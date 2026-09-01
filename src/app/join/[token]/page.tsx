// src/app/join/[token]/page.tsx

import { getSupabaseAdmin } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Orbit, CheckCircle2, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { acceptInvitationAction } from "@/app/actions/team"
import { PublicStudioShell, publicStudioClasses } from '@/components/layout/PublicStudioShell'

export const dynamic = 'force-dynamic'

export default async function JoinTeamPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabaseAdmin = getSupabaseAdmin('app/join/[token]')
  
  // Get invite details
  const { data: invite } = await supabaseAdmin
    .from('team_invitations')
    .select('*, teams(name)')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (!invite) {
    return (
      <PublicStudioShell contentClassName="max-w-md" showBrandBar={false}>
        <div className={`${publicStudioClasses.surface} w-full p-7 text-center space-y-6`}>
          <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2 text-left text-center">
            <h1 className="text-2xl font-bold text-white">Invalid Invitation</h1>
            <p className="text-slate-400 font-light leading-relaxed">
              This link is either expired, already used, or invalid. Please ask your team owner for a new invitation.
            </p>
          </div>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full rounded-full h-12 border-white/10 text-slate-300">
              Return Home
            </Button>
          </Link>
        </div>
      </PublicStudioShell>
    )
  }

  const inviteTeam = invite.teams as { name?: string } | null
  const teamName = inviteTeam?.name || 'a workspace'

  return (
    <PublicStudioShell contentClassName="max-w-md" showBrandBar={false}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className={`${publicStudioClasses.surface} w-full p-7 sm:p-10 text-center space-y-8`}>
        <div className="flex flex-col items-center gap-4 text-left text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl">
            <Orbit className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1 text-left text-center">
            <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 text-[10px] uppercase font-black px-3 py-1 tracking-widest">
              Team Invitation
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-white pt-2">
              Join {teamName}
            </h1>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">Share content strategies with your team.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">Collaborate on scripts and production notes.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">Manage unified brand personas.</p>
          </div>
        </div>

        <form action={async () => {
          'use server'
          const res = await acceptInvitationAction(token)
          if (res.success) {
            redirect('/dashboard')
          }
        }}>
          <Button className={`w-full h-12 text-sm group ${publicStudioClasses.primaryAction}`}>
            Accept & Join Workspace <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
          By joining, you agree to our Terms of Service.
        </p>
      </div>
    </PublicStudioShell>
  )
}
