# Revenue Relaunch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or Orca orchestration task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a truthful, reliable, measurable paid-beta release without expanding the product surface.

**Architecture:** A small trend-quality module becomes the single gate between cache/scrapers and generation. Marketing and email copy are aligned to the same entitlement contract. Events are client-side, optional telemetry only.

**Tech Stack:** Next.js 16, TypeScript, Vitest, Supabase, Vercel Analytics.

**Spec:** `docs/superpowers/specs/2026-08-30-revenue-relaunch-design.md`

## Global Constraints

- All AI calls remain behind `getAIProvider()`.
- Niche-specific source configuration remains in `src/config/niches.ts`.
- TypeScript only; no push and no production database writes in this plan.
- Do not market unverified social proof, automatic free email briefs, or inactive integrations.

---

### Task 1: Trend quality gate

**Files:** Create `src/lib/trends/quality.ts`, `tests/unit/trend-quality.test.ts`; modify `src/app/api/generator/generate-now/route.ts`, `src/app/api/cron/weeklyBrief/route.ts`, `src/app/api/scraper/index.ts`, `src/config/niches.ts`.

- [x] Write failing tests for accepting fresh non-empty RSS/YouTube items and rejecting empty, stale, malformed or all-failed trend input.
- [x] Implement a pure `getUsableTrends` function returning either normalized trends and source names or a reason code.
- [x] Gate generation before the AI call; return a retryable 503 for on-demand requests and record per-user cron failures rather than creating fabricated briefs.
- [x] Temporarily disable unauthenticated Reddit and Google Trends scrapers in the source orchestration; keep their implementation intact for future credentialed recovery.
- [x] Run the focused tests, full unit tests, typecheck and lint.

### Task 2: Truthful conversion surface

**Files:** Modify `src/components/landing/HeroSection.tsx`, `src/components/landing/PricingNexus.tsx`, `src/app/api/email/waitlist/route.ts`, `src/app/share/[id]/page.tsx`; create/modify focused tests.

- [ ] Add route-level dependency-mocked tests for waitlist persistence (manual release check retained because Supabase/Resend are external services).
- [x] Remove the fabricated fallback brief count and unverified “loved by” claim; use accurate, capability-focused landing language.
- [x] Make Starter wording exactly “one manual brief/week, five visible ideas”; reserve scheduled delivery for paid plans.
- [x] Change email capture confirmation/copy to a signup invitation, validate an actual email shape, and preserve the lead when email delivery is unavailable.
- [x] Redirect legacy `/share/[id]` to canonical `/s/[id]`.
- [x] Run unit tests, typecheck and lint.

### Task 3: Measurement and release proof

**Files:** Create `src/lib/analytics/events.ts`; modify landing capture, signup/upgrade entry components and `src/components/brief/BriefCard.tsx`; create `tests/unit/analytics-events.test.ts` and improve `tests/e2e/routes-smoke.test.ts`.

- [x] Write a failing test for the event-name contract.
- [x] Implement a minimal typed analytics wrapper over `@vercel/analytics` and emit the three first-funnel events: `waitlist_submitted`, `signup_cta_clicked`, `strategy_shared`.
- [ ] Add dependency-mocked import-level coverage for external-service critical routes (kept as a post-beta hardening task).
- [x] Run unit tests, typecheck, lint, production build and document exact manual release checks.

### Task 4: Production hardening handoff

**Files:** Create `supabase/migrations/20260830000000_revenue_relaunch_hardening.sql`, `docs/release/2026-08-30-paid-beta-checklist.md`; modify `PROJECT_CONTEXT.md`.

- [x] Create a non-applied migration that removes anonymous public-share reads and revokes authenticated queue-claim execution.
- [x] Write a release checklist covering migration-baseline reconciliation, Resend verification, Vercel Analytics enablement, Stripe test/live checkout, source health and rollback.
- [x] Update development/task tracking with audit facts, completed tasks and manual gates.
- [x] Run SQL static review, git diff review, full verification. Do not apply the migration remotely.
