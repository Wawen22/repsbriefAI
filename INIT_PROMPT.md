# RepsBrief — INIT_PROMPT

Last update: 2026-03-09

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
  - [x] Discord notification channel (OAuth-first MVP)
  - [x] Hardening wave P0 (cron paid-plan filter + webhooks/logs runtime/RLS alignment)
  - [x] OAuth hardening wave Notion/Google (`/start` routes + nonce state + RBAC callback)
  - [x] `supabaseAdmin` fail-fast hardening su path admin/cron (production)
  - [x] P2 baseline test/CI (`vitest` + scripts + workflow GitHub Actions)
  - [x] P2 maintainability refactor `IntegrationsSettings` (split componenti + hook)
  - [x] P3 dependency/security maintenance wave (`npm audit fix` + full regression checks)
  - [x] P4.1 Trello/ClickUp OAuth design spike (`TRELLO_CLICKUP_OAUTH_SPIKE.md`)
  - [x] P4.2 ClickUp OAuth MVP (`start/callback` + connect/disconnect/test + Settings UI)
  - [x] P4.2 ClickUp callback reliability fix (`Oauth token not found` mitigation)
  - [x] P4.2 Trello OAuth MVP (`start/callback` + connect/disconnect/test + Settings UI)
  - [x] Integrations Settings UX refinement (single-open panel + micro-animations + copy unificato in italiano)

## Task Status Tracking

- [x] **Current Task (completed):** Integrations Settings UX refinement (single-open + motion + copy i18n IT) (2026-03-09)
- [ ] **Next Task:** P4.3 Queue/Jobs spike (`retry` + dead-letter + scheduling reliability)

## Validation Snapshot (2026-03-09)

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm run lint` passes with `0 errors`, `0 warnings`.
- [x] `npm run test` passes.
- [x] `npm run test:e2e` passes.
- [x] `npm audit --audit-level=moderate` reports `0 vulnerabilities`.

## Notes

- Architectural guardrails are non-negotiable:
  - Use `getAIProvider()` for all AI calls.
  - Keep provider SDK usage isolated to `src/lib/ai/providers/*`.
  - Keep niche-specific data centralized in `src/config/niches.ts`.
  - Keep development TypeScript-first.
  - Keep team-first data model and RLS discipline.
