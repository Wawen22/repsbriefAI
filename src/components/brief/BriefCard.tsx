// src/components/brief/BriefCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { Video, Layers, Hash, Mail, Lightbulb, Copy, Check } from "lucide-react"
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
      // Fallback for older browsers
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
      case 'Reel': return <Video className="w-4 h-4" />
      case 'Carousel': return <Layers className="w-4 h-4" />
      case 'Thread': return <Hash className="w-4 h-4" />
      case 'Newsletter': return <Mail className="w-4 h-4" />
      case 'Idea': return <Lightbulb className="w-4 h-4" />
      default: return null
    }
  }

  const CopyBtn = ({ field, text, label }: { field: CopyField, text: string, label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-6 px-2 text-[11px] text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all gap-1"
    >
      {copied === field ? (
        <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
      ) : (
        <><Copy className="w-3 h-3" />{label}</>
      )}
    </Button>
  )

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all group overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <Badge variant="outline" className="border-blue-500/30 text-blue-400 gap-1.5 font-medium">
          {getIcon(idea.format)}
          {idea.format}
        </Badge>
        <CopyBtn field="all" text={formatFullIdea()} label="Copy All" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg text-slate-100 leading-snug group-hover:text-blue-400 transition-colors flex-1">
            {idea.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <CopyBtn field="title" text={idea.title} label="Title" />
            {!hideSaveButton ? (
              <SaveIdeaButton title={idea.title} ideaData={idea} initialSaved={isSaved} />
            ) : dbId ? (
              <DeleteIdeaButton id={dbId} />
            ) : null}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">The Hook</p>
            <CopyBtn field="hook" text={idea.hook} label="Hook" />
          </div>
          <p className="text-sm font-medium italic text-blue-100/90 leading-relaxed border-l-2 border-blue-500/30 pl-3">
            &ldquo;{idea.hook}&rdquo;
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concept</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            {idea.description}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-start gap-2">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full whitespace-nowrap">Why it works</span>
          <p className="text-[12px] text-emerald-400/80 italic leading-snug">
            {idea.whyItWorks}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
