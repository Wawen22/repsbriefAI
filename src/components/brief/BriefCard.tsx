// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { Video, Layers, Hash, Mail, Lightbulb, Copy, Check, TrendingUp, Star } from "lucide-react"
import { SaveIdeaButton } from "@/components/ui/SaveIdeaButton"
import { DeleteIdeaButton } from "@/components/ui/DeleteIdeaButton"
import { Button } from "@/components/ui/button"
import { useState, useCallback } from "react"

interface BriefCardProps {
  idea: IdeaObject
  isSaved?: boolean
  hideSaveButton?: boolean
  dbId?: string
}

type CopyField = 'title' | 'hook' | 'all' | null

export function BriefCard({ idea, isSaved = false, hideSaveButton = false, dbId }: BriefCardProps) {
  const [copied, setCopied] = useState<CopyField>(null)

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

  const formatFullIdea = () => {
    return `**${idea.title}**\n\nHook: "${idea.hook}"\n\nConcept: ${idea.description}\n\nFormat: ${idea.format}\n\nWhy it works: ${idea.whyItWorks}`
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
      className="h-7 px-2 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all gap-1.5 font-medium rounded-lg"
    >
      {copied === field ? (
        <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 font-bold uppercase tracking-wider">Copied</span></>
      ) : (
        <><Copy className="w-3 h-3 text-slate-400" />{label}</>
      )}
    </Button>
  )

  return (
    <div className="group relative">
      {/* Outer Glow on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 rounded-[22px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <Card className="relative bg-white/[0.03] border-white/10 group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
        <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                {getIcon(idea.format)}
             </div>
             <div className="flex flex-col">
               <Badge variant="outline" className="border-none bg-blue-500/5 text-blue-400 text-[10px] px-1.5 py-0 font-bold uppercase tracking-widest leading-normal h-fit w-fit">
                 {idea.format}
               </Badge>
             </div>
          </div>
          <div className="flex items-center gap-1">
            <CopyBtn field="all" text={formatFullIdea()} label="Brief" />
            {!hideSaveButton ? (
              <SaveIdeaButton title={idea.title} ideaData={idea} initialSaved={isSaved} />
            ) : dbId ? (
              <DeleteIdeaButton id={dbId} />
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6 flex-1 flex flex-col">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors leading-tight">
              {idea.title}
            </h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="pl-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">The Hook</span>
                  <CopyBtn field="hook" text={idea.hook} label="Hook" />
                </div>
                <p className="text-sm italic text-slate-200 leading-relaxed font-light">
                  &ldquo;{idea.hook}&rdquo;
                </p>
              </div>
            </div>

            <div className="pl-4 space-y-2">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Concept</span>
               <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                 {idea.description}
               </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 w-fit">
              <Star className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-400/20" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Why it works</span>
            </div>
            <p className="text-[12px] text-slate-500 italic leading-relaxed pl-1 group-hover:text-slate-400 transition-colors">
              {idea.whyItWorks}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
