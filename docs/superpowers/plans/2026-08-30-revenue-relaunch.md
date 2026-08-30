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

- [ ] Write failing tests for accepting fresh non-empty RSS/YouTube items and rejecting empty, stale, malformed or all-failed trend input.
- [ ] Implement a pure `getUsableTrends` function returning either normalized trends and source names or a reason code.
- [ ] Gate generation before the AI call; return a retryable 503 for on-demand requests and record per-user cron failures rather than creating fabricated briefs.
- [ ] Temporarily disable unauthenticated Reddit and Google Trends scrapers in the source orchestration; keep their implementation intact for future credentialed recovery.
- [ ] Run the focused tests, then full unit tests, typecheck and lint.

### Task 2: Truthful conversion surface

**Files:** Modify `src/components/landing/HeroSection.tsx`, `src/components/landing/PricingNexus.tsx`, `src/app/api/email/waitlist/route.ts`, `src/app/share/[id]/page.tsx`; create/modify focused tests.

- [ ] Write failing tests for validated waitlist input and duplicate-safe persistence behavior where route dependencies permit.
- [ ] Remove the fabricated fallback brief count and unverified “loved by” claim; use accurate, capability-focused landing language.
- [ ] Make Starter wording exactly “one manual brief/week, five visible ideas”; reserve scheduled delivery for paid plans.
- [ ] Change email capture confirmation/copy to a signup invitation, validate an actual email shape, and report Supabase/Resend failures safely.
- [ ] Redirect legacy `/share/[id]` to canonical `/s/[id]`.
- [ ] Run focused tests, unit tests, typecheck and lint.

### Task 3: Measurement and release proof

**Files:** Create `src/lib/analytics/events.ts`; modify landing capture, signup/upgrade entry components and `src/components/brief/BriefCard.tsx`; create `tests/unit/analytics-events.test.ts` and improve `tests/e2e/routes-smoke.test.ts`.

- [ ] Write failing tests for the event-name contract and no-op safety without a browser analytics provider.
- [ ] Implement a minimal typed analytics wrapper over `@vercel/analytics` and emit only: `waitlist_submitted`, `signup_cta_clicked`, `checkout_started`, `brief_generation_succeeded`, `strategy_shared`.
- [ ] Add import-level coverage for generation, waitlist and public-share critical routes.
- [ ] Run test/e2e/typecheck/lint/build and document exact manual release checks.

### Task 4: Production hardening handoff

**Files:** Create `supabase/migrations/20260830000000_revenue_relaunch_hardening.sql`, `docs/release/2026-08-30-paid-beta-checklist.md`; modify `PROJECT_CONTEXT.md`.

- [ ] Create a non-applied migration that fixes mutable function search paths, revokes inappropriate public execution, and adds only evidence-backed foreign-key indexes.
- [ ] Write a release checklist covering migration-baseline reconciliation, Resend verification, Vercel Analytics enablement, Stripe test/live checkout, source health, legal copy review and rollback.
- [ ] Update development/task tracking with audit facts, completed tasks and manual gates.
- [ ] Run SQL static review, git diff review, full verification. Do not apply the migration remotely.
