# Onboarding Tour — Design Spec
Date: 2026-03-31
Status: Approved

## Problem

The existing `OnboardingModal` shows 3 informational slides but doesn't guide users to actually DO anything. Users close it without understanding how to get value, resulting in low activation and poor free→paid conversion.

## Goal

Guide every new user through the 3 actions that produce their first "aha moment":
1. Train their AI Brand Voice
2. Generate their first brief
3. Move an idea to the Kanban board

A user who completes all 3 steps understands the product and is ~3x more likely to convert to paid.

## Scope

- Upgrade `OnboardingModal` to interactive 3-step wizard
- Add `OnboardingChecklist` floating widget (persistent until all steps complete)
- No DB migration required — completion state derived from existing data
- No new server actions — reuse `completeOnboardingAction` + existing generate flow

---

## Architecture

### 1. `OnboardingModal` (upgrade — `src/components/dashboard/OnboardingModal.tsx`)

**Trigger:** renders when `profile.has_onboarded === false` (already wired in `dashboard/page.tsx`)

**Steps:**

| # | Title | Description | Primary CTA | CTA Action |
|---|---|---|---|---|
| 1 | Train Your AI Voice | "The AI writes in YOUR voice. Upload a writing sample so every strategy sounds like you, not a robot." | "Set Up My Voice" | `router.push('/dashboard/settings?tab=voice')` + `completeOnboardingAction()` |
| 2 | Generate Your First Brief | "20 content strategies built from live trends — Reddit, YouTube, Google Trends. Hit generate and watch it work." | "Generate Now" | call `/api/generator/generate-now` via fetch, then close modal |
| 3 | Move an Idea to Production | "The Kanban board is your production pipeline. Drag ideas from Backlog → In Progress → Done." | "Go to My Ideas" | `router.push('/dashboard/ideas')` + `completeOnboardingAction()` |

**Navigation:**
- "Next →" button advances steps without navigating
- "Skip" on any step calls `completeOnboardingAction()` and closes
- Primary CTA on each step calls `completeOnboardingAction()` then navigates

**Visual:** keep existing design system (deep black, glassmorphism, blue accents). Step indicator pills at bottom. Active step highlighted, others dimmed.

---

### 2. `OnboardingChecklist` (new — `src/components/dashboard/OnboardingChecklist.tsx`)

**Trigger:** renders in `dashboard/page.tsx` when `profile.has_onboarded === true` AND not all 3 steps are complete. Disappears permanently once all 3 are done (stored in `localStorage` to avoid re-render flicker — no DB needed).

**Position:** fixed bottom-right, `z-50`, collapsible (click header to collapse/expand).

**Completion detection (server-side, passed as props):**
- `voiceConfigured`: `team.brand_voice !== null` — query `teams` table for current team
- `briefGenerated`: `briefs` count > 0 for user
- `ideaSaved`: `idea_history` count > 0 with `saved = true` for team

**Props interface:**
```ts
interface OnboardingChecklistProps {
  voiceConfigured: boolean
  briefGenerated: boolean
  ideaSaved: boolean
}
```

**Each item:**
- ✅ Complete: green check, strikethrough text
- ⬜ Incomplete: with "→ Do it" link to relevant page

**Auto-dismiss:** if all 3 props are `true`, component renders `null`.

---

### 3. `dashboard/page.tsx` (small update)

Add 3 new queries (parallel with existing):
```ts
// Check onboarding step completion
supabase.from('teams').select('brand_voice').eq('id', current_team_id).single()
supabase.from('briefs').select('id').eq('user_id', user.id).limit(1).maybeSingle()
supabase.from('idea_history').select('id').eq('team_id', current_team_id).eq('saved', true).limit(1).maybeSingle()
```

Render `OnboardingChecklist` only when `has_onboarded === true` (modal already dismissed) and at least one step is incomplete.

---

## Error Handling

- If generate-now fails inside modal: show inline error, don't close modal
- If `completeOnboardingAction` fails: log silently, still navigate (UX > consistency)
- If checklist queries fail: default all to `false` (show checklist rather than hide it)

## Testing Checklist

1. **New user flow:** Register new account → dashboard shows modal automatically
2. **Modal navigation:** Click "Next" advances steps; "Skip" closes + marks onboarded
3. **CTA Step 1:** Click "Set Up My Voice" → navigates to settings voice tab + modal closes
4. **CTA Step 2:** Click "Generate Now" → triggers generation, closes modal on success
5. **CTA Step 3:** Click "Go to My Ideas" → navigates to /dashboard/ideas + modal closes
6. **Checklist appears:** After modal dismissed, checklist widget visible bottom-right
7. **Checklist step 1 complete:** Set brand voice → refresh dashboard → voice item shows ✅
8. **Checklist step 2 complete:** Generate brief → refresh → brief item shows ✅
9. **Checklist step 3 complete:** Save/move idea → refresh → idea item shows ✅
10. **Checklist auto-dismiss:** All 3 complete → checklist disappears
11. **Existing user:** `has_onboarded = true` with all steps done → neither modal nor checklist shows
12. **Collapse:** Click checklist header → collapses to icon; click again → expands
