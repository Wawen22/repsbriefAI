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

export function KanbanBoard({ initialIdeas }: { initialIdeas: KanbanIdea[] }) {
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
    } catch (err) {
      setIdeas(previousIdeas)
      toast.error('Failed to move idea')
    }
  }

  if (!isMounted) return <div className="h-[70vh] w-full bg-white/[0.01] animate-pulse rounded-3xl" />

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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

              {/* Column Content (Droppable) */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 rounded-3xl border border-dashed p-3 space-y-4 transition-all duration-300 min-h-[150px]",
                      snapshot.isDraggingOver ? "bg-white/[0.05] border-blue-500/30 border-solid" : "bg-transparent border-white/5",
                      colIdeas.length > 0 && !snapshot.isDraggingOver && "bg-white/[0.01]"
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
                              "relative group transition-transform duration-200",
                              snapshot.isDragging && "z-50 scale-105 rotate-2"
                            )}
                          >
                            <BriefCard 
                              idea={idea.idea_data || { title: idea.idea_title, format: 'Idea', hook: 'Custom idea', description: '', whyItWorks: '' }} 
                              hideSaveButton 
                              dbId={idea.id} 
                              variant="compact"
                            />
                            
                            {/* Drag Indicator */}
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                               <GripVertical className="w-3 h-3 text-slate-600" />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colIdeas.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/[0.02] rounded-3xl">
                         <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Drop here</p>
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
