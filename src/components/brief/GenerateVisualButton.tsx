// src/components/brief/GenerateVisualButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { Wand2, Loader2, Lock, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUpgradeModal } from '@/components/ui/UpgradeModal'

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">
      PRO
    </span>
  )
}

interface GenerateVisualButtonProps {
  ideaHistoryId: string
  isStarter: boolean
}

export function GenerateVisualButton({ ideaHistoryId, isStarter }: GenerateVisualButtonProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const openUpgrade = useUpgradeModal((s) => s.open)

  // Load existing image on mount
  useEffect(() => {
    if (isStarter || !ideaHistoryId) return
    const supabase = createClient()
    supabase
      .from('idea_images')
      .select('image_url')
      .eq('idea_history_id', ideaHistoryId)
      .single()
      .then(({ data }) => {
        if (data?.image_url) setImageUrl(data.image_url)
      })
  }, [ideaHistoryId, isStarter])

  const handleGenerate = async () => {
    if (isStarter) {
      openUpgrade('AI Visual Generation')
      return
    }

    setIsLoading(true)
    const tid = toast.loading('Generating AI visual…')
    try {
      const res = await fetch('/api/generator/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaHistoryId }),
      })

      const data = await res.json() as { imageUrl?: string; error?: string }

      if (!res.ok) {
        if (res.status === 403) {
          toast.dismiss(tid)
          openUpgrade('AI Visual Generation')
          return
        }
        throw new Error(data.error || 'Generation failed')
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        toast.success('Visual generated!', { id: tid })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image'
      toast.error(message, { id: tid })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'repsbrief-visual.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Visual</span>
      </div>

      {/* Generated image display */}
      {imageUrl && (
        <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02]">
          <img
            src={imageUrl}
            alt="AI-generated visual"
            className="w-full max-h-72 object-cover"
          />
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleDownload}
              className="h-8 px-3 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-black text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Action button */}
      {isStarter ? (
        <Button
          onClick={() => openUpgrade('AI Visual Generation')}
          className="h-10 px-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          {imageUrl ? 'Regenerate Visual' : 'Generate AI Visual'}
          <ProBadge />
        </Button>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
          ) : imageUrl ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Regenerate Visual</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5" /> Generate AI Visual</>
          )}
        </Button>
      )}
    </section>
  )
}
