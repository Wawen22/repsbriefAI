'use client'

import { useState, useEffect } from 'react'
import { IdeaObject } from '@/types/niche'
import { BriefCard } from '@/components/brief/BriefCard'
import { 
  Inbox, 
  PenTool, 
  Video, 
  CheckCircle2, 
  MoreHorizontal,
  GripVertical
} from 'lucide-react'
import { updateIdeaStatusAction } from '@/app/actions/ideas'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { PerformanceModal } from './PerformanceModal'

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

export function KanbanBoard({ initialIdeas, plan }: { initialIdeas: KanbanIdea[], plan?: string }) {
  const [ideas, setIdeas] = useState(initialIdeas)
  const [isMounted, setIsMounted] = useState(false)
  const [performanceIdea, setPerformanceIdea] = useState<{ id: string, title: string } | null>(null)

  // Prevent hydration issues with DND
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    const previousIdeas = [...ideas]
    
    // Optimistic UI update
    setIdeas(ideas.map(i => i.id === draggableId ? { ...i, status: newStatus } : i))

    // Trigger performance modal if moved to published
    if (newStatus === 'published') {
      const idea = ideas.find(i => i.id === draggableId)
      if (idea) {
        setPerformanceIdea({ id: idea.id, title: idea.idea_title })
      }
    }

    try {
      const res = await updateIdeaStatusAction(draggableId, newStatus)
      if (res.error) throw new Error(res.error)
      toast.success(`Moved to ${newStatus}`)
    } catch {
      setIdeas(previousIdeas)
      toast.error('Failed to move idea')
    }
  }

  if (!isMounted) return <div className="h-[70vh] w-full bg-white/[0.01] animate-pulse rounded-3xl" />

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[70vh] overflow-x-auto pb-10 custom-scrollbar text-left">
        {COLUMNS.map((col) => {
          const Icon = col.icon
          const colIdeas = ideas.filter(i => i.status === col.id)

          return (
            <div key={col.id} className="flex-1 min-w-[320px] flex flex-col gap-4 text-left">
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#0c0c0c] border border-white/[0.08] rounded-xl text-left">
                <div className="flex items-center gap-2.5 text-left">
                  <div className={cn("p-1.5 rounded-lg border border-white/[0.08]", col.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", col.color)} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-white tracking-wider uppercase">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 bg-white/[0.06] px-1.5 py-0.2 rounded">
                    {colIdeas.length}
                  </span>
                </div>
                <button className="text-white/30 hover:text-white transition-colors cursor-pointer">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Content (Droppable) */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 rounded-xl border p-2.5 space-y-2.5 transition-all duration-200 min-h-[160px] text-left",
                      snapshot.isDraggingOver ? "bg-white/[0.04] border-blue-500/30" : "bg-[#070707]/60 border-white/[0.06]"
                    )}
                  >
                    {colIdeas.map((idea, index) => (
                      <Draggable key={idea.id} draggableId={idea.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "relative group transition-transform duration-200 text-left",
                              snapshot.isDragging && "z-50 scale-105 rotate-1"
                            )}
                          >
                            <BriefCard 
                              idea={idea.idea_data || { title: idea.idea_title, format: 'Idea', hook: 'Custom idea', description: '', whyItWorks: '' }} 
                              dbId={idea.id} 
                              variant="compact"
                              plan={plan}
                            />
                            
                            {/* Drag Indicator */}
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-left">
                               <GripVertical className="w-3 h-3 text-white/30" />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colIdeas.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-28 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/[0.06] rounded-xl text-left">
                         <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Empty stage</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>

      {performanceIdea && (
        <PerformanceModal 
          ideaId={performanceIdea.id} 
          title={performanceIdea.title} 
          isOpen={!!performanceIdea} 
          onClose={() => setPerformanceIdea(null)} 
        />
      )}
    </DragDropContext>
  )
}
