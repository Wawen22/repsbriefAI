# Studio Command Center Implementation Plan

**Goal:** Redesign the authenticated dashboard around a clear creator workflow without changing product behaviour.

**Architecture:** Keep database access in the dashboard page. Add pure workflow derivation and three focused presentational components for decision, pipeline, and evidence.

## Tasks

- [ ] Write failing unit tests for workflow state derivation, then add `src/lib/dashboard/workflow.ts`.
- [ ] Add `CommandCenterHero`, `WorkflowRail` and `BriefIntelligence` components.
- [ ] Replace the current dashboard header/stat grid with the command center composition; retain tabs and BriefList.
- [ ] Remove fabricated momentum UI from StrategicStats or retire it after its data-backed replacement.
- [ ] Validate typecheck, lint, tests, production build with documented placeholders; update project context and merge only after review.

