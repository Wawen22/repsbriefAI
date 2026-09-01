import { getSavedIdeaCountForCurrentBrief, getWorkflowSteps } from '@/lib/dashboard/workflow'
import { getBriefIntelligence } from '@/lib/dashboard/brief-intelligence'

describe('dashboard workflow', () => {
  it('focuses signals and queues the brief when no brief exists', () => {
    expect(getWorkflowSteps({ hasBrief: false, savedIdeaCount: 0 })).toEqual([
      { id: 'signals', label: 'Signals', state: 'current' },
      { id: 'brief', label: 'Brief', state: 'queued' },
      { id: 'ideas', label: 'Ideas', state: 'queued' },
      { id: 'calendar', label: 'Calendar', state: 'queued' },
    ])
  })

  it('focuses idea selection after a brief is generated', () => {
    expect(getWorkflowSteps({ hasBrief: true, savedIdeaCount: 0 }).find((step) => step.id === 'ideas')?.state).toBe('current')
  })

  it('marks idea selection complete when an idea is saved', () => {
    expect(getWorkflowSteps({ hasBrief: true, savedIdeaCount: 1 }).find((step) => step.id === 'ideas')?.state).toBe('complete')
  })

  it('counts only saved ideas that belong to the current brief', () => {
    expect(getSavedIdeaCountForCurrentBrief(
      new Set(['current-one', 'current-two']),
      new Set(['older-brief', 'manual-idea', 'current-two'])
    )).toBe(1)
  })

  it('derives source labels and the leading format from the brief ideas', () => {
    expect(getBriefIntelligence([
      { title: 'One', hook: 'Hook', description: 'Description', format: 'Reel', whyItWorks: 'Why', sources: ['youtube', 'rss'] },
      { title: 'Two', hook: 'Hook', description: 'Description', format: 'Reel', whyItWorks: 'Why', sources: ['youtube'] },
      { title: 'Three', hook: 'Hook', description: 'Description', format: 'Carousel', whyItWorks: 'Why', sources: ['reddit'] },
    ])).toEqual({
      sourceLabels: ['YouTube', 'RSS', 'Reddit'],
      topFormat: 'Reel',
      formatCounts: { Reel: 2, Carousel: 1 },
    })
  })
})
