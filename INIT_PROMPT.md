# RepsBrief — INIT_PROMPT

Last update: 2026-03-07

## Development Progress

- [x] **Phase 1: Foundation** (Completed)
- [x] **Phase 2: Scrapers & Generator** (Completed)
- [x] **Phase 3: Automation & Delivery** (Completed)
- [x] **Phase 4: UI/UX** (Completed)
- [ ] **Phase 5: Integrations & Ecosystem** (In progress)
  - [x] Notion Integration (OAuth + strategy export)
  - [x] Google Calendar (OAuth + sync + bulk sync)
  - [x] Webhooks/Zapier engine (HMAC signed)
  - [x] Integration settings UX stabilization
  - [x] App health baseline (build/lint/typecheck)
  - [x] Build stabilization (TypeScript/build blockers fixed)
  - [x] Automation Logs UI
  - [x] Integration logs schema alignment
  - [x] Lint stabilization wave 1 (blocking errors resolved)
  - [x] Lint warning cleanup wave 2 (`0 warnings` on `npm run lint`)
  - [x] OAuth-first blueprint for future integrations (Discord included)
  - [x] Next.js runtime migration `middleware -> proxy`
  - [x] Slack notifications channel + Slack OAuth
  - [x] Slack OAuth security hardening (`state` nonce + start route)
  - [x] Integrations/Webhooks hardening (admin-only RLS + action guards)
  - [ ] Discord notification channel (OAuth-first)

## Task Status Tracking

- [x] **Current Task (completed):** OAuth-first blueprint + `middleware -> proxy` migration (2026-03-07)
- [ ] **Next Task:** Discord OAuth-first implementation (start/callback/actions + settings UX + test send)

## Validation Snapshot

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes with `0 errors`, `0 warnings`.

## Notes

- Architectural guardrails are non-negotiable:
  - Use `getAIProvider()` for all AI calls.
  - Keep provider SDK usage isolated to `src/lib/ai/providers/*`.
  - Keep niche-specific data centralized in `src/config/niches.ts`.
  - Keep development TypeScript-first.
  - Keep team-first data model and RLS discipline.
