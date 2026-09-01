# Revenue truthfulness hardening design

## Goal

Make every revenue-facing promise match the current product: fresh YouTube and RSS signals, user-triggered brief generation, and no unavailable automated or research-source claims.

## Constraints

- Do not change the Supabase data model or apply migrations.
- Keep all changes in TypeScript and retain the existing AI-provider abstraction.
- `ENABLED_TREND_SOURCES` in `src/config/niches.ts` is the source-of-truth for active sources.
- Production email delivery requires `RESEND_FROM_EMAIL`; no production fallback sender is permitted.
- `/s/[id]` is the sole canonical public share URL; `/share/[id]` remains a redirect only.

## Design

`src/lib/product-truth.ts` will expose source labels and a short, approved product-description vocabulary derived from `ENABLED_TREND_SOURCES`. Landing, dashboard generation/loading states, sample brief, public share CTA, prices, and mail templates will use this vocabulary and describe briefs as manually generated. Source badges are restricted to active source identifiers.

`src/lib/mail.ts` will obtain the sender through a small configuration function. It returns no sender outside development when the environment variable is absent, causing mail functions to fail closed; local development may retain the Resend sandbox sender solely when `NODE_ENV !== 'production'`. All Resend send sites use the same helper.

The engagement cron will select Starter recipients only by a brief created on the Monday run, rather than by the existence of any historical brief. Paid users retain their existing same-day notification query. Referral handling becomes a `GET` Route Handler that validates the code, sets the cookie on its redirect response, and redirects to signup. The legacy server-component route is removed.

Public-share writes move behind one server action that applies the current team id and returns a single `{ id }` shape. Existing callers are migrated to it. `/share/[id]` redirects to `/s/[id]`; public rendering remains owned by `/s/[id]`.

## Error handling and tests

Missing production sender returns a deterministic mail failure before calling Resend. Referral validation returns 404 for unknown codes. Unit tests cover source-copy mapping, sender policy, Starter cron query window, canonical share action contract, referral redirect/cookie behavior, and inactive source suppression in the sample brief.

