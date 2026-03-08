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
} from '@/components/ui/dialog'
import { Star, TrendingUp, Save, Sparkles } from 'lucide-react'
import { updatePerformanceAction } from '@/app/actions/ideas'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PerformanceModalProps {
  ideaId: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function PerformanceModal({ ideaId, title, isOpen, onClose }: PerformanceModalProps) {
  const [score, setScore] = useState<number>(0)
  const [views, setViews] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await updatePerformanceAction(ideaId, {
        performance_score: score,
        views_count: parseInt(views) || 0,
        performance_notes: notes
      })
      if (res.error) throw new Error(res.error)
      toast.success('Performance data captured!', {
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />
      })
      onClose()
    } catch {
      toast.error('Failed to save performance')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-black border-white/10 text-slate-50 shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
        <DialogHeader className="sr-only">
          <DialogTitle>Track Performance</DialogTitle>
          <DialogDescription>Input how your published content performed.</DialogDescription>
        </DialogHeader>

        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="p-8 space-y-8 relative z-10">
          <div className="text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Growth Feedback</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
              How did &ldquo;{title}&rdquo; perform?
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Your feedback helps the AI strategist double down on what works for your specific audience.
            </p>
          </div>

          <div className="space-y-8">
            {/* Star Rating */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Overall Success</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScore(s)}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                      score >= s 
                        ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                        : "bg-white/5 border-white/10 text-slate-600 hover:border-white/20"
                    )}
                  >
                    <Star className={cn("w-6 h-6", score >= s && "fill-current")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Views Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Estimated Views</label>
              <div className="relative">
                 <input 
                   type="number"
                   value={views}
                   onChange={(e) => setViews(e.target.value)}
                   placeholder="e.g. 12500"
                   className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                 />
                 <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-bold uppercase tracking-widest pointer-events-none">Views</div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Strategist Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you notice? Better hook engagement? High shares?"
                className="w-full h-24 bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none font-light"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-full h-14 text-slate-500 hover:text-white font-bold"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !score}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white rounded-full h-14 font-black shadow-lg shadow-emerald-500/20 gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Insights
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Loader2({ className }: { className?: string }) {
  return <Sparkles className={cn("animate-spin", className)} />
}
