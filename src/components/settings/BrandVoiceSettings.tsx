// src/components/settings/BrandVoiceSettings.tsx
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, FileText, Loader2, Save, Sparkles, Trash2, Wand2 } from "lucide-react"
import { updateBrandVoiceAction, resetBrandPersonaAction } from "@/app/actions/profile"
import { toast } from "sonner"

export function BrandVoiceSettings({ currentAnalysis }: { currentAnalysis: string | null }) {
  const [samples, setSamples] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(currentAnalysis)

  const handleAnalyze = async () => {
    if (!samples.trim()) return
    setIsAnalyzing(true)
    const toastId = toast.loading("Analyzing your content style...")
    
    try {
      const res = await updateBrandVoiceAction(samples)
      if (res.success && res.data) {
        setAnalysis(res.data)
        setSamples("")
        toast.success("Brand voice updated.", { id: toastId })
      } else {
        toast.error(res.error || "Analysis failed", { id: toastId })
      }
    } catch {
      toast.error("Something went wrong", { id: toastId })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Are you sure? This will delete your current persona and writing style data.")) return
    
    setIsResetting(true)
    const toastId = toast.loading("Resetting persona...")
    
    try {
      const res = await resetBrandPersonaAction()
      if (res.success) {
        setAnalysis(null)
        toast.success("Persona reset successfully.", { id: toastId })
      } else {
        toast.error(res.error || "Reset failed", { id: toastId })
      }
    } catch {
      toast.error("Something went wrong", { id: toastId })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      {analysis && (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Active Persona</p>
                <p className="text-sm italic leading-relaxed text-slate-200">&ldquo;{analysis}&rdquo;</p>
                <p className="text-[11px] text-emerald-200/80">Applied to all new scripts, captions and content remixes.</p>
              </div>
            </div>
            <Button
              onClick={handleReset}
              disabled={isResetting}
              variant="ghost"
              className="h-8 rounded-full px-3 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            >
              {isResetting ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1 h-3.5 w-3.5" />}
              Reset
            </Button>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-black/25 p-5 md:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <Wand2 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">{analysis ? "Refine your persona" : "Train your persona"}</h3>
          </div>
          <p className="text-xs text-slate-500">
            Incolla 2-3 contenuti reali (caption, script, newsletter). L&apos;AI estrae tono, lessico e struttura del tuo stile.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <Textarea
            placeholder="Incolla qui i tuoi migliori contenuti..."
            value={samples}
            onChange={(e) => setSamples(e.target.value)}
            className="min-h-[180px] resize-y rounded-2xl border-white/10 bg-white/[0.02] p-4 text-sm focus-visible:border-blue-500/40"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Suggerimento: separa i sample con una riga vuota per migliorare l&apos;analisi.
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !samples.trim()}
              className="h-10 rounded-full bg-white px-5 font-semibold text-black hover:bg-slate-200"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {analysis ? "Re-train style" : "Analyze & Save"}
            </Button>
          </div>
        </div>
      </section>

      {!analysis && (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Tone Detection",
              desc: "Riconosce ritmo, lessico e intensità comunicativa del tuo stile.",
            },
            {
              icon: Sparkles,
              title: "Draft Consistency",
              desc: "I contenuti generati mantengono coerenza con la tua voce editoriale.",
            },
            {
              icon: Save,
              title: "Team Sync",
              desc: "La persona viene condivisa in automatico su tutto il workspace.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <item.icon className="mb-3 h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white">{item.title}</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
