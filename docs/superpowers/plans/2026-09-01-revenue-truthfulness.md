# Revenue Truthfulness Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align revenue-facing product behavior and copy with active trend sources and actual delivery capabilities.

**Architecture:** A small product-truth module derives approved labels from the active source configuration. A mail configuration helper enforces the sender contract. Existing route/action boundaries are reused: referral becomes a Route Handler and all share writers use one team-aware action.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase, Resend.

**Spec:** `docs/superpowers/specs/2026-09-01-revenue-truthfulness-design.md`

## Global Constraints

- Do not apply migrations or alter the data model.
- Use only `youtube` and `rss` as user-visible active sources.
- Do not claim Reddit, Google Trends, PubMed, transcripts, real-time scraping, or unavailable automations.
- Require `RESEND_FROM_EMAIL` in production.
- Keep `/s/[id]` canonical and preserve AI calls through `getAIProvider()`.

---

### Task 1: Product-truth vocabulary and public copy

**Files:**
- Create: `src/lib/product-truth.ts`, `tests/unit/product-truth.test.ts`
- Modify: landing, dashboard loading, pricing, FAQ, sample brief, shared-page CTA components

- [ ] Write tests asserting `activeSourceLabels` returns YouTube/RSS only and sample briefs use only enabled source ids.
- [ ] Run `npm test -- product-truth` and verify the tests fail because the module is absent.
- [ ] Implement `activeSourceLabels`, `activeSourceLabel`, and `isActiveSource` from `ENABLED_TREND_SOURCES`; replace revenue copy with approved wording: fresh YouTube and RSS signals, manually generated briefs, and delivered features only.
- [ ] Run the focused tests and `rg -n -i 'reddit|google trends|pubmed|transcript|real-time|automated daily'` across revenue-facing files to verify removed claims.

### Task 2: Central mail sender and truthful templates

**Files:**
- Create: `tests/unit/mail.test.ts`
- Modify: `src/lib/mail.ts`, `src/app/api/email/sendBrief.ts`, `src/app/actions/team.ts`

- [ ] Write failing tests for production sender absence, non-production sandbox sender, and truthful brief-ready subject/body.
- [ ] Implement `getEmailSender()` and make all mail senders return failure without dispatching when production configuration is absent; migrate all direct Resend calls.
- [ ] Run focused mail tests.

### Task 3: Engagement eligibility

**Files:**
- Create: `src/lib/engagement.ts`, `tests/unit/engagement.test.ts`
- Modify: `src/app/api/cron/engagement-emails/route.ts`

- [ ] Write a failing test for `briefCreatedToday` query bounds and Monday-only Starter eligibility.
- [ ] Extract the date bounds/select predicate helper and query Starter recipients through briefs created today, joining their Starter profile.
- [ ] Run engagement tests to prove a historical Starter brief cannot qualify.

### Task 4: Referral and canonical public shares

**Files:**
- Create: `src/app/r/[code]/route.ts`, `tests/unit/referral-route.test.ts`
- Modify: remove `src/app/r/[code]/page.tsx`; `src/app/actions/share.ts`, `src/app/actions/ideas.ts`; share callers; `src/app/share/[id]/page.tsx`; share tests

- [ ] Write failing tests for referral 404/redirect/cookie and unified share result type.
- [ ] Implement the handler with `NextResponse.redirect`, set `repsbrief_ref`, and migrate every caller to one team-aware `createShareAction` with `{ id }` response.
- [ ] Keep `/share/[id]` as a redirect to `/s/[id]`; run focused tests.

### Task 5: Project state and verification

**Files:**
- Create if absent: `INIT_PROMPT.md`
- Modify: `PROJECT_CONTEXT.md`

- [ ] Update checklists with completed hardening and known environment constraint.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`; record any environment-only blockers.

