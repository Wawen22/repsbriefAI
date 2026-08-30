# Revenue Relaunch Design

## Objective

Turn the existing Fitness & Nutrition MVP into a truthful, reliable and measurable paid beta. The first commercial promise is: trend-backed content strategies for fitness coaches and small fitness agencies; it is not a generic multi-niche platform.

## Decisions

- Keep Pro at $19/month as a founder price. Do not market Team until a real agency has validated the workflow.
- Starter remains one manual brief per calendar week and exposes five of twenty ideas. It must never promise automatic email delivery.
- A brief may claim trend-backed sources only when the current cache includes usable, fresh source data. The generator must reject an empty/degraded source set instead of silently falling back to model knowledge.
- The public share canonical URL is `/s/[id]`; `/share/[id]` redirects to it.
- Landing and email copy use only verified counts and active capabilities. No fabricated social proof or counts.
- Capture conversion events in the already-installed Vercel Analytics client. Dashboard enablement and Resend domain verification are external/manual release gates.

## Release scope

1. Create a source-quality boundary used by on-demand generation and the weekly cron: normalize trends, require fresh data from at least one source, and provide a user-safe degradation error.
2. Remove currently unreliable sources from the active generation path until they have official API credentials or a supported transport. Retain YouTube and configured RSS as the initial beta evidence sources.
3. Align pricing, onboarding and email capture copy with the actual Starter entitlement; make waitlist submission robust and non-deceptive.
4. Instrument landing and conversion actions, fix the stale sharing route, and add focused tests for the revenue-critical behavior.
5. Add a migration-only hardening package for database security and indexes after reconciling remote migration history; it is not applied automatically because production history is drifted.

## Non-goals

- New OAuth providers, new niches, publishing connectors, image generation changes, or a price increase.
- Claiming scraping success when an upstream provider blocks a request.
- Applying any Supabase migration until the recorded migration baseline is reconciled.

## Acceptance criteria

- No visitor sees invented volume or unsupported feature claims.
- An empty/invalid trend cache produces a clear retry message and no brief record.
- Starter and Pro entitlements are identical across landing, generation API and dashboard CTA.
- Event calls do not affect the UI when analytics is disabled.
- Focused tests cover the new quality and copy/route behavior; typecheck, lint, unit tests and production build complete.
