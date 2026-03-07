// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"

interface BriefListProps {
  ideas: IdeaObject[]
  savedHashes?: Set<string>
  savedIdsMap?: Map<string, string>
  plan?: string
}

type IdeaWithMeta = IdeaObject & {
  id?: string
  idea_hash?: string
}

export function BriefList({ ideas, savedHashes, savedIdsMap, plan }: BriefListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea, idx) => {
        const ideaWithMeta = idea as IdeaWithMeta
        const hash = ideaWithMeta.idea_hash || Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
        const isSaved = savedHashes?.has(hash)
        
        // Use the mapped ID from history if available
        const dbId = ideaWithMeta.id || savedIdsMap?.get(hash)
        
        return (
          <BriefCard 
            key={idx} 
            idea={idea} 
            isSaved={isSaved} 
            dbId={dbId} 
            plan={plan} 
          />
        )
      })}
    </div>
  )
}
