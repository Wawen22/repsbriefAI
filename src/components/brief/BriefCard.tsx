// src/components/brief/BriefCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdeaObject } from "@/types/niche"
import { Video, Layers, Hash, Mail } from "lucide-react"

interface BriefCardProps {
  idea: IdeaObject
}

export function BriefCard({ idea }: BriefCardProps) {
  const getIcon = (format: string) => {
    switch (format) {
      case 'Reel': return <Video className="w-4 h-4" />
      case 'Carousel': return <Layers className="w-4 h-4" />
      case 'Thread': return <Hash className="w-4 h-4" />
      case 'Newsletter': return <Mail className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all group overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <Badge variant="outline" className="border-blue-500/30 text-blue-400 gap-1.5 font-medium">
          {getIcon(idea.format)}
          {idea.format}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardTitle className="text-lg leading-snug group-hover:text-blue-400 transition-colors">
          {idea.title}
        </CardTitle>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">The Hook</p>
          <p className="text-sm font-medium italic text-blue-100/90 leading-relaxed border-l-2 border-blue-500/30 pl-3">
            "{idea.hook}"
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
