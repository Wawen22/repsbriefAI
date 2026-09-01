# Security and Cost Controls Design

**Date:** 2026-09-01  
**Scope:** Server-side hardening for AI Remix, Brand Voice, image generation, and active-niche selection.

## Goal

Reject malformed, unauthorized, over-plan, or excessive-cost requests before they reach an AI provider or external image host. Preserve the project’s existing AI abstraction and team-first model without applying Supabase migrations.

## Constraints

- Do not apply, create, or repair Supabase migrations.
- All AI calls continue through `getAIProvider()` or the existing image provider boundary.
- Niche configuration remains exclusively in `src/config/niches.ts`.
- Unknown plan values fail closed as Starter.
- No `npm audit fix --force`.
- No fallbacks to profile-based Brand Voice when a team schema/RPC is unavailable.

## Architecture

### Shared security helpers

Add small, server-only modules for:

1. Zod schemas and constants for untrusted request/action input:
   - Remix instruction and the subset of an `IdeaObject` needed for its prompt.
   - Brand Voice samples, both direct arrays and the textarea payload.
   - UUID `ideaHistoryId` image requests.
   - Active niche IDs derived from active entries in `NICHES`.
2. A plan helper that treats only `pro` and `team` as paid entitlements.
3. A server-side distributed rate limiter backed by Upstash Redis. It must count a bounded time window before an AI call, return a retry interval, and be testable by injecting its limiter adapter. No in-memory-only limiter is acceptable.

The helpers return stable user-safe errors and log detailed causes only server-side.

### Authorization and entitlement flow

Each AI-capable server entry point authenticates first, validates input second, loads the current profile/team third, then enforces both plan and rate limit before invoking its provider.

| Flow | Required entitlement | Authorization | Initial rate policy |
| --- | --- | --- | --- |
| Remix | Pro or Team | current user and active workspace | 10 requests / 10 minutes / user |
| Brand Voice analyze/update | Pro or Team, owner/admin only | current-team membership | 3 analyses / 24 hours / team |
| Image generation | Pro or Team | requested idea belongs to current user | 10 generations / 24 hours / user |

The concrete persistence mechanism uses `@upstash/redis` and `@upstash/ratelimit` with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. It must not add a migration. Missing configuration is an explicit `503` before an AI/provider call rather than an instance-local fallback.

### Brand Voice

`analyzeBrandVoiceAction` reads the current team and verifies owner/admin membership. It writes via the canonical `update_team_brand_voice` RPC only. RPC/schema/policy errors are surfaced as a safe failure; no direct `teams` or legacy `profiles` fallback is used.

`remixScriptAction` and on-demand brief generation obtain the voice from `teams.brand_voice` for `profiles.current_team_id`. A missing team is a safe empty persona; it is never replaced by `profiles.brand_voice`.

### Secure image retrieval

Replace the unrestricted URL fetch with a dedicated downloader.

- Accept provider `data:image/...;base64,...` only when decoded length is within the byte limit.
- For remote URLs, require HTTPS, reject credentials, non-default ports, localhost and numeric/private/link-local/loopback address literals.
- Resolve each hostname and reject any non-public result before fetching; revalidate each redirect target and permit no more than two redirects.
- Use `AbortSignal.timeout`, reject responses without an `image/*` content type, reject declared or streamed bodies above the byte limit, and do not buffer unbounded bodies.
- Return a generic upstream-image error to the client.

## Input limits

| Input | Limit |
| --- | ---: |
| Remix instruction | 2,000 Unicode code points |
| Remix title/hook/description/script/key visuals | 500 / 500 / 4,000 / 8,000 / 1,000 code points |
| Brand Voice samples | 1–5 samples; 2,000 code points each; 8,000 combined |
| Brand Voice result stored | 1,200 code points |
| JSON image body | one UUID only |
| Downloaded image | 10 MiB |
| Image fetch timeout | 10 seconds |

## Testing

Add unit tests that prove rejection occurs before provider calls for invalid or oversized input; that Starter/unknown plans and non-members are denied; that limits produce 429 with retry metadata; that active niches only accept configured active IDs; and that image downloader rejects SSRF candidates, redirects to private addresses, wrong content types, timeouts, and oversized streams. Existing behaviour for valid Pro/Team requests remains covered.

## Dependencies and validation

Use the installed Zod major version’s `safeParse` APIs. Upgrade only audited vulnerable packages where a compatible release is available, update the lockfile through the package manager, inspect changed versions, then run unit tests, typecheck, lint, production build, and `npm audit --omit=dev`. Record remaining findings and their direct dependency path in `PROJECT_CONTEXT.md`.
