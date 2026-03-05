// src/components/settings/BrandVoiceSettings.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Save, FileText, CheckCircle2, RotateCcw, Trash2 } from "lucide-react"
import { updateBrandVoiceAction, resetBrandPersonaAction } from "@/app/actions/profile"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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
        toast.success("Brand Persona updated!", { id: toastId })
      } else {
        toast.error(res.error || "Analysis failed", { id: toastId })
      }
    } catch (e) {
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
        toast.success("Persona reset successfully", { id: toastId })
      } else {
        toast.error(res.error || "Reset failed", { id: toastId })
      }
    } catch (e) {
      toast.error("Something went wrong", { id: toastId })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Persona Status */}
      {analysis && (
        <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-3xl overflow-hidden relative group/analysis">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Brand Persona</h3>
                  <button 
                    onClick={handleReset}
                    disabled={isResetting}
                    className="opacity-0 group-hover/analysis:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" /> Reset
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  &ldquo;{analysis}&rdquo;
                </p>
                <p className="text-[10px] text-emerald-500/60 font-medium">
                  This persona is automatically applied to all your new scripts and remixes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
            {analysis ? "Update your AI Persona" : "Train your AI Persona"}
          </label>
          <p className="text-[11px] text-slate-600 px-1">
            Paste 2-3 samples of your past posts or scripts. Our AI will analyze your tone, vocabulary, and structure.
          </p>
        </div>

        <div className="relative group">
          <Textarea 
            placeholder="Paste your best content here... (Captions, Newsletters, Tweets, etc.)"
            value={samples}
            onChange={(e) => setSamples(e.target.value)}
            className="min-h-[200px] bg-white/[0.02] border-white/10 rounded-3xl p-6 text-sm focus:border-blue-500/50 transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !samples.trim()}
              className="bg-white text-black hover:bg-slate-200 rounded-full font-bold h-10 px-6 gap-2 shadow-xl"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {analysis ? "Retrain Style" : "Analyze & Save Style"}
            </Button>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      {!analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: "Tone Cloning", desc: "AI learns if you're ironic, technical or direct." },
            { icon: Sparkles, title: "No More Edits", desc: "Scripts come out sounding exactly like you." },
            { icon: Save, title: "Universal Sync", desc: "Applied to Hook, Description and Script." }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <item.icon className="w-4 h-4 text-blue-400" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
