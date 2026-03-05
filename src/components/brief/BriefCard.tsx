// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { 
  Video, Layers, Hash, Mail, Lightbulb, Copy, Check, TrendingUp, Star, 
  ArrowUpRight, Music, FileText, Sparkles, Wand2, Zap, Loader2, RotateCcw, 
  MessageSquarePlus, ArrowRight, Share2, Download, Box, Smartphone, Maximize2, ChevronRight, ArrowLeft, X, Orbit, Crown
} from "lucide-react"
import { SaveIdeaButton } from "@/components/ui/SaveIdeaButton"
import { DeleteIdeaButton } from "@/components/ui/DeleteIdeaButton"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
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
  plan?: string
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
  status: initialStatus = 'backlog',
  plan = 'starter'
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
  const [isMounted, setIsMounted] = useState(false)

  const isPro = plan === 'pro' || plan === 'team'

  useEffect(() => {
    setIsMounted(true)
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
    if (!isPro) { toast.error("PRO Feature"); return }
    const content = `# ${currentIdea.title}\n\n## Hook\n> ${currentIdea.hook}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Brief.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  const handleRemix = async (i: string) => {
    if (!isPro) { toast.error("PRO Feature"); return }
    setIsRemixing(true); const tid = toast.loading("Remixing...");
    try {
      const res = await remixScriptAction(currentIdea, i)
      if (res.success && res.data) {
        const r = { ...currentIdea, hook: res.data.newHook, scriptDraft: res.data.newScript, whyItWorks: res.data.explanation || currentIdea.whyItWorks }
        const s = await saveIdeaAction(r.title, 'fitness', r)
        if (s.success) { setCurrentIdea(r); setRemixHistory(p => [...p, r]); setDbId(s.id); setIsSaved(true); toast.success("Remixed!", { id: tid }) }
      }
    } catch (e) { toast.error("Failed", { id: tid }) } finally { setIsRemixing(false); setCustomInstruction("") }
  }

  const undoRemix = async () => {
    if (remixHistory.length > 1) {
      const h = [...remixHistory]; h.pop(); const p = h[h.length - 1];
      const s = await saveIdeaAction(p.title, 'fitness', p)
      if (s.success) { setRemixHistory(h); setCurrentIdea(p); toast.info("Reverted") }
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

  const handleOpenTeleprompter = () => {
    if (!isPro) { toast.error("PRO Feature"); return }
    setShowTeleprompter(true)
  }

  const formatForNotion = () => {
    return `### ${currentIdea.title}\n**Format:** ${currentIdea.format}\n\n**Hook:** _"${currentIdea.hook}"_\n\n**Concept:** ${currentIdea.description}\n\n**Script:**\n${currentIdea.scriptDraft || '...'}`
  }

  const CopyBtn = ({ field, text, label, icon: CI }: any) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(text, field) }} className="h-7 px-2 text-[10px] text-slate-500 hover:text-white transition-all gap-1.5 font-medium">
      {copied === field ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></> : <>{CI ? <CI className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{label}</>}
    </Button>
  )

  const StrategyDetailView = isMounted && isExpanded ? createPortal(
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col animate-in slide-in-from-bottom-4 duration-500 overflow-hidden text-left">
      <div className="h-24 md:h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between shrink-0 relative z-[10010]">
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => setIsExpanded(false)} className="h-11 pl-2 pr-5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all gap-3 group/back text-white"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/back:bg-blue-600 transition-colors text-white"><ArrowLeft className="w-5 h-5 text-white" /></div><span className="text-xs font-black uppercase tracking-widest hidden sm:inline text-white">Dashboard</span></Button>
           <div className="hidden lg:flex items-center gap-3 ml-4">{getIcon(currentIdea.format)}<Badge variant="outline" className="text-blue-300 text-[10px] border-blue-500/20 uppercase tracking-widest font-black">{currentIdea.format} Strategy</Badge></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2"><CopyBtn field="all" text={currentIdea.title} label="Copy Strategy" /><div className="h-4 w-px bg-white/10 mx-2" /></div>
           <button onClick={() => setIsExpanded(false)} className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg text-rose-400"><X className="w-6 h-6 relative z-10" /><div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between gap-12 text-left text-white">
            <div className="space-y-6 flex-1">
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight text-balance text-left">{currentIdea.title}</h1>
               <div className="flex flex-wrap gap-4 text-left text-white"><div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium"><Orbit className="w-4 h-4 text-blue-400 animate-spin-slow" />{currentIdea.format} Distribution</div>{remixHistory.length > 1 && <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase animate-pulse"><Wand2 className="w-3.5 h-3.5 mr-2" /> Personalized Remix</Badge>}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 md:p-8 w-full lg:w-96 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
               {!isPro && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] p-6 text-center">
                    <Crown className="w-8 h-8 text-yellow-500 mb-3" />
                    <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">PRO Feature</p>
                    <p className="text-[10px] text-slate-400 mb-4">Upgrade to remix strategies with AI</p>
                    <Button size="sm" className="bg-white text-black rounded-full text-[10px] h-8 px-4 font-black">Upgrade Now</Button>
                 </div>
               )}
               <div className="flex items-center justify-between text-white"><div className="flex items-center gap-2 text-white"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI Remix</span></div>{remixHistory.length > 1 && <button onClick={undoRemix} className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors"><RotateCcw className="w-3 h-3" /> Undo</button>}</div>
               <div className="grid grid-cols-2 gap-2">{REMIX_OPTIONS.map(o => <button key={o.label} onClick={() => handleRemix(o.label)} disabled={isRemixing || !isPro} className="text-[10px] font-bold bg-white/5 hover:bg-purple-500/20 border border-white/5 rounded-xl transition-all disabled:opacity-50 p-2.5 flex items-center gap-2 text-white text-left"><span>{o.icon}</span> {o.label.split(' ')[0]}</button>)}</div>
               <div className="relative"><input type="text" placeholder="Custom..." disabled={!isPro} value={customInstruction} onChange={e => setCustomInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRemix(customInstruction)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white" /><button onClick={() => handleRemix(customInstruction)} disabled={!isPro} className="absolute right-3 top-3 text-slate-500 hover:text-purple-400"><ArrowRight className="w-4 h-4" /></button></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left text-white">
            <div className="lg:col-span-8 space-y-12 text-left">
              <div className="space-y-6 text-left text-white"><div className="flex justify-between items-center px-2 text-left text-white"><div className="flex items-center gap-2 text-left text-white"><Zap className="w-5 h-5 text-blue-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">The Hook</h4></div><CopyBtn field="hook" text={currentIdea.hook} label="Copy Hook" /></div><div className="p-8 md:p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative min-h-[140px] flex items-center text-left text-white"><div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" /><p className={cn("text-2xl md:text-4xl italic text-white font-light leading-tight transition-all duration-700 text-left", isRemixing && "blur-md opacity-30")}>&ldquo;{currentIdea.hook}&rdquo;</p>{isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-blue-500 w-10 h-10" />}</div></div>
              <div className="space-y-6 text-left text-white"><div className="flex justify-between items-center px-2 text-left text-white"><div className="flex items-center gap-2 text-left text-white"><FileText className="w-5 h-5 text-purple-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Production Script</h4></div><Button variant="ghost" size="sm" onClick={handleOpenTeleprompter} className="h-8 text-[10px] text-blue-400 font-black uppercase hover:bg-white/5"><Maximize2 className="w-3.5 h-3.5 mr-2" /> Focus View</Button></div><div className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 min-h-[300px] relative text-left text-white"><div className={cn(isRemixing && "blur-md opacity-30 text-left text-white")}><p className="text-slate-300 text-lg mb-10 text-left leading-relaxed text-white">{currentIdea.description}</p><div className="pt-10 border-t border-white/5 text-left text-white"><div className="bg-black/40 p-8 rounded-3xl border border-white/5 relative group text-left text-white"><p className="text-base text-slate-400 font-mono leading-relaxed whitespace-pre-wrap text-left text-white">{currentIdea.scriptDraft || "Generating..."}</p><div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><CopyBtn field="script" text={currentIdea.scriptDraft || ""} label="Copy Script" /></div></div></div></div>{isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-purple-500 w-10 h-10" />}</div></div>
            </div>
            <div className="lg:col-span-4 space-y-12 text-left text-white"><div className="space-y-6 text-left text-white"><div className="flex items-center gap-2 px-2 text-left text-white"><TrendingUp className="w-5 h-5 text-emerald-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Why it works</h4></div><div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-lg italic text-emerald-100/80 leading-relaxed font-light text-left text-white">{currentIdea.whyItWorks}</div></div><div className="space-y-6 relative overflow-hidden text-left text-white">{!isPro && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-[2rem] text-center p-4"><Crown className="w-6 h-6 text-yellow-500 mb-2" /><p className="text-[10px] font-black text-white uppercase tracking-widest text-left text-white">PRO Workspace</p></div>}<div className="flex items-center gap-2 px-2 text-left text-white"><Box className="w-5 h-5 text-blue-400" /><h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Workspace Sync</h4></div><div className="grid gap-4 text-left text-white"><div className="flex justify-between items-center p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.04] text-left text-white"><div className="flex items-center gap-4 text-left text-white"><div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-sm text-white">N</div><div className="text-left text-white"><p className="text-sm font-bold text-white text-left text-white">Notion Sync</p><p className="text-[10px] text-slate-500 uppercase text-left text-white">Ready for blocks</p></div></div><CopyBtn field="notion" text={formatForNotion()} label="Sync" icon={Share2} /></div><Button variant="ghost" onClick={downloadMarkdown} className="w-full justify-between p-6 h-auto bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.04] text-white text-left text-white"><div className="flex items-center gap-4 text-left text-white text-white"><Download className="w-5 h-5 text-slate-500" /><div className="text-left text-white"><p className="text-sm font-bold text-white text-left">Markdown Export</p><p className="text-[10px] text-slate-500 uppercase text-left text-white">Standard format</p></div></div><ChevronRight className="w-5 h-5 text-slate-700" /></Button></div></div></div>
          </div>
        </div>
      </div>
      <div className="p-8 pb-12 bg-black border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-[10020] shadow-2xl text-left text-white"><div className="hidden sm:block text-left max-w-md text-white"><p className="text-sm font-medium text-slate-400 text-left text-white">Finalized strategy for <span className="text-white font-bold">{currentIdea.title}</span>. Ready to deploy?</p></div><div className="flex items-center gap-4 w-full sm:w-auto text-left text-white"><Button variant="outline" className="hidden md:flex bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full px-8 h-14 font-black uppercase tracking-widest text-left" onClick={() => setIsExpanded(false)}>Close</Button><Button onClick={handleOpenTeleprompter} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white rounded-full px-12 h-14 font-black shadow-2xl text-left group/rec"><Smartphone className="w-6 h-6 mr-3 group-hover/rec:rotate-12 transition-all" /> Record Now {!isPro && "(PRO)"}</Button>{!hideSaveButton && <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} variant="prominent" />}</div></div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="group relative h-full text-left">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-[22px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
        {variant === 'compact' ? (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl cursor-pointer p-4 h-full flex flex-col hover:bg-white/[0.05] transition-all text-left" onClick={() => setIsExpanded(true)}>
            <div className="flex gap-4 h-full"><div className="p-2 rounded-xl bg-white/5 shrink-0 text-white">{getIcon(currentIdea.format)}</div><div className="flex-1 flex flex-col h-full text-left text-white"><div className="flex justify-between text-left text-white"><Badge variant="outline" className="text-blue-400 text-[9px] border-blue-500/30 font-bold uppercase">{currentIdea.format}</Badge>{isSaved && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}</div><h3 className="text-sm font-bold text-white mt-1 flex-1 leading-snug text-left text-white">{currentIdea.title}</h3></div></div>
          </Card>
        ) : (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl shadow-2xl flex flex-col h-full cursor-pointer hover:bg-white/[0.05] transition-all text-left" onClick={() => setIsExpanded(true)}>
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between shrink-0 text-left"><div className="flex items-center gap-3 text-white text-white">{getIcon(currentIdea.format)}<Badge variant="outline" className="text-blue-400 text-[10px] border-blue-500/30 font-bold uppercase">{currentIdea.format}</Badge></div><div onClick={e => e.stopPropagation()}>{!hideSaveButton ? <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} /> : dbId ? <DeleteIdeaButton id={dbId} /> : null}</div></CardHeader>
            <CardContent className="px-6 pb-6 flex-1 flex flex-col overflow-hidden text-left text-white"><h3 className="text-lg font-bold text-white mb-4 leading-tight text-left text-white">{currentIdea.title}</h3><div className="space-y-4 flex-1 overflow-hidden text-left text-white text-white"><div className="pl-4 border-l-2 border-blue-500/30 text-xs italic text-slate-200 line-clamp-3 leading-relaxed text-left text-white">&ldquo;{currentIdea.hook}&rdquo;</div><p className="text-xs text-slate-400 line-clamp-4 leading-relaxed font-light text-left text-white">{currentIdea.description}</p></div><div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-2 shrink-0 text-left text-white text-white"><div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Star className="w-3 h-3 fill-emerald-400/20" /> Why it works</div><p className="text-[11px] text-slate-500 italic line-clamp-2 leading-snug text-left text-white">{currentIdea.whyItWorks}</p></div></CardContent>
          </Card>
        )}
      </div>
      {StrategyDetailView}
      {showTeleprompter && <Teleprompter title={currentIdea.title} script={currentIdea.scriptDraft || currentIdea.description} onClose={() => setShowTeleprompter(false)} />}
      {showPerformanceModal && dbId && <PerformanceModal ideaId={dbId} title={currentIdea.title} isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} />}
    </>
  )
}
