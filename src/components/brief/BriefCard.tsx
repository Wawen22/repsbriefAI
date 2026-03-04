// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { Video, Layers, Hash, Mail, Lightbulb, Copy, Check, TrendingUp, Star, ArrowUpRight, Music, FileText, Sparkles, Wand2, Zap, Loader2, RotateCcw, MessageSquarePlus, ArrowRight } from "lucide-react"
import { SaveIdeaButton } from "@/components/ui/SaveIdeaButton"
import { DeleteIdeaButton } from "@/components/ui/DeleteIdeaButton"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { remixScriptAction } from "@/app/actions/remix"
import { saveIdeaAction } from "@/app/actions/ideas"
import { toast } from "sonner"

interface BriefCardProps {
  idea: IdeaObject
  isSaved?: boolean
  hideSaveButton?: boolean
  dbId?: string
  variant?: 'default' | 'compact'
}

type CopyField = 'title' | 'hook' | 'all' | 'script' | null

const REMIX_OPTIONS = [
  { label: "Make it Funnier", icon: "😂" },
  { label: "More Professional", icon: "👔" },
  { label: "Shorten it", icon: "✂️" },
  { label: "Viral Catchy Hook", icon: "🚀" },
  { label: "Adapt for TikTok", icon: "📱" },
]

export function BriefCard({ 
  idea, 
  isSaved: initialIsSaved = false, 
  hideSaveButton = false, 
  dbId: initialDbId,
  variant = 'default'
}: BriefCardProps) {
  const [copied, setCopied] = useState<CopyField>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Persistence & Remix State
  const [isRemixing, setIsRemixing] = useState(false)
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [remixHistory, setRemixHistory] = useState<IdeaObject[]>([idea])
  const [customInstruction, setCustomInstruction] = useState("")
  const [dbId, setDbId] = useState(initialDbId)
  const [isSaved, setIsSaved] = useState(initialIsSaved)

  // Sync state with props when they change (important for server-to-client updates)
  useEffect(() => {
    setCurrentIdea(idea)
    setDbId(initialDbId)
    setIsSaved(initialIsSaved)
  }, [idea, initialDbId, initialIsSaved])

  const copyToClipboard = useCallback(async (text: string, field: CopyField) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    }
  }, [])

  const handleRemix = async (instruction: string) => {
    setIsRemixing(true)
    const toastId = toast.loading(`AI is remixing: ${instruction}...`)
    
    try {
      const result = await remixScriptAction(currentIdea, instruction)
      if (result.success && result.data) {
        const remixedIdea: IdeaObject = {
          ...currentIdea,
          hook: result.data.newHook,
          scriptDraft: result.data.newScript,
          whyItWorks: result.data.explanation || currentIdea.whyItWorks
        }
        
        // PERSISTENCE: Save the remixed idea automatically to the database
        // This ensures the remix is kept even after page refresh or navigation
        const saveResult = await saveIdeaAction(remixedIdea.title, 'fitness', remixedIdea)
        
        if (saveResult.success) {
          setCurrentIdea(remixedIdea)
          setRemixHistory(prev => [...prev, remixedIdea])
          setDbId(saveResult.id)
          setIsSaved(true)
          toast.success("Strategy remixed and saved!", { id: toastId })
        } else {
          throw new Error("Remix succeeded but failed to save")
        }
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      toast.error(err.message || "Remix failed", { id: toastId })
    } finally {
      setIsRemixing(false)
      setCustomInstruction("")
    }
  }

  const undoRemix = async () => {
    if (remixHistory.length > 1) {
      const newHistory = [...remixHistory]
      newHistory.pop()
      const prevIdea = newHistory[newHistory.length - 1]
      
      // Update database with the previous version
      const saveResult = await saveIdeaAction(prevIdea.title, 'fitness', prevIdea)
      
      if (saveResult.success) {
        setRemixHistory(newHistory)
        setCurrentIdea(prevIdea)
        toast.info("Reverted to previous version")
      }
    }
  }

  const formatFullIdea = () => {
    return `**${currentIdea.title}**\n\nHook: "${currentIdea.hook}"\n\nConcept: ${currentIdea.description}\n\nFormat: ${currentIdea.format}\n\nWhy it works: ${currentIdea.whyItWorks}`
  }

  const getIcon = (format: string) => {
    switch (format) {
      case 'Reel': return <Video className="w-4 h-4 text-blue-400" />
      case 'Carousel': return <Layers className="w-4 h-4 text-purple-400" />
      case 'Thread': return <Hash className="w-4 h-4 text-emerald-400" />
      case 'Newsletter': return <Mail className="w-4 h-4 text-amber-400" />
      case 'Idea': return <Lightbulb className="w-4 h-4 text-blue-300" />
      default: return <Lightbulb className="w-4 h-4 text-slate-400" />
    }
  }

  const CopyBtn = ({ field, text, label }: { field: CopyField, text: string, label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(text, field);
      }}
      className="h-7 px-2 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 transition-all gap-1.5 font-medium rounded-lg"
    >
      {copied === field ? (
        <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 font-bold uppercase tracking-wider">Copied</span></>
      ) : (
        <><Copy className="w-3 h-3" />{label}</>
      )}
    </Button>
  )

  if (variant === 'compact') {
    return (
      <>
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          
          <Card 
            className="relative bg-white/[0.03] border-white/10 group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer p-4"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-blue-500/10 transition-colors shrink-0">
                {getIcon(currentIdea.format)}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="border-none bg-blue-500/5 text-blue-400 text-[9px] px-1.5 py-0 font-bold uppercase tracking-widest leading-none h-fit">
                    {currentIdea.format}
                  </Badge>
                  {isSaved && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors leading-snug">
                  {currentIdea.title}
                </h3>
              </div>
            </div>
          </Card>
        </div>
        {renderModal()}
      </>
    )
  }

  function renderModal() {
    return (
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] lg:max-w-[1400px] w-full max-h-[90vh] overflow-hidden p-0 bg-black border-white/10 text-slate-50 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] flex flex-col rounded-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{currentIdea.title}</DialogTitle>
            <DialogDescription>Full content strategy and script for {currentIdea.title}</DialogDescription>
          </DialogHeader>

          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="p-8 pb-4 relative z-10">
            <div className="text-left flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    {getIcon(currentIdea.format)}
                  </div>
                  <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                    {currentIdea.format} Strategy
                  </Badge>
                  {remixHistory.length > 1 && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest animate-pulse">
                      <Wand2 className="w-3 h-3 mr-1" /> AI Remixed
                    </Badge>
                  )}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight text-white max-w-3xl text-balance">
                  {currentIdea.title}
                </h2>
                <div className="flex items-center gap-4">
                  <CopyBtn field="all" text={formatFullIdea()} label="Copy Full Brief" />
                  {remixHistory.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={undoRemix}
                      className="h-7 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 gap-1.5 font-bold uppercase tracking-wider"
                    >
                      <RotateCcw className="w-3 h-3" /> Undo Remix
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 w-full md:w-80 space-y-4 shadow-2xl">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI Strategy Remix</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {REMIX_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleRemix(opt.label)}
                        disabled={isRemixing}
                        className="text-[10px] font-bold bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 text-slate-400 hover:text-purple-300 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                 </div>
                 <div className="relative pt-2">
                    <input 
                      type="text"
                      placeholder="Custom instruction..."
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && customInstruction && handleRemix(customInstruction)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button 
                      onClick={() => handleRemix(customInstruction)}
                      disabled={!customInstruction || isRemixing}
                      className="absolute right-2 top-[18px] text-slate-500 hover:text-purple-400 disabled:opacity-0 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 relative z-10 custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">The Winning Hook</h4>
                </div>
                <CopyBtn field="hook" text={currentIdea.hook} label="Copy Hook" />
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
                <p className={cn(
                  "text-xl md:text-2xl font-light italic text-white leading-relaxed pl-4 transition-all duration-700",
                  isRemixing && "blur-sm opacity-50"
                )}>
                  &ldquo;{currentIdea.hook}&rdquo;
                </p>
                {isRemixing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Content Concept</h4>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[200px] relative">
                  <div className={cn("transition-all duration-700", isRemixing && "blur-sm opacity-50")}>
                    <p className="text-slate-300 leading-relaxed font-light mb-6">
                      {currentIdea.description}
                    </p>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Script / Structure</h5>
                       <p className="text-sm text-slate-400 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-xl border border-white/5">
                         {currentIdea.scriptDraft || "Generating full script structure..."}
                       </p>
                    </div>
                  </div>
                  {isRemixing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategist Analysis</h4>
                  </div>
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-sm text-emerald-100/80 leading-relaxed italic">
                      {currentIdea.whyItWorks}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                         <Music className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Trending Audio</p>
                         <p className="text-sm text-slate-300 font-medium">{currentIdea.trendingAudioSuggestion || 'Fast-paced rhythmic beat'}</p>
                      </div>
                   </div>

                   <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                         <Wand2 className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Alternative Hook</p>
                         <p className="text-sm text-slate-300 font-medium italic line-clamp-1 text-balance">
                           {currentIdea.alternativeHooks?.[0] || `The #1 mistake you're making with ${currentIdea.title.split(' ').slice(0, 3).join(' ')}...`}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-t from-blue-900/20 to-transparent border-t border-white/10 relative z-20 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-6 max-w-[1400px] mx-auto">
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-400">Ready to create?</p>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">Record this using the strategy above.</p>
              </div>
              
              <div className="flex items-center gap-3 ml-auto">
                <Button 
                  variant="outline"
                  className="bg-white text-black hover:bg-slate-200 border-none rounded-full font-bold px-8 h-12 transition-all shadow-xl"
                  onClick={() => setIsExpanded(false)}
                >
                  Got it
                </Button>
                {!hideSaveButton && (
                  <SaveIdeaButton 
                    title={currentIdea.title} 
                    ideaData={currentIdea} 
                    initialSaved={isSaved} 
                    variant="prominent" 
                  />
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <div className="group relative h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-[22px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
        
        <Card 
          className="relative bg-white/[0.03] border-white/10 group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between space-y-0 relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                  {getIcon(currentIdea.format)}
               </div>
               <div className="flex flex-col">
                 <Badge variant="outline" className="border-none bg-blue-500/5 text-blue-400 text-[10px] px-1.5 py-0 font-bold uppercase tracking-widest leading-normal h-fit w-fit">
                   {currentIdea.format}
                 </Badge>
               </div>
            </div>
            <div className="flex items-center gap-1">
              <div onClick={(e) => e.stopPropagation()}>
                {!hideSaveButton ? (
                  <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} />
                ) : dbId ? (
                  <DeleteIdeaButton id={dbId} />
                ) : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6 flex-1 flex flex-col relative z-10">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors leading-tight">
                {currentIdea.title}
              </h3>
            </div>

            <div className="space-y-4 flex-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
                <div className="pl-4 space-y-2">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">The Hook</span>
                  <p className="text-sm italic text-slate-200 leading-relaxed font-light">
                    &ldquo;{currentIdea.hook}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pl-4 space-y-2">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Concept</span>
                 <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-3">
                   {currentIdea.description}
                 </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
               <div className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-xl shadow-white/5">
                  Expand Strategy <ArrowUpRight className="w-3 h-3" />
               </div>
            </div>

            <div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
                <Star className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-400/20" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Why it works</span>
              </div>
              <p className="text-[12px] text-slate-500 italic leading-relaxed pl-1 group-hover:text-slate-400 transition-colors line-clamp-2">
                {currentIdea.whyItWorks}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {renderModal()}
    </>
  )
}
