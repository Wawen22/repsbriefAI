// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { 
  Video, Layers, Hash, Mail, Lightbulb, Copy, Check, TrendingUp, Star, 
  ArrowUpRight, Music, FileText, Sparkles, Wand2, Zap, Loader2, RotateCcw, 
  MessageSquarePlus, ArrowRight, Share2, Download, Box, Smartphone, Maximize2, ChevronRight, ArrowLeft, X, Orbit, Crown, LayoutGrid, Settings2, Link as LinkIcon
} from "lucide-react"
import { SaveIdeaButton } from "@/components/ui/SaveIdeaButton"
import { DeleteIdeaButton } from "@/components/ui/DeleteIdeaButton"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { remixScriptAction } from "@/app/actions/remix"
import { saveIdeaAction, shareIdeaAction } from "@/app/actions/ideas"
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

type CopyField = 'title' | 'hook' | 'all' | 'script' | 'notion' | 'share' | null

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
  const [isSharing, setIsSharing] = useState(false)
  const [showTeleprompter, setShowTeleprompter] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [remixHistory, setRemixHistory] = useState<IdeaObject[]>([idea])
  const [customInstruction, setCustomInstruction] = useState("")
  const [dbId, setDbId] = useState(initialDbId)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'tools'>('content')

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

  const handleShare = async () => {
    setIsSharing(true)
    const tid = toast.loading("Generating public link...")
    try {
      const res = await shareIdeaAction(currentIdea, 'fitness')
      if (res.success && res.shareId) {
        const shareUrl = `${window.location.origin}/share/${res.shareId}`
        await copyToClipboard(shareUrl, 'share')
        toast.success("Public link copied to clipboard!", { id: tid })
      } else {
        toast.error("Failed to generate link", { id: tid })
      }
    } catch (e) {
      toast.error("Error sharing strategy", { id: tid })
    } finally {
      setIsSharing(false)
    }
  }

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
      } else {
        toast.error(res.error || "Failed to remix", { id: tid })
      }
    } catch (e) { toast.error("Something went wrong", { id: tid }) } finally { setIsRemixing(false); setCustomInstruction("") }
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

  const CopyBtn = ({ field, text, label, icon: CI, className }: any) => (
    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard(text, field) }} className={cn("h-7 px-2 text-[10px] text-slate-500 hover:text-white transition-all gap-1.5 font-medium", className)}>
      {copied === field ? <><Check className="w-3 h-3 text-emerald-400" /><span>Copied</span></> : <>{CI ? <CI className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{label}</>}
    </Button>
  )

  const StrategyDetailView = isMounted && isExpanded ? createPortal(
    <div className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col animate-in fade-in duration-300 overflow-hidden text-left font-sans text-white text-left">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-black/40 backdrop-blur-2xl px-4 md:px-6 flex items-center justify-between shrink-0 relative z-[10010] text-left">
        <div className="flex items-center gap-4 text-left">
          <Button 
            variant="ghost" 
            onClick={() => setIsExpanded(false)} 
            className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all p-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div className="hidden sm:block flex flex-col text-left">
            <h2 className="text-[10px] font-bold text-slate-400 truncate max-w-[200px] md:max-w-md uppercase tracking-tight text-left">
              {currentIdea.title}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-left">
          <div className="flex items-center gap-2 mr-2 border-r border-white/10 pr-4 text-left">
            {!isPro ? (
              <Button 
                onClick={() => toast.info("Teleprompter is PRO", { icon: <Crown className="w-3 h-3 text-yellow-500" /> })}
                className="bg-white/5 border border-white/10 text-slate-400 rounded-full px-4 h-8 text-[9px] font-bold hover:bg-white/10 transition-all gap-2"
              >
                <Crown className="w-3 h-3 text-yellow-500" /> Unlock Prompter
              </Button>
            ) : (
              <Button 
                onClick={handleOpenTeleprompter} 
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 h-8 text-[9px] font-black transition-all hover:scale-105 active:scale-95 gap-2"
              >
                <Smartphone className="w-3.5 h-3.5" /> Record Now
              </Button>
            )}
            {!hideSaveButton && (
              <SaveIdeaButton 
                title={currentIdea.title} 
                ideaData={currentIdea} 
                initialSaved={isSaved} 
                variant="prominent" 
                className="h-8 px-5 text-[9px] shadow-none bg-white text-black font-black uppercase tracking-tight" 
              />
            )}
          </div>
          
          <button 
            onClick={() => setIsExpanded(false)} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-left"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10 text-left">
        <main className={cn(
          "flex-1 overflow-y-auto custom-scrollbar px-4 md:px-12 py-8 space-y-12 transition-all duration-300 text-left",
          activeTab === 'tools' ? 'hidden md:block' : 'block'
        )}>
          <div className="max-w-4xl mx-auto space-y-12 pb-32 text-left">
            
            <div className="space-y-2 mb-8 text-left">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 text-[9px] uppercase tracking-widest font-black h-5 px-2">
                  {currentIdea.format} Strategy
                </Badge>
                {remixHistory.length > 1 && (
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px] uppercase font-black h-5 px-2 text-left">
                    <Wand2 className="w-2.5 h-2.5 mr-1" /> Custom Remix
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter text-left">
                {currentIdea.title}
              </h1>
            </div>

            <section className="space-y-4 text-left">
              <div className="flex items-center gap-3 px-1 text-left">
                <Zap className="w-4 h-4 text-blue-400" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">The Hook</h4>
              </div>
              
              <div className="p-8 md:p-14 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative overflow-hidden text-left shadow-2xl text-left">
                <div className="absolute top-0 left-0 w-1 h-20 bg-blue-500 rounded-full text-left" />
                <div className="relative z-10 text-left">
                  <p className={cn(
                    "text-3xl md:text-5xl font-serif italic text-white leading-[1.2] transition-all duration-700 text-left",
                    isRemixing && "blur-lg opacity-20"
                  )}>
                    &ldquo;{currentIdea.hook}&rdquo;
                  </p>
                  {isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-blue-500 w-12 h-12" />}
                </div>
                <div className="flex justify-end gap-2 mt-8 text-left">
                  <CopyBtn field="hook" text={currentIdea.hook} label="Copy Hook" />
                </div>
              </div>
            </section>

            <section className="space-y-4 text-left text-left">
              <div className="flex items-center gap-3 px-1 text-left text-left">
                <FileText className="w-4 h-4 text-purple-400 text-left" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left text-left text-left">Production Script</h4>
              </div>
              <div className="rounded-[2.5rem] bg-white/[0.01] border border-white/5 overflow-hidden text-left shadow-inner">
                <div className={cn("p-8 md:p-12 space-y-10 text-left text-left", isRemixing && "blur-lg opacity-20")}>
                  <div className="space-y-4 text-left text-left">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] block text-left text-left">Concept Strategy</span>
                    <p className="text-slate-200 text-xl leading-relaxed font-light text-left text-left">{currentIdea.description}</p>
                  </div>
                  <div className="h-px bg-gradient-to-r from-white/10 to-transparent text-left" />
                  <div className="space-y-6 text-left text-left text-left">
                    <div className="flex items-center justify-between text-left text-left">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-left">Full Script Draft</span>
                      <CopyBtn field="script" text={currentIdea.scriptDraft || ""} label="Copy Script" />
                    </div>
                    <div className="bg-black/40 p-10 rounded-[2rem] border border-white/5 font-mono text-sm md:text-base text-slate-400 leading-relaxed whitespace-pre-wrap min-h-[350px] relative text-left shadow-2xl text-left text-left">
                      {currentIdea.scriptDraft || "Finalizing the script details..."}
                      {isRemixing && <Loader2 className="absolute inset-0 m-auto animate-spin text-purple-500 w-10 h-10" />}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <aside className={cn(
          "w-full md:w-[360px] lg:w-[400px] bg-black/20 backdrop-blur-md border-l border-white/5 transition-all duration-300 relative flex flex-col text-left",
          activeTab === 'content' ? 'hidden md:flex' : 'flex'
        )}>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 text-left">
            <section className="bg-white/[0.03] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl relative text-left">
              {!isPro && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-[6px] p-6 text-center">
                  <Crown className="w-5 h-5 text-yellow-500 mb-3" />
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3 text-center">PRO Strategy Remix</p>
                  <Button size="sm" className="bg-white text-black hover:bg-slate-200 rounded-full font-black text-[9px] h-7 px-5">Upgrade</Button>
                </div>
              )}
              <div className="p-5 space-y-5 text-left text-left">
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center justify-between text-left">
                    <div className="flex items-center gap-2 text-left">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 text-left" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest text-left text-left">AI Strategy Remix</span>
                    </div>
                    {remixHistory.length > 1 && (
                      <button onClick={undoRemix} className="text-[8px] font-black text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors uppercase text-left">
                        <RotateCcw className="w-2.5 h-2.5" /> Undo
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-tight text-left">
                    Tailor this strategy to your specific needs or tone using our AI engine.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-left">
                  {REMIX_OPTIONS.map(o => (
                    <button 
                      key={o.label} 
                      onClick={() => handleRemix(o.label)} 
                      disabled={isRemixing || !isPro}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-left disabled:opacity-50 text-left"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-sm">{o.icon}</span>
                        <span className="text-[9px] font-bold text-slate-400 group-hover:text-white uppercase tracking-tight text-left">{o.label}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-purple-400 text-left" />
                    </button>
                  ))}
                </div>
                <div className="relative pt-1 text-left text-left">
                  <input 
                    type="text" 
                    placeholder="Custom instruction..." 
                    disabled={!isPro} 
                    value={customInstruction} 
                    onChange={e => setCustomInstruction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRemix(customInstruction)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all text-left text-left" 
                  />
                  <button 
                    onClick={() => handleRemix(customInstruction)} 
                    disabled={!isPro || !customInstruction} 
                    className="absolute right-2 top-[calc(50%+2px)] -translate-y-1/2 w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all disabled:opacity-0 text-left"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>
            <section className="p-6 rounded-[1.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-3 text-left text-left text-left">
              <div className="flex items-center gap-2 text-left text-left">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 text-left" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left text-left text-left">Strategy Analysis</span>
              </div>
              <p className="text-[11px] text-emerald-100/60 leading-relaxed italic font-light text-left text-left text-left">
                &ldquo;{currentIdea.whyItWorks}&rdquo;
              </p>
            </section>
          </div>
        </aside>
      </div>

      <div className="md:hidden fixed bottom-16 left-1/2 -translate-x-1/2 flex bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full p-1 z-[10030] shadow-2xl text-left">
        <button 
          onClick={() => setActiveTab('content')}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
            activeTab === 'content' ? "bg-white text-black" : "text-slate-500"
          )}
        >
          <LayoutGrid className="w-3 h-3" /> Brief
        </button>
        <button 
          onClick={() => setActiveTab('tools')}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
            activeTab === 'tools' ? "bg-purple-600 text-white" : "text-slate-500"
          )}
        >
          <Settings2 className="w-3 h-3" /> Remix
        </button>
      </div>

      <footer className="h-10 bg-black border-t border-white/5 flex items-center justify-center px-4 md:px-6 relative z-[10020] shrink-0 text-left text-left text-left">
        <div className="absolute left-4 md:left-6 hidden sm:flex items-center gap-1.5 text-left text-left">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse text-left" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-left text-left">Live Brief</span>
        </div>
        <div className="flex items-center gap-3 text-left text-left">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest hidden xs:inline text-left text-left">Distribution:</span>
          <div className="flex items-center gap-2 text-left text-left">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 h-[26px] text-left text-left">
              <span className="text-[8px] font-bold text-white uppercase text-left text-left">Notion</span>
              <CopyBtn field="notion" text={formatForNotion()} label="Sync" icon={Share2} className="h-5 px-1.5 text-[8px] text-left text-left" />
            </div>
            <button 
              onClick={downloadMarkdown}
              className="flex items-center gap-2 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all h-[26px] text-left text-left"
            >
              <Download className="w-2.5 h-2.5 text-left" />
              <span className="text-[8px] font-bold uppercase text-left text-left">Brief.md</span>
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2 px-3 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all h-[26px] text-left text-left"
            >
              {isSharing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Share2 className="w-2.5 h-2.5" />}
              <span className="text-[8px] font-bold uppercase text-left text-left">{copied === 'share' ? 'Copied!' : 'Share Page'}</span>
            </button>
          </div>
        </div>
        <div className="absolute right-4 md:right-6 hidden lg:flex items-center gap-1.5 text-left text-left">
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em] text-left text-left text-left">RepBrief Studio v1.0</span>
        </div>
      </footer>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="group relative h-full text-left">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-[22px] blur opacity-0 group-hover:opacity-100 transition duration-500 text-left text-left" />
        {variant === 'compact' ? (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl cursor-pointer p-4 h-full flex flex-col hover:bg-white/[0.05] transition-all text-left text-left" onClick={() => setIsExpanded(true)}>
            <div className="flex gap-4 h-full text-left text-left text-left"><div className="p-2 rounded-xl bg-white/5 shrink-0 text-white text-left">{getIcon(currentIdea.format)}</div><div className="flex-1 flex flex-col h-full text-left text-white text-left"><div className="flex justify-between text-left text-white text-left"><Badge variant="outline" className="text-blue-400 text-[9px] border-blue-500/30 font-bold uppercase text-left text-left">{currentIdea.format}</Badge>{isSaved && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 text-left" />}</div><h3 className="text-sm font-bold text-slate-200 mt-1 flex-1 leading-snug text-left text-left text-left">{currentIdea.title}</h3></div></div>
          </Card>
        ) : (
          <Card className="relative bg-white/[0.03] border-white/10 rounded-2xl shadow-2xl flex flex-col h-full cursor-pointer hover:bg-white/[0.05] transition-all text-left text-left" onClick={() => setIsExpanded(true)}>
            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between shrink-0 text-left text-left"><div className="flex items-center gap-3 text-white text-left text-left">{getIcon(currentIdea.format)}<Badge variant="outline" className="text-blue-400 text-[10px] border-blue-500/30 font-bold uppercase text-left text-left">{currentIdea.format}</Badge></div><div onClick={e => e.stopPropagation()} className="text-left text-left">{!hideSaveButton ? <SaveIdeaButton title={currentIdea.title} ideaData={currentIdea} initialSaved={isSaved} /> : dbId ? <DeleteIdeaButton id={dbId} /> : null}</div></CardHeader>
            <CardContent className="px-6 pb-6 flex-1 flex flex-col overflow-hidden text-left text-left"><h3 className="text-lg font-bold text-slate-200 mb-4 leading-tight text-left text-left text-left">{currentIdea.title}</h3><div className="space-y-4 flex-1 overflow-hidden text-left text-left text-left text-left"><div className="pl-4 border-l-2 border-blue-500/30 text-xs italic text-slate-200 line-clamp-3 leading-relaxed text-left text-left">&ldquo;{currentIdea.hook}&rdquo;</div><p className="text-xs text-slate-400 line-clamp-4 leading-relaxed font-light text-left text-left">{currentIdea.description}</p></div><div className="mt-auto pt-5 border-t border-white/5 flex flex-col gap-2 shrink-0 text-left text-left text-left"><div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2 text-left text-left"><Star className="w-3 h-3 fill-emerald-400/20 text-left text-left" /> Why it works</div><p className="text-[11px] text-slate-500 italic line-clamp-2 leading-snug text-left text-left">{currentIdea.whyItWorks}</p></div></CardContent>
          </Card>
        )}
      </div>
      {StrategyDetailView}
      {showTeleprompter && <Teleprompter title={currentIdea.title} script={currentIdea.scriptDraft || currentIdea.description} onClose={() => setShowTeleprompter(false)} />}
      {showPerformanceModal && dbId && <PerformanceModal ideaId={dbId} title={currentIdea.title} isOpen={showPerformanceModal} onClose={() => setShowPerformanceModal(false)} />}
    </>
  )
}
