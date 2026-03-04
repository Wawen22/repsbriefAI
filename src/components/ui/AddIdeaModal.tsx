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
import { Plus, Zap, Sparkles, X, ArrowRight, Lightbulb } from 'lucide-react'
import { saveIdeaAction } from '@/app/actions/ideas'
import { Badge } from '@/components/ui/badge'

export function AddIdeaModal() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    const result = await saveIdeaAction(title)
    setIsSubmitting(false)

    if (result.success) {
      setTitle('')
      setOpen(false)
    } else {
      alert(result.error || 'Failed to save')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          Add My Idea
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[480px] bg-black border-white/10 text-slate-50 shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] p-0 overflow-hidden rounded-3xl">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="p-8 space-y-8 relative z-10">
          <DialogHeader className="text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Lightbulb className="w-5 h-5 text-blue-400" />
              </div>
              <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                New Inspiration
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-white leading-tight">
              Capture your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Spark</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base font-light">
              Don&apos;t let a great idea fade away. Save it here to build your personal content vault.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label htmlFor="title" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
                Content concept
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <textarea
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A carousel about the 3 myths of intermittent fasting..."
                  className="relative flex min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all duration-300 resize-none font-light"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto h-12 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-all font-medium"
              >
                Dismiss
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title.trim()} 
                className="w-full sm:w-auto h-12 bg-white text-black hover:bg-slate-200 rounded-full font-bold px-8 shadow-xl transition-all hover:scale-105 active:scale-95 group disabled:opacity-50"
              >
                {isSubmitting ? (
                   <span className="flex items-center gap-2">
                     Saving...
                   </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Save Idea
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
