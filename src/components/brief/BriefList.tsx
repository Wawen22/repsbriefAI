// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"

interface BriefListProps {
  ideas: IdeaObject[]
  savedHashes?: Set<string>
}

export function BriefList({ ideas, savedHashes }: BriefListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea, idx) => {
        const hash = Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
        return <BriefCard key={idx} idea={idea} isSaved={savedHashes?.has(hash)} />
      })}
    </div>
  )
}
