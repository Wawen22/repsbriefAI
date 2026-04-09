'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Loader2, Sparkles } from 'lucide-react'
import { saveIdeaAction, unsaveIdeaAction } from '@/app/actions/ideas'
import { toast } from "sonner"
import { cn } from '@/lib/utils'
import { IdeaObject } from '@/types/niche'

export function SaveIdeaButton({
  title,
  ideaData,
  niche = 'fitness',
  initialSaved = false,
  dbId,
  variant = 'icon',
  className
}: {
  title: string,
  ideaData?: IdeaObject,
  niche?: string,
  initialSaved?: boolean,
  dbId?: string,
  variant?: 'icon' | 'prominent',
  className?: string
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [currentDbId, setCurrentDbId] = useState(dbId)
  const [animate, setAnimate] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaving(true)

    try {
      if (isSaved && currentDbId) {
        // Unsave
        const result = await unsaveIdeaAction(currentDbId)
        if (result?.success) {
          setIsSaved(false)
          toast.info("Removed from My Ideas")
        } else {
          toast.error(result?.error || 'Failed to remove idea')
        }
      } else {
        // Save
        const result = await saveIdeaAction(title, niche, ideaData)
        if (result?.success) {
          setIsSaved(true)
          setCurrentDbId(result.id)
          setAnimate(true)
          toast.success("Saved to My Ideas", {
            icon: <Sparkles className="w-4 h-4 text-amber-400" />,
          })
          setTimeout(() => setAnimate(false), 600)
        } else {
          toast.error(result?.error || 'Failed to save idea')
        }
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (variant === 'prominent') {
    return (
      <Button
        onClick={handleToggle}
        disabled={isSaving}
        className={cn(
          "rounded-full px-6 font-bold transition-all h-14 gap-2 shadow-lg relative overflow-hidden",
          isSaved
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
            : "bg-white text-black hover:bg-slate-200 hover:scale-105 active:scale-95",
          className
        )}
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <div className="relative">
            <Star className={cn(
              "w-3.5 h-3.5 transition-all duration-300",
              isSaved ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]" : "text-black",
              animate && "animate-sparkle"
            )} />
          </div>
        )}
        <span>{isSaved ? "Saved" : "Save Strategy"}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isSaving}
      className={cn(
        "h-8 w-8 transition-all duration-300 relative group/save rounded-full",
        isSaved
          ? "text-amber-400 bg-amber-400/15 hover:bg-amber-400/25 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
          : "text-slate-600 hover:text-amber-400 hover:bg-amber-400/10",
        className
      )}
      title={isSaved ? "Click to remove from My Ideas" : "Save to My Ideas"}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <div className="relative">
          <Star className={cn(
            "w-4 h-4 transition-all duration-300",
            isSaved ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_4px_rgba(251,191,36,0.7)]" : "text-slate-600",
            animate && "animate-sparkle"
          )} />
          {animate && (
            <Sparkles className="absolute -top-3 -right-3 w-4 h-4 text-amber-400 animate-bounce" />
          )}
        </div>
      )}
    </Button>
  )
}
