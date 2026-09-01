export type WorkflowState = 'complete' | 'current' | 'queued'

export interface WorkflowStep {
  id: 'signals' | 'brief' | 'ideas' | 'calendar'
  label: string
  state: WorkflowState
}

interface WorkflowInput {
  hasBrief: boolean
  savedIdeaCount: number
}

export function getWorkflowSteps({ hasBrief, savedIdeaCount }: WorkflowInput): WorkflowStep[] {
  const hasSavedIdeas = savedIdeaCount > 0

  return [
    { id: 'signals', label: 'Signals', state: hasBrief ? 'complete' : 'current' },
    { id: 'brief', label: 'Brief', state: hasBrief ? 'complete' : 'queued' },
    { id: 'ideas', label: 'Ideas', state: hasBrief ? (hasSavedIdeas ? 'complete' : 'current') : 'queued' },
    { id: 'calendar', label: 'Calendar', state: 'queued' },
  ]
}
