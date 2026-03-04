'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2,
  BrainCircuit,
  Wand2
} from 'lucide-react'
import { analyzeBrandVoiceAction } from '@/app/actions/profile'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BrandVoiceSettingsProps {
  initialSamples: string[]
  currentAnalysis: string | null
}

export function BrandVoiceSettings({ initialSamples, currentAnalysis }: BrandVoiceSettingsProps) {
  const [samples, setSamples] = useState<string[]>(initialSamples || [])
  const [newSample, setNewSample] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(currentAnalysis)

  const addSample = () => {
    if (!newSample.trim()) return
    setSamples(prev => [...prev, newSample.trim()])
    setNewSample("")
  }

  const removeSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (samples.length === 0) {
      toast.error("Add at least one writing sample first")
      return
    }

    setIsAnalyzing(true)
    const toastId = toast.loading("AI is analyzing your style...")

    try {
      const result = await analyzeBrandVoiceAction(samples)
      if (result.success && result.analysis) {
        setAnalysis(result.analysis)
        toast.success("Brand Voice profile updated!", { id: toastId })
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed", { id: toastId })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Profile Card */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl border p-1 transition-all duration-1000",
        analysis ? "bg-purple-600/10 border-purple-500/20" : "bg-white/[0.02] border-white/5"
      )}>
        <div className="bg-black/40 rounded-[22px] p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={cn(
                 "p-2.5 rounded-xl border transition-colors",
                 analysis ? "bg-purple-500/10 border-purple-500/20" : "bg-white/5 border-white/5"
               )}>
                  <BrainCircuit className={cn("w-5 h-5", analysis ? "text-purple-400" : "text-slate-500")} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Style Profile</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">How the AI perceives your voice</p>
               </div>
            </div>
            {analysis && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                Active
              </Badge>
            )}
          </div>

          <div className="relative min-h-[80px] flex items-center justify-center border border-white/5 rounded-2xl bg-black/20 p-6 italic text-slate-300 text-sm leading-relaxed">
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500">Processing signals...</span>
              </div>
            ) : analysis ? (
              <p>&ldquo;{analysis}&rdquo;</p>
            ) : (
              <div className="text-center space-y-2">
                <p className="not-italic text-slate-600 font-medium">No profile generated yet.</p>
                <p className="not-italic text-[10px] uppercase tracking-widest text-slate-700">Add samples below to train the AI</p>
              </div>
            )}
          </div>
        </div>
        {analysis && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Add Writing Samples</label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <textarea 
                value={newSample}
                onChange={(e) => setNewSample(e.target.value)}
                placeholder="Paste a past post, newsletter, or caption that sounds like you..."
                className="relative w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all resize-none font-light"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                size="sm" 
                onClick={addSample}
                disabled={!newSample.trim()}
                className="bg-white text-black hover:bg-slate-200 rounded-full font-bold px-4 h-9 gap-2 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sample
              </Button>
            </div>
          </div>

          <Button 
            className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold h-12 gap-3 shadow-lg shadow-purple-500/20 group"
            onClick={handleAnalyze}
            disabled={isAnalyzing || samples.length === 0}
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            Analyze & Train My AI Voice
          </Button>
        </div>

        {/* Samples List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Sample Archive</label>
            <span className="text-[10px] font-bold text-slate-500">{samples.length} Samples</span>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {samples.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-700">
                 <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-xs font-bold uppercase tracking-widest opacity-40">No samples added</p>
              </div>
            ) : (
              samples.map((s, i) => (
                <div key={i} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                  <p className="text-xs text-slate-400 line-clamp-3 font-light leading-relaxed pr-8">{s}</p>
                  <button 
                    onClick={() => removeSample(i)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
