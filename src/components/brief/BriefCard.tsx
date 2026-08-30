'use client'

import { type ComponentType, type SVGProps, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Zap,
  Sparkles,
  Trash2,
  CalendarDays,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  Clock,
  AlertCircle,
  Youtube,
  TrendingUp,
  Rss,
  Share2
} from "lucide-react"

// ... (existing imports)

// Simple helper for Source Icons
const SourceBadge = ({ source }: { source: string }) => {
  const configs: Record<string, { icon: ComponentType<SVGProps<SVGSVGElement>>; color: string; label: string; bg: string }> = {
    'reddit': { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Reddit' },
    'youtube': { icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', label: 'YouTube' },
    'google-trends': { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Trends' },
    'rss': { icon: Rss, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'RSS' },
  }

  const config = configs[source.toLowerCase()] || { icon: Sparkles, color: 'text-slate-400', bg: 'bg-white/5', label: source }
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/5", config.bg)}>
      <Icon className={cn("w-3 h-3", config.color)} />
      <span className="text-[8px] font-black uppercase tracking-widest text-white/70">{config.label}</span>
    </div>
  )
}

// ... (rest of component)
import { IdeaObject } from '@/types/niche'
import { toast } from 'sonner'
import { deleteIdeaAction } from '@/app/actions/ideas'
import { createShareAction } from '@/app/actions/share'
import { SaveIdeaButton } from '@/components/ui/SaveIdeaButton'
import { PerformanceModal } from '@/components/dashboard/PerformanceModal'
import { ScheduleDialog } from '@/components/calendar/ScheduleDialog'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { trackProductEvent } from '@/lib/analytics/events'

interface BriefCardProps {
  idea: IdeaObject
  isHistory?: boolean
  isSaved?: boolean
  dbId?: string
  plan?: string
  variant?: 'default' | 'compact'
}

type IdeaWithMeta = IdeaObject & {
  id?: string
  dbId?: string
  approval_status?: 'draft' | 'pending' | 'approved' | 'rejected'
}

// Map formats to specific colors for better UI/UX
const FORMAT_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  'Reel': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  'Carousel': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Thread': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Newsletter': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Idea': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Strategy': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
}

export function BriefCard({ 
  idea, 
  isHistory = false, 
  isSaved = false, 
  dbId, 
  variant = 'default' 
}: BriefCardProps) {
  const ideaWithMeta = idea as IdeaWithMeta
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false)

  const ideaId = dbId || ideaWithMeta.id || ideaWithMeta.dbId
  const format = idea.format || 'Idea'
  const colors = FORMAT_COLORS[format] || FORMAT_COLORS['Strategy']
  const approvalStatus = ideaWithMeta.approval_status || 'draft'
  const [sharing, setSharing] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSharing(true)
    try {
      const result = await createShareAction(idea, idea.niche || 'general')
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      const url = `${window.location.origin}/s/${result.id}`
      await navigator.clipboard.writeText(url)
      trackProductEvent('strategy_shared', { location: 'shared_strategy' })
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setSharing(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!ideaId) return
    if (!confirm("Are you sure you want to delete this idea?")) return
    setIsDeleting(true)
    const res = await deleteIdeaAction(ideaId)
    if (res.success) {
      toast.success("Idea deleted")
    } else {
      toast.error("Failed to delete")
      setIsDeleting(false)
    }
  }

  const handleNavigateToStrategy = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (ideaId) {
      router.push(`/dashboard/strategy/${ideaId}`)
    } else {
      toast.info("Save to your board first", {
        description: (
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-slate-950 font-bold leading-tight">Clicking this will open the full Studio.</span>
            <span className="text-slate-500 text-[11px] leading-tight">Ideas in the weekly brief must be saved to become editable strategies.</span>
          </div>
        )
      })
    }
  }

  const approvalIndicator = approvalStatus === 'approved'
    ? <ShieldCheck className="w-3 h-3 text-emerald-400" />
    : approvalStatus === 'pending'
      ? <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
      : approvalStatus === 'rejected'
        ? <AlertCircle className="w-3 h-3 text-rose-400" />
        : null

  // --- COMPACT VARIANT (For Kanban/Saved Ideas) ---
  if (variant === 'compact') {
    return (
      <Card 
        className="group bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 rounded-2xl overflow-hidden text-left cursor-pointer border-solid"
        onClick={handleNavigateToStrategy}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0 border-none", colors.bg, colors.text)}>
                {format}
              </Badge>
              {idea.sources?.map(s => <SourceBadge key={s} source={s} />)}
              {approvalIndicator}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               {ideaId && (
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-6 w-6 rounded-md text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                   onClick={(e) => {
                     e.stopPropagation()
                     setIsPerformanceOpen(true)
                   }}
                   title="Growth feedback"
                 >
                   <TrendingUp className="w-3 h-3" />
                 </Button>
               )}
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md text-slate-600 hover:text-rose-500 hover:bg-rose-500/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
            </div>
          </div>
          
          <h4 
            className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors cursor-pointer"
            onClick={handleNavigateToStrategy}
          >
            {idea.title}
          </h4>

          <div className="pt-1 flex items-center justify-between">
             <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", colors.text, "bg-current opacity-50")} />
                Studio Ready
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsScheduleOpen(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-500 transition-all transform group-hover:translate-x-0.5" />
             </div>
          </div>
        </CardContent>
        
        <ScheduleDialog 
          isOpen={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
          initialData={{
            ideaId: ideaId,
            title: idea.title,
            hook: idea.hook,
            script: idea.scriptDraft
          }}
        />
      </Card>
    )
  }

  // --- DEFAULT VARIANT (For History / This Week) ---
  return (
    <>
      <ScheduleDialog 
        isOpen={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        initialData={{
          ideaId: ideaId,
          title: idea.title,
          hook: idea.hook,
          script: idea.scriptDraft
        }}
      />
      {ideaId && (
        <PerformanceModal
          ideaId={ideaId}
          title={idea.title}
          isOpen={isPerformanceOpen}
          onClose={() => setIsPerformanceOpen(false)}
        />
      )}
      
      <Card className="group bg-white/[0.03] border-white/5 hover:border-white/10 transition-all duration-500 rounded-[2.5rem] overflow-hidden text-left flex flex-col h-full relative">
        <CardContent className="p-0 text-left flex-1 flex flex-col">
          <div className="p-8 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1", colors.bg, colors.text, colors.border)}>
                  {format} Strategy
                </Badge>
                {approvalStatus === 'approved' && (
                  <div className="flex items-center gap-1 text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Approved</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                 {/* Save/unsave toggle — always visible */}
                 <SaveIdeaButton
                   title={idea.title}
                   ideaData={idea}
                   niche={idea.niche}
                   initialSaved={isSaved}
                   dbId={ideaId}
                 />
                 {/* Performance insights — only when idea is persisted */}
                 {ideaId && (
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 rounded-full text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                     onClick={(e) => {
                       e.stopPropagation()
                       setIsPerformanceOpen(true)
                     }}
                     title="Growth feedback"
                   >
                     <TrendingUp className="w-4 h-4" />
                   </Button>
                 )}
                 {/* Delete — only for saved/history ideas */}
                 {(isHistory || ideaId) && (
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 rounded-full text-slate-600 hover:text-rose-500 hover:bg-rose-500/10"
                     onClick={handleDelete}
                     disabled={isDeleting}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 )}
              </div>
            </div>
            {/* Title: Now clickable to navigate to Studio */}
            <h3 
              className="text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-300 cursor-pointer"
              onClick={handleNavigateToStrategy}
            >
              {idea.title}
            </h3>
          </div>

          <div 
            className="px-8 pb-6 space-y-4 cursor-pointer flex-1 group/preview"
            onClick={() => handleNavigateToStrategy()}
          >
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">The Hook</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium italic">&ldquo;{idea.hook}&rdquo;</p>
            </div>
            
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategy Preview</span>
              <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-3 text-left">
                {idea.description}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-blue-400 opacity-0 group-hover/preview:opacity-100 transition-all transform translate-y-2 group-hover/preview:translate-y-0 text-left">
               <span className="text-[10px] font-black uppercase tracking-widest">Open Full Studio</span>
               <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div className="px-8 pb-4 flex flex-wrap items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest text-left">
             <div className="flex items-center gap-1.5 text-left">
                <div className={cn("w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]", colors.text, "bg-current")} />
                <span>AI Verified</span>
             </div>
             {idea.scriptDraft && (
               <div className="flex items-center gap-1.5 text-left">
                  <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                  <span>Script Ready</span>
               </div>
             )}
             {idea.sources && idea.sources.length > 0 && (
               <div className="flex items-center gap-2 border-l border-white/5 pl-4 ml-auto sm:ml-0">
                  {idea.sources.map(s => <SourceBadge key={s} source={s} />)}
               </div>
             )}
          </div>

          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-1.5 text-left">
              <Button
                variant="ghost"
                className="h-10 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest gap-2"
                onClick={(e) => { e.stopPropagation(); handleNavigateToStrategy(e); }}
              >
                <Maximize2 className="w-4 h-4" />
                Open Studio
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[11px] font-black uppercase tracking-widest gap-2"
                onClick={(e) => { e.stopPropagation(); setIsScheduleOpen(true); }}
              >
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Schedule
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-4 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-black uppercase tracking-widest gap-2"
                onClick={handleShare}
                disabled={sharing}
              >
                <Share2 className="w-4 h-4" />
                {sharing ? 'Copying...' : 'Share'}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </>
  )
}
