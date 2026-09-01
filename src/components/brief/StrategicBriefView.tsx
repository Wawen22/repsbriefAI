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
  Lock,
  Youtube,
  Rss,
  BarChart2,
  Music,
  Image as ImageIcon,
  ChevronDown
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Teleprompter } from "@/components/dashboard/Teleprompter"
import { cn } from "@/lib/utils"
import { createShareAction } from "@/app/actions/share"
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
import { GenerateVisualButton } from '@/components/brief/GenerateVisualButton'

// Small inline badge shown on locked buttons
function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">
      PRO
    </span>
  )
}

// ─── Trend Intelligence Panel ──────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }> = {
  reddit:          { icon: Zap,      label: 'Reddit',        color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  youtube:         { icon: Youtube,  label: 'YouTube',       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  'google-trends': { icon: BarChart2,label: 'Google Trends', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  rss:             { icon: Rss,      label: 'RSS Feed',      color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
}

function TrendIntelligencePanel({ idea }: { idea: IdeaObject }) {
  const [expanded, setExpanded] = useState(false)

  const hasSources     = !!idea.sources?.length
  const hasAudio       = !!idea.trendingAudioSuggestion
  const hasVisuals     = !!idea.keyVisuals
  const hasAltHooks    = !!idea.alternativeHooks?.length

  return (
    <section className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden">
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Trend Intelligence</span>
          {hasSources && (
            <div className="flex items-center gap-1">
              {idea.sources!.map(s => {
                const cfg = SOURCE_CONFIG[s]
                if (!cfg) return null
                const Icon = cfg.icon
                return (
                  <span key={s} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-2.5 h-2.5" />{cfg.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-600 transition-transform duration-300", expanded && "rotate-180")} />
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">

          {/* Alternative Hooks */}
          {hasAltHooks && (
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alternative Hooks</span>
              {idea.alternativeHooks!.map((h, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-[9px] font-black text-blue-500/60 mt-0.5 shrink-0">0{i + 1}</span>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed">&ldquo;{h}&rdquo;</p>
                </div>
              ))}
            </div>
          )}

          {/* Audio Suggestion */}
          {hasAudio && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Music className="w-3 h-3 text-purple-400" /> Trending Audio
              </span>
              <p className="text-[11px] text-slate-300 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                {idea.trendingAudioSuggestion}
              </p>
            </div>
          )}

          {/* Key Visuals */}
          {hasVisuals && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-emerald-400" /> Key Visuals
              </span>
              <p className="text-[11px] text-slate-300 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                {idea.keyVisuals}
              </p>
            </div>
          )}

        </div>
      )}
    </section>
  )
}

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
      const res = await createShareAction(currentIdea, currentIdea.niche || 'fitness')
      if ('id' in res) {
        const url = `${window.location.origin}/s/${res.id}`
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
    <div className="w-full h-screen bg-[#000000] flex flex-col overflow-hidden text-white text-left font-sans antialiased selection:bg-white/20 selection:text-white">

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

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Approval Bar — team plan only */}
      {isTeamPlan && !isApproved && (
        <div className={cn(
          "h-10 flex items-center justify-center px-6 text-[10.5px] font-mono uppercase tracking-wider gap-3 relative z-[110] transition-colors duration-300",
          approvalStatus === 'pending' && "bg-amber-500/10 text-amber-300 border-b border-amber-500/20",
          approvalStatus === 'rejected' && "bg-rose-500/10 text-rose-300 border-b border-rose-500/20",
          approvalStatus === 'draft' && "bg-blue-500/5 text-blue-300/80 border-b border-white/[0.06]"
        )}>
          {approvalStatus === 'pending' && <><Clock className="w-3.5 h-3.5 animate-pulse" /> Pending Approval</>}
          {approvalStatus === 'rejected' && <><AlertCircle className="w-3.5 h-3.5" /> Changes Requested: {feedbackNotes}</>}
          {approvalStatus === 'draft' && <><Zap className="w-3.5 h-3.5" /> Ready to finalize this strategy?</>}
          <div className="h-3.5 w-px bg-white/10" />
          {isOwnerOrAdmin ? (
            <div className="flex items-center gap-3">
              <button onClick={handleApprove} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approve Now
              </button>
              <button onClick={handleReject} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" /> Request Edits
              </button>
            </div>
          ) : (
            approvalStatus !== 'pending' && (
              <button onClick={handleSubmitApproval} className="text-white hover:underline flex items-center gap-1 cursor-pointer">
                <ArrowRight className="w-3.5 h-3.5" /> Submit to Workspace Admin
              </button>
            )
          )}
        </div>
      )}

      {/* Header Bar */}
      <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6 bg-[#090909]/95 backdrop-blur-xl relative z-[100] text-left">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/[0.10] text-white/70 hover:text-white hover:bg-white/[0.08] text-xs font-mono gap-1.5 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 rounded text-[9.5px] font-mono font-semibold tracking-wider uppercase">
              {currentIdea.format} STUDIO
            </Badge>
            {isApproved && isTeamPlan && (
              <div className="flex items-center gap-1 text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider">Approved</span>
              </div>
            )}
            {isStarter && (
              <div className="flex items-center gap-1 text-white/40 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                <span className="text-[8.5px] font-mono uppercase tracking-wider">Free Preview</span>
              </div>
            )}
            <h2 className="text-sm font-semibold text-white tracking-tight truncate max-w-md">{currentIdea.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">Studio Engine OK</span>
          </div>
          <Link href="/dashboard">
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-400 text-white/40 border border-white/[0.08] transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Two-Column Content Area */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left Column (Main Stage) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 space-y-12 pb-32">

          {/* Phase 01: Hook */}
          <section className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-white/40">Phase 01: Attention Architecture</span>
            </div>
            <div className="relative group">
              <div className="relative p-6 md:p-8 rounded-xl bg-[#070707] border border-white/[0.08] hover:border-white/[0.16] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    The Contrarian Hook
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 rounded text-[10.5px] font-mono text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] gap-1.5 cursor-pointer"
                    onClick={() => copyToClipboard(currentIdea.hook)}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </Button>
                </div>
                <p className="text-xl md:text-2xl italic text-white leading-snug font-sans font-medium selection:bg-blue-500/40">
                  &ldquo;{currentIdea.hook}&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* AI Visual Generation */}
          <GenerateVisualButton
            ideaHistoryId={ideaId}
            isStarter={isStarter}
          />

          {/* Phase 02: Script — gated for starter */}
          <section className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-white/40">Phase 02: Execution Logic</span>
              </div>
              {/* Live Recording Mode */}
              {(currentIdea.scriptDraft || currentIdea.description) && (
                isStarter ? (
                  <Button
                    onClick={() => handleLockedClick('Live Recording Mode')}
                    className="h-7 px-3 rounded-md bg-white/[0.04] border border-white/[0.10] text-white/50 font-mono text-[10.5px] uppercase tracking-wider gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Live Teleprompter</span>
                    <ProBadge />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsPrompterOpen(true)}
                    className="h-7 px-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10.5px] uppercase tracking-wider gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Live Teleprompter</span>
                  </Button>
                )
              )}
            </div>

            {/* Script Editor Box */}
            <div className="relative rounded-xl bg-[#070707] border border-white/[0.08] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              {/* Top window header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0c0c0c]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">production-script.txt</span>
                </div>
                {!isStarter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] font-mono text-white/50 hover:text-white bg-white/[0.04] rounded border border-white/[0.08] gap-1 cursor-pointer"
                    onClick={() => copyToClipboard(scriptFull)}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </Button>
                )}
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm md:text-base text-white/80 leading-relaxed font-mono whitespace-pre-wrap selection:bg-purple-500/30">
                  {isStarter ? scriptPreviewLines : scriptFull}
                </p>
              </div>

              {/* Starter blur overlay */}
              {isStarter && (
                <div className="absolute inset-x-0 bottom-0 h-40 flex flex-col items-center justify-end pb-6 gap-3 bg-gradient-to-t from-[#070707] via-[#070707]/90 to-transparent">
                  <div className="flex flex-col items-center gap-2 text-center px-6">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-white font-medium text-xs font-mono">Full production script & telemetry locked</p>
                    <Button
                      onClick={() => handleLockedClick('Full Script')}
                      className="h-7 px-4 rounded-md bg-white text-black hover:bg-white/90 text-[10.5px] font-mono font-bold uppercase tracking-wider gap-1.5 shadow-md cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      Upgrade to Pro — $19/mo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="w-[360px] border-l border-white/[0.08] bg-[#070707]/95 backdrop-blur-xl flex flex-col relative z-20">
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

            {/* AI Strategy Remix */}
            {isStarter ? (
              <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-[10.5px] font-mono font-semibold text-white uppercase tracking-wider">AI Strategy Remix</h4>
                  </div>
                  <ProBadge />
                </div>

                <div className="space-y-1.5">
                  {[
                    'Rewrite the hook for contrarian tone',
                    'Translate & localize script to Italian',
                    'Inject aggressive call-to-action',
                  ].map((example, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-[10px] font-mono text-white/50 italic truncate">&ldquo;{example}&rdquo;</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleLockedClick('AI Strategy Remix')}
                  className="w-full h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider gap-1.5 shadow-md cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  Unlock AI Remix — Pro
                </Button>
              </section>
            ) : (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-[10.5px] font-mono font-semibold text-white uppercase tracking-wider">AI Strategy Remix</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-white/50 font-sans">
                    Refine tone, adjust pacing, or adapt for a secondary channel.
                  </p>
                  <div className="relative group">
                    <Textarea
                      placeholder="e.g. 'Make it punchier', 'Translate to Italian', 'Add a lead magnet CTA'..."
                      value={remixInstruction}
                      onChange={(e) => setRemixInstruction(e.target.value)}
                      className="min-h-[100px] bg-[#0c0c0c] border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:border-white/20 transition-all resize-none font-mono"
                      disabled={isApproved && !isOwnerOrAdmin}
                    />
                    <div className="absolute bottom-2.5 right-2.5">
                      <Button
                        size="sm"
                        disabled={!remixInstruction || isRemixing || (isApproved && !isOwnerOrAdmin)}
                        onClick={handleRemix}
                        className="h-7 rounded-md bg-white text-black hover:bg-white/90 font-mono text-[10px] font-bold uppercase tracking-wider gap-1 px-2.5 transition-all cursor-pointer"
                      >
                        {isRemixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Remix
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Why it Works */}
            <section className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">Growth Logic</span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-sans italic relative z-10">
                {currentIdea.whyItWorks}
              </p>
            </section>

            {/* Trend Intelligence */}
            {(currentIdea.sources?.length || currentIdea.trendingAudioSuggestion || currentIdea.keyVisuals || currentIdea.alternativeHooks?.length) && (
              <TrendIntelligencePanel idea={currentIdea} />
            )}

            {/* Production Metadata */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-white/[0.06] border border-white/[0.10] text-white/60">
                  <History className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[10.5px] font-mono font-semibold text-white uppercase tracking-wider">Telemetry</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Niche</span>
                  <span className="text-[11px] font-mono text-white font-medium truncate">{currentIdea.niche || 'General'}</span>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Target Format</span>
                  <span className="text-[11px] font-mono text-blue-400 font-medium truncate">{currentIdea.format}</span>
                </div>
              </div>

              {/* Schedule CTA */}
              <Button
                onClick={handleGoogleCalendarAction}
                disabled={!isApproved && !isOwnerOrAdmin}
                className="w-full h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white text-xs font-mono font-medium gap-2 justify-center cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                <span>{isGoogleConnected ? 'Sync to Google Calendar' : 'Schedule Production'}</span>
              </Button>
            </section>

          </div>
        </div>
      </div>

      {/* Floating Distribution Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-1.5 p-1 rounded-full bg-[#0c0c0c]/90 border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
        {/* Notion */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-mono uppercase tracking-wider gap-1.5 transition-all cursor-pointer",
            isStarter
              ? "text-white/40 hover:text-white/60"
              : isNotionConnected ? "text-white bg-blue-500/20 hover:bg-blue-500/30" : "text-white/70 hover:text-white hover:bg-white/[0.08]"
          )}
          onClick={handleNotionAction}
          disabled={isExportingToNotion}
        >
          {isExportingToNotion ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isStarter ? (
            <Lock className="w-3 h-3" />
          ) : (
            <FileText className="w-3 h-3 text-blue-400" />
          )}
          <span>{isNotionConnected && !isStarter ? 'Sent to Notion' : 'Notion'}</span>
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Calendar */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-mono uppercase tracking-wider gap-1.5 transition-all cursor-pointer",
            isGoogleConnected ? "text-white bg-blue-500/20 hover:bg-blue-500/30" : "text-white/70 hover:text-white hover:bg-white/[0.08]"
          )}
          onClick={handleGoogleCalendarAction}
        >
          <CalendarDays className="w-3 h-3 text-blue-400" />
          <span>{isGoogleConnected ? 'In GCal' : 'Calendar'}</span>
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* PDF */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-mono uppercase tracking-wider gap-1.5 transition-all cursor-pointer",
            isStarter ? "text-white/40 hover:text-white/60" : "text-white/70 hover:text-white hover:bg-white/[0.08]"
          )}
          onClick={exportToPDF}
        >
          {isStarter ? <Lock className="w-3 h-3" /> : <FileDown className="w-3 h-3 text-purple-400" />}
          <span>PDF</span>
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Markdown */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-mono uppercase tracking-wider gap-1.5 transition-all cursor-pointer",
            isStarter ? "text-white/40 hover:text-white/60" : "text-white/70 hover:text-white hover:bg-white/[0.08]"
          )}
          onClick={exportAsMarkdown}
        >
          {isStarter ? <Lock className="w-3 h-3" /> : <FileCode className="w-3 h-3 text-emerald-400" />}
          <span>Brief.md</span>
          {isStarter && <ProBadge />}
        </Button>

        <div className="w-px h-3 bg-white/10" />

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-3 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 hover:text-white hover:bg-blue-600/20 bg-blue-500/10 gap-1.5 transition-all cursor-pointer"
          onClick={handleSaveStrategy}
          disabled={isSharing}
        >
          <Share2 className="w-3 h-3 text-blue-400" />
          <span>Share</span>
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
