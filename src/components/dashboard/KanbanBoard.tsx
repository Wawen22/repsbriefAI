'use client'

import { useState } from 'react'
import { IdeaObject } from '@/types/niche'
import { BriefCard } from '@/components/brief/BriefCard'
import { 
  ChevronRight, 
  ChevronLeft, 
  Inbox, 
  PenTool, 
  Video, 
  CheckCircle2, 
  MoreHorizontal,
  ArrowRight,
  GripVertical
} from 'lucide-react'
import { updateIdeaStatusAction } from '@/app/actions/ideas'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface KanbanIdea {
  id: string
  idea_title: string
  idea_data: IdeaObject
  status: string
  niche: string
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', icon: Inbox, color: 'text-slate-400', bg: 'bg-slate-500/5' },
  { id: 'scripting', label: 'Scripting', icon: PenTool, color: 'text-blue-400', bg: 'bg-blue-500/5' },
  { id: 'producing', label: 'Producing', icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/5' },
  { id: 'published', label: 'Published', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
]

export function KanbanBoard({ initialIdeas }: { initialIdeas: KanbanIdea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas)

  const moveIdea = async (id: string, newStatus: string) => {
    // Optimistic UI
    const previousIdeas = [...ideas]
    setIdeas(ideas.map(i => i.id === id ? { ...i, status: newStatus } : i))

    try {
      const res = await updateIdeaStatusAction(id, newStatus)
      if (res.error) throw new Error(res.error)
      toast.success(`Moved to ${newStatus}`)
    } catch (err) {
      setIdeas(previousIdeas)
      toast.error('Failed to move idea')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[70vh] overflow-x-auto pb-10 custom-scrollbar">
      {COLUMNS.map((col) => {
        const Icon = col.icon
        const colIdeas = ideas.filter(i => i.status === col.id)

        return (
          <div key={col.id} className="flex-1 min-w-[320px] flex flex-col gap-4">
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={cn("p-1.5 rounded-lg border border-white/5", col.bg)}>
                  <Icon className={cn("w-4 h-4", col.color)} />
                </div>
                <span className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">{col.label}</span>
                <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{colIdeas.length}</span>
              </div>
              <button className="text-slate-600 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Column Content */}
            <div className={cn(
              "flex-1 rounded-3xl border border-dashed border-white/5 p-3 space-y-4 transition-colors",
              colIdeas.length === 0 ? "bg-transparent" : "bg-white/[0.01]"
            )}>
              {colIdeas.map((idea) => (
                <div key={idea.id} className="group relative">
                  <BriefCard 
                    idea={idea.idea_data || { title: idea.idea_title, format: 'Idea', hook: 'Custom idea', description: '', whyItWorks: '' }} 
                    hideSaveButton 
                    dbId={idea.id} 
                  />
                  
                  {/* Status Move Buttons (Professional 2026 Floating UI) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {col.id !== 'backlog' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveIdea(idea.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id) }}
                        className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white transition-all"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {col.id !== 'published' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveIdea(idea.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id) }}
                        className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1 px-2"
                      >
                        <span className="text-[9px] font-black uppercase">Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {colIdeas.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/[0.02] rounded-3xl">
                   <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">No tasks in {col.label}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
