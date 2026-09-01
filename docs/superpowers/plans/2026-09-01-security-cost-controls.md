# Security and Cost Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect every AI-costing operation with validated input, authorization, paid-plan checks, and distributed server-side rate limits while hardening provider image retrieval.

**Architecture:** Shared server-only modules provide Zod schemas, entitlement checks, and an Upstash-backed limiter. Routes/actions call these guards before their AI/provider boundaries; the image downloader validates every remote hop and streams bounded bytes. Team Brand Voice uses only the current team’s canonical RPC/data.

**Tech Stack:** Next.js 16 Route Handlers and Server Actions, TypeScript, Zod 4, Supabase, Upstash Redis/RateLimit, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-01-security-cost-controls-design.md`

## Global Constraints

- Do not apply, create, repair, or modify Supabase migrations.
- Use `getAIProvider()` for text AI; retain provider isolation for image generation.
- Permit paid features only for exact plans `pro` and `team`.
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; missing variables return a fail-closed `503` before provider use.
- Do not use `npm audit fix --force`.

## Execution Status (2026-09-01)

- [x] Shared input validation, entitlement gates, and Upstash fail-closed limiter added.
- [x] Remix, Brand Voice, image generation, active niche, and team Brand Voice flows hardened.
- [x] Raster-only image MIME validation and expanded non-public IP rejection tested.
- [ ] DNS pinning and integration-level redirect/oversized-stream tests remain open.
- [ ] Full typecheck, lint, and build require an environment execution window longer than 30 seconds.

---

### Task 1: Add dependencies and security primitives

**Files:**
- Modify: `package.json`, `package-lock.json`, `pnpm-lock.yaml`
- Create: `src/lib/security/schemas.ts`, `src/lib/security/entitlements.ts`, `src/lib/security/rate-limit.ts`
- Test: `tests/unit/security-schemas.test.ts`, `tests/unit/rate-limit.test.ts`

**Interfaces:**
- Produces `parseRemixInput`, `parseBrandVoiceSamples`, `parseActiveNiche`, and `parseIdeaHistoryId`.
- Produces `requirePaidPlan(plan)` and `checkRateLimit(policy, identifier)`.

- [ ] **Step 1: Write failing schema and entitlement tests**

```ts
expect(() => parseActiveNiche('unknown')).toThrow()
expect(() => parseRemixInput({ instruction: 'x'.repeat(2001), idea })).toThrow()
expect(requirePaidPlan('starter')).toEqual({ allowed: false })
expect(requirePaidPlan('unexpected')).toEqual({ allowed: false })
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `npm test -- tests/unit/security-schemas.test.ts`

- [ ] **Step 3: Add Upstash packages through the package manager and implement the minimal helpers**

```ts
export const PAID_PLANS = new Set(['pro', 'team'])
export function requirePaidPlan(plan: unknown) {
  return { allowed: typeof plan === 'string' && PAID_PLANS.has(plan) }
}
```

Use Zod `safeParse`; derive the niche enum from `Object.values(NICHES).filter(({ active }) => active)`; instantiate one `Ratelimit` per named policy using `Redis.fromEnv()`; return `{ allowed, retryAfterSeconds }`; return an unavailable result when either environment variable is absent.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `npm test -- tests/unit/security-schemas.test.ts tests/unit/rate-limit.test.ts`

### Task 2: Guard Remix and Brand Voice actions

**Files:**
- Modify: `src/app/actions/remix.ts`, `src/app/actions/profile.ts`
- Test: `tests/unit/remix-security.test.ts`, `tests/unit/brand-voice-security.test.ts`

**Interfaces:**
- Consumes Task 1 validation, entitlement, and rate-limit helpers.
- Produces consistent `{ success: false, error }` action results without provider calls for denied requests.

- [ ] **Step 1: Write failing authorization, plan, and input tests**

```ts
expect(await remixScriptAction(validIdea, 'x'.repeat(2001))).toMatchObject({ success: false })
expect(aiComplete).not.toHaveBeenCalled()
expect(await analyzeBrandVoiceAction(['valid']).then(r => r.error)).toMatch(/upgrade/i)
expect(await analyzeBrandVoiceAction(['x'.repeat(2001)])).toMatchObject({ error: expect.any(String) })
```

- [ ] **Step 2: Run focused tests to verify RED**

Run: `npm test -- tests/unit/remix-security.test.ts tests/unit/brand-voice-security.test.ts`

- [ ] **Step 3: Implement guards before every AI call**

Validate before prompting; load profile plan/current team; verify membership for Remix and owner/admin for Brand Voice; rate-limit by user for Remix and team for Brand Voice. Query `teams.brand_voice` using only `current_team_id`. Delete `persistTeamBrandVoice` direct-table/profile fallback paths and treat canonical RPC errors as safe failures.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `npm test -- tests/unit/remix-security.test.ts tests/unit/brand-voice-security.test.ts`

### Task 3: Protect image generation and remote image downloads

**Files:**
- Create: `src/lib/security/image-download.ts`
- Modify: `src/app/api/generator/generate-image/route.ts`
- Test: `tests/unit/image-download.test.ts`, `tests/unit/generate-image-security.test.ts`

**Interfaces:**
- Produces `downloadProviderImage(url): Promise<{ bytes: Buffer; contentType: string }>`.
- Route returns 400 invalid request, 401 unauthenticated, 403 entitlement denial, 404 missing/non-owned idea, 429 throttled, 503 unavailable limiter, and generic 502 unsafe provider asset.

- [ ] **Step 1: Write failing downloader and route tests**

```ts
await expect(downloadProviderImage('http://127.0.0.1/a.png')).rejects.toThrow()
await expect(downloadProviderImage('https://host/file.txt')).rejects.toThrow()
await expect(downloadProviderImage(oversizedDataUrl)).rejects.toThrow()
expect(response.status).toBe(429)
expect(providerGenerateImage).not.toHaveBeenCalled()
```

- [ ] **Step 2: Run focused tests to verify RED**

Run: `npm test -- tests/unit/image-download.test.ts tests/unit/generate-image-security.test.ts`

- [ ] **Step 3: Implement bounded anti-SSRF download and route guards**

Require a Zod UUID body, exact paid plans, and a user-owned idea before rate limiting/provider use. In the downloader permit validated `data:image/*;base64` payloads or public HTTPS URLs only; reject credentials, ports, private/literal addresses and unsafe DNS resolutions; manually validate at most two redirects; enforce a 10-second abort, `image/*` content type, 10 MiB declared/streamed cap. Upload with the verified returned content type.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `npm test -- tests/unit/image-download.test.ts tests/unit/generate-image-security.test.ts`

### Task 4: Validate niches and use the current team voice during brief generation

**Files:**
- Modify: `src/app/actions/profile.ts`, `src/app/api/generator/generate-now/route.ts`
- Test: `tests/unit/niches.test.ts`, `tests/unit/generate-now-security.test.ts`

**Interfaces:**
- Consumes `parseActiveNiche` and canonical team voice query.
- Produces inactive/unknown niche rejection and brief generation with `teams.brand_voice` only.

- [ ] **Step 1: Write failing tests**

```ts
expect(await updateActiveNicheAction('not-configured')).toMatchObject({ error: expect.any(String) })
expect(generateBrief).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), 'team voice', expect.anything())
```

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- tests/unit/niches.test.ts tests/unit/generate-now-security.test.ts`

- [ ] **Step 3: Implement minimum validation and canonical voice lookup**

Reject invalid active niche before profile update. In `generate-now`, reject inactive/unknown persisted niches, load `teams.brand_voice` only when `current_team_id` exists, and pass that value to `generateBrief`; remove `profiles.brand_voice` from this flow.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `npm test -- tests/unit/niches.test.ts tests/unit/generate-now-security.test.ts`

### Task 5: Controlled vulnerability remediation and release evidence

**Files:**
- Modify: dependency manifests/lockfiles only where audit evidence identifies a direct vulnerable package; `PROJECT_CONTEXT.md`
- Create: `INIT_PROMPT.md`
- Test: all existing and newly added tests

- [ ] **Step 1: Capture baseline and choose compatible direct upgrades**

Run: `npm audit --omit=dev --json > /tmp/repsbrief-audit-before.json`

Inspect the direct-package paths and release notes; use targeted `npm install package@version` commands only. Never run `npm audit fix --force`.

- [ ] **Step 2: Run focused regressions after each upgrade**

Run: `npm test`

- [ ] **Step 3: Update operational state**

Create `INIT_PROMPT.md` with Development Progress and Task Status Tracking checklists, a link to `docs/audits/2026-09-01-repsbrief-audit.md`, the Upstash environment-variable requirement, and the explicit no-migration rule. Update the same checklist sections and validation snapshot in `PROJECT_CONTEXT.md`, including remaining audit findings if any.

- [ ] **Step 4: Run final verification**

Run: `npm test && npm run typecheck && npm run lint && npm run build && npm audit --omit=dev`
