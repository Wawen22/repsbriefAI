# RepsBrief go-live checklist

## Scope chosen for the first paid launch

- Target: English-speaking Fitness & Nutrition creators.
- Offer: Starter (one manual brief each week, five visible ideas) and Pro ($19/month after a seven-day trial).
- Do not sell Team until its collaboration and integration workflow has been manually validated with pilot users.
- A generation is valid only when it is based on fresh, usable active sources; a source outage must produce a retryable error, never a fabricated brief.

## Required operator actions before deploying this branch

1. In Resend, verify a RepsBrief sending domain and set `RESEND_FROM_EMAIL` in Vercel to a matching address, for Preview and Production. The sender must not be `onboarding@resend.dev`.
2. In Vercel, enable Web Analytics and Speed Insights for `repsbrief`; the application components are already mounted.
3. Reconcile Supabase migration history before applying any local migration. The remote history has only five entries while this repository contains later migrations. Use `supabase migration list`, compare against the schema, then use `supabase migration repair` only for migrations confirmed as already present.
4. The production hardening migration `20260830095438_harden_revenue_launch_access.sql` is already applied. Verify that `/s/<existing-share-id>` still renders and that anonymous REST reads of `shared_strategies` are denied.
5. In Stripe live mode, send a test Checkout event and a duplicate delivery for the same subscription update. Confirm the profile plan changes once and the referral customer balance has exactly one $19 credit.
6. Run a real signup, generate a Starter brief, confirm the fifth idea is the last visible one, then upgrade to Pro and cancel through the customer portal.

## Launch checks

- Confirm `/api/scraper` returns data from the active YouTube/RSS source set; temporarily force an empty response and confirm generation returns a retryable `503`.
- Confirm `/api/cron/weeklyBrief` records a failure rather than creating a brief when every source is stale or unavailable.
- Confirm the landing page says only what the product currently delivers; no fake counts, unsupported integrations, or automatic Starter email promise.
- Watch Vercel logs for 24 hours after release. Existing external-source failures (Reddit 403, Google Trends parsing, RSS 429/404) are expected to remain non-blocking because those sources are not active for the initial beta.

## First revenue loop

1. Recruit 10 fitness creators manually with a clear promise: one source-backed weekly brief free, daily briefs with Pro.
2. During the seven-day trial, ask each creator to publish one idea and share the canonical `/s/` link.
3. Review activation weekly: signup → first valid brief → fifth idea viewed → trial started → paid conversion.
4. Keep Pro at $19/month for the first cohort; raise or test annual pricing only after five active paid users show repeat weekly use.
