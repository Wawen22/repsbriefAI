'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Loader2, Sparkles } from 'lucide-react'
import { saveIdeaAction } from '@/app/actions/ideas'
import { toast } from "sonner"
import { cn } from '@/lib/utils'
import { IdeaObject } from '@/types/niche'

export function SaveIdeaButton({ 
  title, 
  ideaData, 
  initialSaved = false,
  variant = 'icon' 
}: { 
  title: string, 
  ideaData?: IdeaObject, 
  initialSaved?: boolean,
  variant?: 'icon' | 'prominent'
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [animate, setAnimate] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) return

    setIsSaving(true)
    try {
      const result = await saveIdeaAction(title, 'fitness', ideaData)
      if (result?.success) {
        setIsSaved(true)
        setAnimate(true)
        toast.success("Saved to My Ideas", {
          icon: <Sparkles className="w-4 h-4 text-yellow-500" />,
        })
        setTimeout(() => setAnimate(false), 600)
      } else {
        toast.error(result?.error || 'Failed to save idea')
      }
    } catch (e) {
      toast.error('An unexpected error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  if (variant === 'prominent') {
    return (
      <Button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={cn(
          "rounded-full px-6 font-bold transition-all h-12 gap-2 shadow-lg relative overflow-hidden",
          isSaved 
            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-default shadow-none" 
            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 hover:scale-105 active:scale-95"
        )}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <div className="relative">
            <Star className={cn(
              "w-4 h-4 transition-all duration-500", 
              isSaved && "fill-yellow-500 scale-110",
              animate && "animate-sparkle"
            )} />
            {animate && (
              <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-yellow-400 animate-pulse" />
            )}
          </div>
        )}
        <span>{isSaved ? "Saved to Library" : "Save Strategy"}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSave}
      disabled={isSaving || isSaved}
      className={cn(
        "h-8 w-8 transition-all relative group/save",
        isSaved 
          ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 hover:text-yellow-500 opacity-100" 
          : "text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10 opacity-0 group-hover:opacity-100"
      )}
      title={isSaved ? "Saved to My Ideas" : "Save to My Ideas"}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <div className="relative">
          <Star className={cn(
            "w-4 h-4 transition-all duration-500", 
            isSaved && "fill-yellow-400 scale-110",
            animate && "animate-sparkle"
          )} />
          {animate && (
            <Sparkles className="absolute -top-3 -right-3 w-4 h-4 text-yellow-400 animate-bounce" />
          )}
        </div>
      )}
    </Button>
  )
}
