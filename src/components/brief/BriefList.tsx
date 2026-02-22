// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"

interface BriefListProps {
  ideas: IdeaObject[]
}

export function BriefList({ ideas }: BriefListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea, idx) => (
        <BriefCard key={idx} idea={idea} />
      ))}
    </div>
  )
}
