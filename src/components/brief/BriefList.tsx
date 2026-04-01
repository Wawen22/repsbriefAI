// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"
import { LockedIdeasGate } from "./LockedIdeasGate"

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

const FREE_IDEAS_LIMIT = 5

export function BriefList({ ideas, savedHashes, savedIdsMap, plan }: BriefListProps) {
  const isStarter = !plan || plan === 'starter'
  const visibleIdeas = isStarter ? ideas.slice(0, FREE_IDEAS_LIMIT) : ideas
  const lockedCount = isStarter ? Math.max(0, ideas.length - FREE_IDEAS_LIMIT) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleIdeas.map((idea, idx) => {
        const ideaWithMeta = idea as IdeaWithMeta
        const hash = ideaWithMeta.idea_hash || Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
        const isSaved = savedHashes?.has(hash)
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

      {lockedCount > 0 && <LockedIdeasGate lockedCount={lockedCount} />}
    </div>
  )
}
