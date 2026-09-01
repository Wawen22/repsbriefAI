# Studio Command Center — Design Specification

## Product intent

RepsBrief should feel like a creator's operating system, not a dashboard of equivalent cards. The home workspace must reduce “what do I do now?” to one obvious decision, then reveal the complete path from fresh signal to a scheduled piece of content.

## UX model

The primary journey is:

`Signals → Strategic brief → Select ideas → Schedule → Publish / export`

The dashboard is the first stage of this journey. It has a single dominant action and never makes analytics, referral, navigation, or configuration compete with it.

## Layout

### Command bar

A compact, sticky-feeling utility strip contains the active niche, source health, brief period and one subdued manual “capture idea” action. It provides context, not a second headline.

### Decision canvas

The top panel is the visual anchor. It changes according to data:

- No brief: explain that the next decision is generating one; show the single `Generate strategic brief` CTA and concise source/progress expectations.
- Brief available: show “This week’s direction”, the number of available strategies, the recommended next move, and direct actions to review ideas or schedule selected work.

The button that advances the workflow is white. All other actions are quiet outlines/text links.

### Workflow rail

A four-step horizontal rail makes the pipeline explicit: `Signals`, `Brief`, `Ideas`, `Calendar`. Each item has a semantic state: completed (green), current (white), queued (neutral), and no fabricated progress. The current step is determined from data already available to the dashboard: a generated brief and saved ideas. Calendar remains queued until real scheduled-event data is available, avoiding a false claim.

### Evidence and inventory

For a generated brief, a compact two-column region replaces the four equal visual cards:

- `Signal intelligence`: active sources and format mix calculated from actual ideas.
- `This week’s inventory`: idea count, top format, current niche and brief date.
- The existing filter and card grid follow as the working inventory.

The simulated “+14%” market momentum is removed: it cannot be presented as evidence.

## Visual system

- Canvas: existing black technical grid, but its contrast remains behind content.
- Panels: one primary panel with `border-white/[0.12]`, nested panels with `border-white/[0.08]`.
- Radius: `rounded-lg` / `rounded-xl`, never decorative pill cards for content surfaces.
- Type: display title is sans; operational labels and step metadata are mono uppercase.
- Colour: white for primary action/current focus; green only for verified/completed states; blue only as a subtle AI/source accent; amber/rose reserved for warnings/errors.
- Motion: state transitions are short and reduced-motion safe through existing Tailwind utilities; no ornamental looping animation on important actions.

## Components

- `CommandCenterHero`: server-safe presentational shell, receives brief state, plan and date and places the existing `GenerateNowButton` or contextual links.
- `WorkflowRail`: deterministic state mapper from `hasBrief` and `savedIdeaCount`; exports a testable pure `getWorkflowSteps`.
- `BriefIntelligence`: derives source names and format counts from actual ideas; replaces simulated momentum cards.
- `DashboardPage`: owns Supabase querying and passes only derived props to visual components.

## Data and behaviour constraints

- No new tables, migrations, API routes, providers or dependencies.
- Preserve checkout synchronization, plan gating, brief generation, save/remix, tabs, filtering and onboarding.
- Continue deriving hashes and saved state exactly as today.
- Do not query the calendar until a verified data model is identified; calendar rail state is intentionally queued.
- No pricing-copy changes.

## Accessibility and responsiveness

- Workflow is an ordered list with text labels, never colour-only state.
- Desktop uses 12-column proportion; narrow screens stack decision canvas, workflow rail, then inventory.
- CTA and utility controls retain focus-visible rings and touch-friendly heights.
- Every decorative glow/grid remains pointer-events none.

## Acceptance criteria

1. The dashboard gives one explicit next action in both no-brief and has-brief states.
2. No simulated market metric remains in the dashboard.
3. Workflow states are derived only from known data and are test-covered.
4. Current ideas, filters, generation controls, upgrade gating and checkout behavior remain unchanged.
5. Typecheck, lint, unit tests and a placeholder-backed production build pass.

