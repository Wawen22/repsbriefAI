'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Instagram, 
  Video, 
  Linkedin, 
  Youtube, 
  Calendar as CalendarIcon, 
  Clock,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react'
import { scheduleIdeaAction } from '@/app/actions/calendar'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'youtube'

interface ScheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    ideaId?: string
    title: string
    hook?: string
    script?: string
    date?: Date
  }
}

export function ScheduleDialog({ isOpen, onOpenChange, initialData }: ScheduleDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [date, setDate] = useState(initialData?.date ? format(initialData.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const platforms = [
    { id: 'instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'tiktok', icon: Video, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'linkedin', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'youtube', icon: Youtube, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const res = await scheduleIdeaAction({
      ideaId: initialData?.ideaId,
      scheduledDate: new Date(date).toISOString(),
      platform,
      title,
      hook: initialData?.hook,
      script: initialData?.script,
      notes
    })

    if (res.success) {
      toast.success("Content scheduled successfully!")
      onOpenChange(false)
      if (typeof window !== 'undefined') window.location.reload()
    } else {
      toast.error(res.error || "Failed to schedule")
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10 rounded-[2.5rem] p-0 overflow-hidden text-white shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Schedule Content</DialogTitle>
          <DialogDescription>Add this strategy to your editorial calendar.</DialogDescription>
        </DialogHeader>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 text-left relative z-10">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Planning Mode</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Schedule Strategy</h2>
            <p className="text-slate-400 text-sm font-light text-left">Set a date and platform for this content piece.</p>
          </div>

          <div className="space-y-6 text-left">
            {/* Title Input */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/[0.03] border-white/10 rounded-xl h-12 focus:ring-blue-500/20 text-white"
                placeholder="Enter a title..."
                required
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Platform</label>
              <div className="grid grid-cols-4 gap-3">
                {platforms.map((p) => {
                  const Icon = p.icon
                  const isActive = platform === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id as Platform)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all group",
                        isActive 
                          ? "bg-white/[0.05] border-white/20 ring-2 ring-blue-500/20" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        isActive ? p.bg : "bg-white/5"
                      )}>
                        <Icon className={cn("w-4 h-4", isActive ? p.color : "text-slate-500")} />
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isActive ? "text-white" : "text-slate-500"
                      )}>
                        {p.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scheduled Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/[0.03] border-white/10 rounded-xl h-12 pl-12 focus:ring-blue-500/20 text-white"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Production Notes (Optional)</label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white/[0.03] border-white/10 rounded-xl min-h-[80px] focus:ring-blue-500/20 text-white"
                placeholder="Add tags, filming locations, or specific instructions..."
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full h-12 text-slate-500 hover:text-white font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title}
              className="flex-[2] bg-white text-black hover:bg-slate-200 rounded-full h-12 font-black gap-2 transition-all shadow-xl shadow-white/5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save to Calendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
