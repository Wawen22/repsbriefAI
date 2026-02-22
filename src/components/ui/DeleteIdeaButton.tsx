'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteIdeaAction } from '@/app/actions/ideas'

export function DeleteIdeaButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteIdeaAction(id)
      if (!result?.success) {
        alert(result?.error || 'Failed to delete idea')
      }
    } catch (e) {
      alert('An expected error occurred while deleting')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
      title="Delete Idea"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </Button>
  )
}
