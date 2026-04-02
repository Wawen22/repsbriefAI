'use client'

import { IdeaObject } from "@/types/niche"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles,
  TrendingUp,
  Smartphone,
  Copy,
  CalendarDays,
  Share2,
  X,
  Zap,
  Lightbulb,
  ChevronLeft,
  Wand2,
  Loader2,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  FileDown,
  FileText,
  FileCode,
  Lock
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Teleprompter } from "@/components/dashboard/Teleprompter"
import { cn } from "@/lib/utils"
import { shareIdeaAction } from "@/app/actions/ideas"
import { remixScriptAction } from "@/app/actions/remix"
import { submitForApprovalAction, approveIdeaAction, rejectIdeaAction } from "@/app/actions/approval"
import Link from "next/link"
import { ScheduleDialog } from "@/components/calendar/ScheduleDialog"
import { createClient } from "@/lib/supabase/client"
import jsPDF from "jspdf"

interface StrategicBriefViewProps {
  idea: IdeaObject
  ideaId: string
}

type IdeaWorkflowMeta = IdeaObject & {
  approval_status?: 'draft' | 'pending' | 'approved' | 'rejected'
  feedback_notes?: string
}

import { exportStrategyToNotionAction } from "@/app/actions/notion-export"
import { useUpgradeModal } from "@/components/ui/UpgradeModal"

// Small inline badge shown on locked buttons
function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">
      PRO
    </span>
  )
}

// No-op placeholder — replaced by useUpgradeModal below
function showUpgradeToast(_featureName: string) { /* see handleLockedClick */ }

export function StrategicBriefView({
  idea,
  ideaId
}: StrategicBriefViewProps) {
  const ideaMeta = idea as IdeaWorkflowMeta
  const [isPrompterOpen, setIsPrompterOpen] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [remixInstruction, setRemixInstruction] = useState('')
  const [isRemixing, setIsRemixing] = useState(false)
  const [currentIdea, setCurrentIdea] = useState<IdeaObject>(idea)
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [approvalStatus, setApprovalStatus] = useState<string>(ideaMeta.approval_status || 'draft')
  const [feedbackNotes, setFeedbackNotes] = useState<string>(ideaMeta.feedback_notes || '')
  const [, setIsSubmittingApproval] = useState(false)
  const [isNotionConnected, setIsNotionConnected] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isExportingToNotion, setIsExportingToNotion] = useState(false)

  useEffect(() => {
    async function getContext() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_team_id, plan')
        .eq('id', user.id)
        .single()

      setUserPlan(profile?.plan || 'starter')

      if (profile?.current_team_id) {
        setTeamId(profile.current_team_id)

        const { data: integrations } = await supabase
          .from('team_integrations')
          .select('provider')
          .eq('team_id', profile.current_team_id)
          .eq('status', 'active')

        if (integrations) {
          setIsNotionConnected(integrations.some(i => i.provider === 'notion'))
          setIsGoogleConnected(integrations.some(i => i.provider === 'google_calendar'))
        }

        const { data: member } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', user.id)
          .eq('team_id', profile.current_team_id)
          .single()
        setUserRole((member?.role as 'owner' | 'admin' | 'member' | undefined) || null)
      }
    }
    getContext()
  }, [])

  // Plan helpers
  const isStarter = !userPlan || userPlan === 'starter'
  const openUpgrade = useUpgradeModal((s) => s.open)
  const handleLockedClick = (featureName: string) => openUpgrade(featureName)

  const copyToClipboard = (text: string, msg = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text)
    toast.success(msg)
  }

  const handleNotionAction = async () => {
    if (isStarter) { handleLockedClick('Notion Export'); return }
    const content = `Title: ${currentIdea.title}\n\nHook: ${currentIdea.hook}\n\nStrategy:\n${currentIdea.description}\n\nScript:\n${currentIdea.scriptDraft || 'N/A'}`

    if (isNotionConnected) {
      setIsExportingToNotion(true)
      const tid = toast.loading("Exporting to Notion...")
      try {
        const res = await exportStrategyToNotionAction(content, currentIdea.title)
        if (res.success) {
          toast.success("Sent to Notion successfully!", { id: tid })
          if (res.url) {
            toast.info("Opening Notion...", {
              action: { label: "Open Page", onClick: () => window.open(res.url, "_blank") }
            })
          }
        } else {
          toast.error(res.error || "Failed to export", { id: tid })
        }
      } catch {
        toast.error("Network error", { id: tid })
      } finally {
        setIsExportingToNotion(false)
      }
    } else {
      copyToClipboard(content, "Formatted for Notion (Copied)!")
    }
  }

  const handleGoogleCalendarAction = async () => {
    setIsScheduleOpen(true)
  }

  const exportToPDF = async () => {
    if (isStarter) { handleLockedClick('PDF Export'); return }
    const tid = toast.loading("Generating professional PDF...")
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 30

      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      const titleLines = doc.splitTextToSize(currentIdea.title, pageWidth - (margin * 2))
      doc.text(titleLines, margin, y)
      y += (titleLines.length * 10) + 5

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Format: ${currentIdea.format} | Niche: ${currentIdea.niche || 'General'} | Generated by RepsBrief`, margin, y)
      y += 15
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 15

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246)
      doc.text("The Viral Hook", margin, y)
      y += 10
      doc.setFontSize(16)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(0, 0, 0)
      const hookLines = doc.splitTextToSize(`"${currentIdea.hook}"`, pageWidth - (margin * 2))
      doc.text(hookLines, margin, y)
      y += (hookLines.length * 8) + 15

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(147, 51, 234)
      doc.text("Production Script", margin, y)
      y += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const scriptLines = doc.splitTextToSize(currentIdea.scriptDraft || currentIdea.description, pageWidth - (margin * 2))
      doc.text(scriptLines, margin, y)
      y += (scriptLines.length * 6) + 15

      if (currentIdea.whyItWorks) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(16, 185, 129)
        doc.text("Strategic Logic", margin, y)
        y += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 100, 100)
        const logicLines = doc.splitTextToSize(currentIdea.whyItWorks, pageWidth - (margin * 2))
        doc.text(logicLines, margin, y)
      }

      doc.save(`${currentIdea.title.toLowerCase().replace(/\s+/g, '-')}-strategy.pdf`)
      toast.success("Professional PDF ready!", { id: tid })
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate PDF", { id: tid })
    }
  }

  const exportAsMarkdown = () => {
    if (isStarter) { handleLockedClick('Markdown Export'); return }
    try {
      const markdown = [
        `# ${currentIdea.title}`,
        "",
        `- Format: ${currentIdea.format}`,
        `- Niche: ${currentIdea.niche || "General"}`,
        "",
        "## Hook",
        "",
        currentIdea.hook,
        "",
        "## Strategy",
        "",
        currentIdea.description,
        "",
        "## Script",
        "",
        currentIdea.scriptDraft || currentIdea.description,
        "",
        "## Why It Works",
        "",
        currentIdea.whyItWorks || "N/A",
        "",
      ].join("\n")

      const slug = currentIdea.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${slug || "strategy-brief"}.md`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      toast.success("Markdown exported")
    } catch (error) {
      console.error(error)
      toast.error("Failed to export markdown")
    }
  }

  const handleSaveStrategy = async () => {
    setIsSharing(true)
    const tid = toast.loading("Generating public link...")
    try {
      const res = await shareIdeaAction(currentIdea, currentIdea.niche || 'fitness')
      if (res.success && res.shareId) {
        const url = `${window.location.origin}/share/${res.shareId}`
        navigator.clipboard.writeText(url)
        toast.success("Public link generated & copied!", { id: tid })
      } else {
        toast.error("Failed to share strategy", { id: tid })
      }
    } catch {
      toast.error("Error sharing strategy", { id: tid })
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemix = async () => {
    if (!remixInstruction) return
    setIsRemixing(true)
    const tid = toast.loading("AI is remixing your strategy...")
    try {
      const res = await remixScriptAction(currentIdea, remixInstruction)
      if (res.success && res.data) {
        setCurrentIdea({
          ...currentIdea,
          hook: res.data.newHook,
          scriptDraft: res.data.newScript,
          whyItWorks: res.data.explanation
        })
        setRemixInstruction('')
        toast.success("Remix complete!", { id: tid })
      } else {
        toast.error(res.error || "Failed to remix", { id: tid })
      }
    } catch {
      toast.error("Error connecting to AI", { id: tid })
    } finally {
      setIsRemixing(false)
    }
  }

  const handleSubmitApproval = async () => {
    setIsSubmittingApproval(true)
    const res = await submitForApprovalAction(ideaId)
    if (res.success) {
      setApprovalStatus('pending')
      toast.success("Strategy submitted for approval")
    } else {
      toast.error(res.error)
    }
    setIsSubmittingApproval(false)
  }

  const handleApprove = async () => {
    if (!teamId) return
    setIsSubmittingApproval(true)
    const res = await approveIdeaAction(ideaId, teamId)
    if (res.success) {
      setApprovalStatus('approved')
      toast.success("Strategy approved!")
    } else {
      toast.error(res.error)
    }
    setIsSubmittingApproval(false)
  }

  const handleReject = async () => {
    if (!teamId) return
    const notes = prompt("Enter feedback for the creator:")
    if (notes === null) return
    setIsSubmittingApproval(true)
    const res = await rejectIdeaAction(ideaId, teamId, notes)
    if (res.success) {
      setApprovalStatus('rejected')
      setFeedbackNotes(notes)
      toast.info("Strategy returned for edits")
    } else {
      toast.error(res.error)
    }
    setIsSubmittingApproval(false)
  }

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const isTeamPlan = userPlan === 'team'
  const isApproved = approvalStatus === 'approved' || !isTeamPlan

  // Script: full text for pro, capped preview for starter
  const scriptFull = currentIdea.scriptDraft || currentIdea.description
  const scriptPreviewLines = scriptFull.split('\n').slice(0, 4).join('\n')

  return (
    <div className="w-full h-screen bg-[#050505] flex flex-col overflow-hidden text-slate-50 text-left">

      <ScheduleDialog
        isOpen={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        initialData={{
          ideaId: ideaId,
          title: currentIdea.title,
          hook: currentIdea.hook,
          script: currentIdea.scriptDraft
        }}
      />

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/[0.03] rounded-full blur-[160px] pointer-events-none" />

      {/* Approval Bar — team plan only */}
      {isTeamPlan && !isApproved && (
        <div className={cn(
          "h-12 flex items-center justify-center px-8 text-[10px] font-black uppercase tracking-widest gap-4 relative z-[110] transition-colors duration-500",
          approvalStatus === 'pending' && "bg-amber-500/10 text-amber-400 border-b border-amber-500/20",
          approvalStatus === 'rejected' && "bg-rose-500/10 text-rose-400 border-b border-rose-500/20",
          approvalStatus === 'draft' && "bg-blue-500/5 text-blue-400/60 border-b border-white/5"
        )}>
          {approvalStatus === 'pending' && <><Clock className="w-4 h-4 animate-pulse" /> Pending Approval</>}
          {approvalStatus === 'rejected' && <><AlertCircle className="w-4 h-4" /> Changes Requested: {feedbackNotes}</>}
          {approvalStatus === 'draft' && <><Zap className="w-4 h-4" /> Ready to finalize this strategy?</>}
          <div className="h-4 w-px bg-white/10" />
          {isOwnerOrAdmin ? (
            <div className="flex items-center gap-4">
              <button onClick={handleApprove} className="hover:text-white transition-colors flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Now
              </button>
              <button onClick={handleReject} className="hover:text-white transition-colors flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Request Edits
              </button>
            </div>
          ) : (
            approvalStatus !== 'pending' && (
              <button onClick={handleSubmitApproval} className="text-white hover:underline flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> Submit to Workspace Admin
              </button>
            )
          )}
        </div>
      )}

      {/* Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl relative z-[100] text-left">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="h-10 pl-2 pr-4 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
            </Button>
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase">
              {currentIdea.format} STUDIO
            </Badge>
            {isApproved && isTeamPlan && (
              <div className="flex items-center gap-1 text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Workspace Approved</span>
              </div>
            )}
            {isStarter && (
              <div className="flex items-center gap-1 text-slate-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-[8px] font-black uppercase tracking-widest">Free Preview</span>
              </div>
            )}
            <h2 className="text-lg font-bold text-white tracking-tight">{currentIdea.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Strategic Sync Active</span>
          </div>
          <Link href="/dashboard">
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500 transition-all">
              <X className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Two-Column Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left Column */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-20 space-y-20 pb-40">

          {/* Phase 01: Hook — always fully visible */}
          <section className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Phase 01: Attention Architecture</span>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative p-12 md:p-16 rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <TrendingUp className="w-40 h-40" />
                </div>
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">The Viral Hook</h3>
                <p className="text-3xl md:text-4xl italic text-white leading-tight font-light selection:bg-blue-500/50">
                  &ldquo;{currentIdea.hook}&rdquo;
                </p>
                <div className="mt-10 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="h-10 px-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white gap-2"
                    onClick={() => copyToClipboard(currentIdea.hook)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Hook
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Phase 02: Script — gated for starter */}
          <section className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Phase 02: Execution Logic</span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Full Production Script</h4>
                {/* Live Recording — locked for starter */}
                {(currentIdea.scriptDraft || currentIdea.description) && (
                  isStarter ? (
                    <Button
                      onClick={() => handleLockedClick('Live Recording Mode')}
                      className="h-9 px-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Live Recording Mode
                      <ProBadge />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsPrompterOpen(true)}
                      className="h-9 px-5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Live Recording Mode
                    </Button>
                  )
                )}
              </div>

              {/* Script box */}
              <div className="relative rounded-[2.5rem] bg-black border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-10">
                  {/* Always show the copy button only for pro */}
                  {!isStarter && (
                    <div className="absolute top-6 right-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-600 hover:text-white bg-white/5 rounded-full"
                        onClick={() => copyToClipboard(scriptFull)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed font-mono whitespace-pre-wrap selection:bg-purple-500/30">
                    {isStarter ? scriptPreviewLines : scriptFull}
                  </p>
                </div>

                {/* Starter blur overlay */}
                {isStarter && (
                  <div className="absolute inset-x-0 bottom-0 h-48 flex flex-col items-center justify-end pb-8 gap-4"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.98) 40%, rgba(0,0,0,0.7) 70%, transparent 100%)' }}
                  >
                    <div className="flex flex-col items-center gap-3 text-center px-8">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-white font-black text-sm">Full script locked</p>
                      <Button
                        onClick={() => handleLockedClick('Full Script')}
                        className="h-9 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Upgrade to Pro — $19/mo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="w-[400px] border-l border-white/5 bg-white/[0.01] backdrop-blur-md flex flex-col relative z-20">
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

            {/* AI Strategy Remix */}
            {isStarter ? (
              /* Locked state for starter */
              <section className="rounded-[2rem] border border-blue-500/10 bg-blue-500/[0.03] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500/50">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">AI Strategy Remix</h4>
                  </div>
                  <ProBadge />
                </div>

                <div className="space-y-3">
                  {[
                    'Rewrite the hook for a different tone',
                    'Adapt this script to Italian',
                    'Make it more aggressive & direct',
                    'Add a CTA at the end',
                  ].map((example, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shrink-0" />
                      <span className="text-[11px] text-slate-600 italic">&ldquo;{example}&rdquo;</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleLockedClick('AI Strategy Remix')}
                  className="w-full h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Unlock AI Remix — Pro
                </Button>
              </section>
            ) : (
              /* Full remix panel for pro */
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Strategy Remix</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Adjust the tone, lengthen the hook, or adapt this strategy for a specific trend.
                  </p>
                  <div className="relative group">
                    <Textarea
                      placeholder="e.g. 'Make it more aggressive', 'Translate to Italian', 'Add a call to action at the end'..."
                      value={remixInstruction}
                      onChange={(e) => setRemixInstruction(e.target.value)}
                      className="min-h-[120px] bg-black border-white/10 rounded-2xl p-4 text-sm text-slate-300 focus:border-blue-500/50 transition-all resize-none"
                      disabled={isApproved && !isOwnerOrAdmin}
                    />
                    <div className="absolute bottom-3 right-3">
                      <Button
                        size="sm"
                        disabled={!remixInstruction || isRemixing || (isApproved && !isOwnerOrAdmin)}
                        onClick={handleRemix}
                        className="h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest gap-2 px-3 transition-all active:scale-95"
                      >
                        {isRemixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Apply Remix
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Why it Works — always visible */}
            <section className="p-6 rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Lightbulb className="w-20 h-20 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest">Growth Logic</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-medium italic relative z-10">
                {currentIdea.whyItWorks}
              </p>
            </section>

            {/* Production Data */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                  <History className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Production Data</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Niche</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">{currentIdea.niche || 'General'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Platform Opt.</span>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest truncate">{currentIdea.format}</span>
                </div>
              </div>

              {/* Calendar — available for all */}
              <Button
                onClick={handleGoogleCalendarAction}
                disabled={!isApproved && !isOwnerOrAdmin}
                className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold gap-3 justify-center"
              >
                <CalendarDays className="w-4 h-4 text-blue-400" />
                {isGoogleConnected ? 'Sync to Calendar' : 'Schedule Production'}
              </Button>
            </section>

          </div>
        </div>
      </div>

      {/* Footer Distribution Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 p-1.5 rounded-full bg-black/90 border border-white/15 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
        {/* Notion — locked for starter */}
        <Button
          variant="ghost"
          className={cn(
            "h-[28px] px-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] gap-2 transition-all group",
            isStarter
              ? "text-slate-600 hover:text-slate-400"
              : isNotionConnected ? "text-white bg-blue-500/10 hover:bg-blue-500/20" : "text-slate-300 hover:text-white hover:bg-white/10"
          )}
          onClick={handleNotionAction}
          disabled={isExportingToNotion}
        >
          {isExportingToNotion ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isStarter ? (
            <Lock className="w-3 h-3" />
          ) : (
            <FileText className={cn("w-3 h-3", isNotionConnected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400")} />
          )}
          {isNotionConnected && !isStarter ? 'SEND TO NOTION' : 'NOTION'}
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Calendar — always available */}
        <Button
          variant="ghost"
          className={cn(
            "h-[28px] px-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] gap-2 transition-all group",
            isGoogleConnected ? "text-white bg-blue-500/10 hover:bg-blue-500/20" : "text-slate-300 hover:text-white hover:bg-white/10"
          )}
          onClick={handleGoogleCalendarAction}
        >
          <CalendarDays className={cn("w-3 h-3", isGoogleConnected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400")} />
          {isGoogleConnected ? 'SYNC TO GCAL' : 'CALENDAR'}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* PDF — locked for starter */}
        <Button
          variant="ghost"
          className={cn(
            "h-[28px] px-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] gap-2 transition-all group",
            isStarter ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-white hover:bg-white/10"
          )}
          onClick={exportToPDF}
        >
          {isStarter ? <Lock className="w-3 h-3" /> : <FileDown className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors" />}
          SAVE AS PDF
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Markdown — locked for starter */}
        <Button
          variant="ghost"
          className={cn(
            "h-[28px] px-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] gap-2 transition-all group",
            isStarter ? "text-slate-600 hover:text-slate-400" : "text-slate-300 hover:text-white hover:bg-white/10"
          )}
          onClick={exportAsMarkdown}
        >
          {isStarter ? <Lock className="w-3 h-3" /> : <FileCode className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
          BRIEF.MD
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Share — always available */}
        <Button
          variant="ghost"
          className="h-[28px] px-4 rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-blue-400 hover:text-white hover:bg-blue-600/20 bg-blue-500/5 gap-2 transition-all"
          onClick={handleSaveStrategy}
          disabled={isSharing}
        >
          <Share2 className="w-3 h-3 text-blue-500" />
          SHARE STRATEGY
        </Button>
      </div>

      {isPrompterOpen && (
        <Teleprompter
          script={currentIdea.scriptDraft || currentIdea.description}
          onClose={() => setIsPrompterOpen(false)}
        />
      )}
    </div>
  )
}
