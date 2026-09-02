import type { BriefTrendEvidence, PersistedTrendSnapshot } from './repository'

type EvidenceRepository = {
  recordBriefEvidence(evidence: BriefTrendEvidence): Promise<void>
}

export async function persistBriefTrendEvidence({
  repository,
  teamId,
  briefId,
  snapshot,
}: {
  repository: EvidenceRepository
  teamId: string | null | undefined
  briefId: string
  snapshot: PersistedTrendSnapshot
}): Promise<boolean> {
  if (!teamId) return false

  await repository.recordBriefEvidence({
    teamId,
    briefId,
    snapshotId: snapshot.id,
    signalIds: snapshot.signalIds,
  })

  return true
}
