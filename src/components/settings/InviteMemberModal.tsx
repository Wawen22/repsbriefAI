'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus, Mail, Loader2, Send } from 'lucide-react'
import { createTeamInvitationAction } from '@/app/actions/team'
import { toast } from 'sonner'

export function InviteMemberModal() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSending(true)
    const tid = toast.loading(`Sending invitation to ${email}...`)
    
    try {
      const res = await createTeamInvitationAction(email, role)
      if (res.success) {
        toast.success("Invitation sent!", { id: tid })
        setIsOpen(false)
        setEmail('')
      } else {
        toast.error(res.error || "Failed to send invitation", { id: tid })
      }
    } catch {
      toast.error("Something went wrong", { id: tid })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold h-12 gap-2 transition-all">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 rounded-[2.5rem] p-0 overflow-hidden text-white">
        {/* Hidden titles for Accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Send an invitation email to a new team member.</DialogDescription>
        </DialogHeader>

        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
        
        <form onSubmit={handleInvite} className="p-8 space-y-8 relative z-10 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Team Growth</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Invite Collaborator</h2>
            <p className="text-slate-400 text-sm font-light text-left">
              Add a team member to share strategies, scripts, and performance data.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer text-white"
              >
                <option value="member" className="bg-[#0a0a0a]">Member (Can create/edit)</option>
                <option value="admin" className="bg-[#0a0a0a]">Admin (Full workspace access)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-full h-12 text-slate-500 hover:text-white font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || !email}
              className="flex-[2] bg-white text-black hover:bg-slate-200 rounded-full h-12 font-black gap-2 transition-all shadow-xl"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
