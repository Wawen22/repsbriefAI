'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Loader2 } from 'lucide-react'
import { saveIdeaAction } from '@/app/actions/ideas'
import { toast } from "sonner"
import { cn } from '@/lib/utils'
import { IdeaObject } from '@/types/niche'

export function SaveIdeaButton({ title, ideaData, initialSaved = false }: { title: string, ideaData?: IdeaObject, initialSaved?: boolean }) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(initialSaved)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent any parent link clicks if any
    if (isSaved) return // Already saved

    setIsSaving(true)
    try {
      const result = await saveIdeaAction(title, 'fitness', ideaData)
      if (result?.success) {
        setIsSaved(true)
        toast.success("Saved to My Ideas")
      } else {
        toast.error(result?.error || 'Failed to save idea')
      }
    } catch (e) {
      toast.error('An unexpected error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSave}
      disabled={isSaving || isSaved}
      className={cn(
        "h-8 w-8 transition-all",
        isSaved 
          ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 hover:text-yellow-500 opacity-100" 
          : "text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10 opacity-0 group-hover:opacity-100"
      )}
      title={isSaved ? "Saved to My Ideas" : "Save to My Ideas"}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={cn("w-4 h-4", isSaved && "fill-yellow-400")} />
      )}
    </Button>
  )
}
