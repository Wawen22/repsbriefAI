// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { 
  Video, Layers, Hash, Mail, Lightbulb, Copy, Check, TrendingUp, Star, 
  ArrowUpRight, Music, FileText, Sparkles, Wand2, Zap, Loader2, RotateCcw, 
  MessageSquarePlus, ArrowRight, Share2, Download, Box, Smartphone, Maximize2, ChevronRight, ArrowLeft, X, Orbit
} from "lucide-react"
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
import { Teleprompter } from "@/components/dashboard/Teleprompter"
import { PerformanceModal } from "@/components/dashboard/PerformanceModal"

interface BriefCardProps {
  idea: IdeaObject
  isSaved?: boolean
  hideSaveButton?: boolean
  dbId?: string
  variant?: 'default' | 'compact'
  status?: string
}

type CopyField = 'title' | 'hook' | 'all' | 'script' | 'notion' | null

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
  variant = 'default',
  status: initialStatus = 'backlog'
}: BriefCardProps) {
  const [copied, setCopied] = useState<CopyField>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRemixing, setIsRemixing] = useState(false)
  const [showTeleprompter, setShowTeleprompter] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [remixHistory, setRemixHistory] = useState<IdeaObject[]>([idea])
  const [customInstruction, setCustomInstruction] = useState("")
  const [dbId, setDbId] = useState(initialDbId)
  const [isSaved, setIsSaved] = useState(initialIsSaved)

  useEffect(() => {
    setCurrentIdea(idea); setDbId(initialDbId); setIsSaved(initialIsSaved);
  }, [idea, initialDbId, initialIsSaved])

  const copyToClipboard = useCallback(async (text: string, field: CopyField) => {
    try {
      await navigator.clipboard.writeText(text); setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement('textarea'); textarea.value = text;
      document.body.appendChild(textarea); textarea.select();
      document.execCommand('copy'); document.body.removeChild(textarea);
      setCopied(field); setTimeout(() => setCopied(null), 2000);
    }
  }, [])

  const downloadMarkdown = () => {
    const content = `# ${currentIdea.title}\n\n## Hook\n> ${currentIdea.hook}\n\n## Concept\n${currentIdea.description}\n\n## AI Script\n${currentIdea.scriptDraft || '...'}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Brief-${currentIdea.title}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }

  const handleRemix = async (instruction: string) => {
    setIsRemixing(true); const toastId = toast.loading("Remixing...");
    try {
      const result = await remixScriptAction(currentIdea, instruction)
      if (result.success && result.data) {
        const remixed = { ...currentIdea, hook: result.data.newHook, scriptDraft: result.data.newScript, whyItWorks: result.data.explanation || currentIdea.whyItWorks }
        const saveRes = await saveIdeaAction(remixed.title, 'fitness', remixed)
        if (saveRes.success) {
          setCurrentIdea(remixed); setRemixHistory(p => [...p, remixed]); setDbId(saveRes.id); setIsSaved(true);
          toast.success("Remixed!", { id: toastId })
        }
      }
    } catch (e) { toast.error("Failed", { id: toastId }) } finally { setIsRemixing(false); setCustomInstruction("") }
  }

  const undoRemix = async () => {
    if (remixHistory.length > 1) {
      const h = [...remixHistory]; h.pop(); const prev = h[h.length - 1];
      const res = await saveIdeaAction(prev.title, 'fitness', prev)
      if (res.success) { setRemixHistory(h); setCurrentIdea(prev); toast.info("Undo done") }
    }
  }

  const getIcon = (f: string) => {
    switch (f) {
      case 'Reel': return <Video className="w-4 h-4 text-blue-400" />
      case 'Carousel': return <Layers className="w-4 h-4 text-purple-400" />
      case 'Thread': return <Hash className="w-4 h-4 text-emerald-400" />
      case 'Newsletter': return <Mail className="w-4 h-4 text-amber-400" />
      default: return <Lightbulb className="w-4 h-4 text-slate-400" />
    }
  }

  const formatForNotion = () => {
    return `### ${currentIdea.title}\n**Format:** ${currentIdea.format}\n\n**Hook:** _"${currentIdea.hook}"_\n\n**Concept:** ${currentIdea.description}\n\n**Script:**\n${currentIdea.scriptDraft || '...'}`
  }

  const CopyBtn = ({ field, text, label, icon: CI }: any) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(text, field) }} className="h-7 px-2 text-[10px] text-slate-500 hover:text-white transition-all gap-1.5 font-medium">
      {copied === field ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></> : <>{CI ? <CI className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{label}</>}
    </Button>
  )

  const StrategyDetailView = (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => setIsExpanded(false)} className="h-11 pl-2 pr-5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all gap-3 group/back text-white"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/back:bg-blue-600 transition-colors text-white"><ArrowLeft className="w-5 h-5 text-white" /></div><span className="text-xs font-black uppercase tracking-widest hidden sm:inline text-white">Dashboard</span></Button>
           <div className="hidden lg:flex items-center gap-3 ml-4">{getIcon(currentIdea.format)}<Badge variant="outline" className="text-blue-300 text-[10px] border-blue-500/20 uppercase tracking-widest font-black">{currentIdea.format} Strategy</Badge></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2"><CopyBtn field="all" text={currentIdea.title} label="Copy Strategy" /><div className="h-4 w-px bg-white/10 mx-2" /></div>
           <button onClick={() => setIsExpanded(false)} className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"><X className="w-5 h-5 relative z-10" /><div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between gap-12 text-left">
            <div className="space-y-6 flex-1">
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight text-balance">{currentIdea.title}</h1>
               <div className="flex flex-wrap gap-4"><div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium"><Orbit className="w-4 h-4 text-blue-400 animate-spin-slow" />{currentIdea.format} Distribution</div>{remixHistory.length > 1 && <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse"><Wand2 className="w-3.5 h-3.5 mr-2" /> Personalized Remix</Badge>}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8 w-full lg:w-96 space-y-6 shadow-2xl backdrop-blur-md">
               <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI Remix</span></div>{remixHistory.length > 1 && <button onClick={undoRemix} className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3" /> Undo</button>}</div>
               <div className="grid grid-cols-2 gap-2">{REMIX_OPTIONS.map(o => <button key={o.label} onClick={() => handleRemix(o.label)} disabled={isRemixing} className="text-[10px] font-bold bg-white/5 hover:bg-purple-500/20 border border-white/5 rounded-xl transition-all disabled:opacity-50 p-2.5 flex items-center gap-2 text-white"><span>{o.icon}</span> {o.label.split(' ')[0]}</button>)}</div>
               <div className="relative"><input type="text" placeholder="Custom..." value={customInstruction} onChange={e => setCustomInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRemix(customInstruction)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white" /><button onClick={() => handleRemix(customInstruction)} className="absolute right-3 top-3 text-slate-500 hover:text-purple-400"><ArrowRight className="w-4 h-4" /></button></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                   <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">The Hook</h4></div>
                   <CopyBtn field="hook" text={currentIdea.hook} label="Copy Hook" />
                </div>
                <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden group min-h-[140px] flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
                  <p className={cn("text-2xl md:text-4xl italic text-white font-light leading-tight transition-all duration-700", isRemixing && "blur-md opacity-30")}>&ldquo;{currentIdea.hook}&rdquo;</p>
                  {isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-blue-500 w-10 h-10" />}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                   <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Production Script</h4></div>
                   <Button variant="ghost" size="sm" onClick={() => setShowTeleprompter(true)} className="h-8 text-[10px] text-blue-400 font-black uppercase hover:bg-white/5"><Maximize2 className="w-3.5 h-3.5 mr-2" /> Focus View</Button>
                </div>
                <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 min-h-[300px] relative">
                  <div className={cn(isRemixing && "blur-md opacity-30")}>
                    <p className="text-slate-300 text-lg mb-10 font-light leading-relaxed">{currentIdea.description}</p>
                    <div className="pt-10 border-t border-white/5"><div className="bg-black/40 p-8 rounded-3xl border border-white/5 relative group text-left"><p className="text-base text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">{currentIdea.scriptDraft || "Strategic breakdown processing..."}</p><div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><CopyBtn field="script" text={currentIdea.scriptDraft || ""} label="Copy Script" /></div></div></div>
                  </div>
                  {isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-purple-500 w-10 h-10" />}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2"><TrendingUp className="w-5 h-5 text-emerald-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Why it works</h4></div>
                  <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-lg italic text-emerald-100/80 leading-relaxed font-light text-left">{currentIdea.whyItWorks}</div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2"><Box className="w-5 h-5 text-blue-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Workspace Sync</h4></div>
                  <div className="grid grid-cols-1 gap-4 text-left">
                     <div className="flex justify-between items-center p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group/notion">
                        <div className="flex items-center gap-4 text-left"><div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-sm text-white">N</div><div className="text-left"><p className="text-sm font-bold text-white text-left">Notion Sync</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Ready for blocks</p></div></div>
                        <CopyBtn field="notion" text={formatForNotion()} label="Sync" icon={Share2} />
                     </div>
                     <Button variant="ghost" onClick={downloadMarkdown} className="w-full justify-between p-6 h-auto bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.04] text-white">
                        <div className="flex items-center gap-4"><Download className="w-5 h-5 text-slate-500" /><div><p className="text-sm font-bold text-left">Markdown Export</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">For Trello / ChatGPT</p></div></div>
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                     </Button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8 pb-12 md:pb-8 bg-black border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 shrink-0 relative z-40 shadow-2xl">
        <div className="hidden sm:block text-left max-w-md"><p className="text-sm font-medium text-slate-400 leading-snug text-balance text-left">Finalized strategy for <span className="text-white font-bold">{currentIdea.title}</span>. Ready to deploy?</p></div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {initialStatus === 'published' && dbId && (
            <Button onClick={() => setShowPerformanceModal(true)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white rounded-full px-6 h-14 font-black uppercase tracking-widest transition-all"><TrendingUp className="w-5 h-5 mr-2" /> Track Stats</Button>
          )}
          <Button onClick={() => setShowTeleprompter(true)} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white rounded-full px-12 h-14 font-black shadow-2xl shadow-blue-500/25 group/rec transition-all hover:scale-105 active:scale-95"><Smartphone className="w-6 h-6 mr-3 group-hover/rec:rotate-12 transition-transform" /> Record Now</Button>
          {!hideSaveButton && <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} variant="prominent" />}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="group relative h-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-[22px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
        {variant === 'compact' ? (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl cursor-pointer p-4 h-full flex flex-col hover:bg-white/[0.05] transition-all text-left" onClick={() => setIsExpanded(true)}>
            <div className="flex gap-4 h-full"><div className="p-2 rounded-xl bg-white/5 shrink-0 text-white">{getIcon(currentIdea.format)}</div><div className="flex-1 flex flex-col h-full text-left"><div className="flex justify-between text-left"><Badge variant="outline" className="text-blue-400 text-[9px] border-blue-500/30 font-bold uppercase">{currentIdea.format}</Badge>{isSaved && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}</div><h3 className="text-sm font-bold text-white mt-1 flex-1 leading-snug text-left">{currentIdea.title}</h3></div></div>
          </Card>
        ) : (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl shadow-2xl flex flex-col h-full cursor-pointer hover:bg-white/[0.05] transition-all text-left" onClick={() => setIsExpanded(true)}>
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between shrink-0 text-left"><div className="flex items-center gap-3 text-white">{getIcon(currentIdea.format)}<Badge variant="outline" className="text-blue-400 text-[10px] border-blue-500/30 font-bold uppercase">{currentIdea.format}</Badge></div><div onClick={e => e.stopPropagation()}>{!hideSaveButton ? <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} /> : dbId ? <DeleteIdeaButton id={dbId} /> : null}</div></CardHeader>
            <CardContent className="px-6 pb-6 flex-1 flex flex-col overflow-hidden text-left"><h3 className="text-lg font-bold text-white mb-4 leading-tight text-left">{currentIdea.title}</h3><div className="space-y-4 flex-1 overflow-hidden text-left"><div className="pl-4 border-l-2 border-blue-500/30 text-xs italic text-slate-200 line-clamp-3 leading-relaxed text-left">&ldquo;{currentIdea.hook}&rdquo;</div><p className="text-xs text-slate-400 line-clamp-4 leading-relaxed font-light text-left">{currentIdea.description}</p></div><div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-2 shrink-0 text-left"><div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Star className="w-3 h-3 fill-emerald-400/20" /> Why it works</div><p className="text-[11px] text-slate-500 italic line-clamp-2 leading-snug text-left">{currentIdea.whyItWorks}</p></div></CardContent>
          </Card>
        )}
      </div>
      {isExpanded && StrategyDetailView}
      {showTeleprompter && <Teleprompter title={currentIdea.title} script={currentIdea.scriptDraft || currentIdea.description} onClose={() => setShowTeleprompter(false)} />}
      {showPerformanceModal && dbId && <PerformanceModal ideaId={dbId} title={currentIdea.title} isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} />}
    </>
  )
}
