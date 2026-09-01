# RepsBrief — Task Status Tracking

Audit baseline: [2026-09-01 RepsBrief audit](docs/audits/2026-09-01-repsbrief-audit.md)

## Development Progress

- [x] Security/cost-control design and implementation plan documented.
- [x] Input schemas, paid-plan gates, team Brand Voice hardening, and distributed rate-limit integration added.
- [x] Remote image URL fetching disabled fail-closed pending verified DNS pinning.
- [x] Revenue truthfulness hardening: active YouTube/RSS sources, canonical public shares, and referral Route Handler.
- [ ] Complete release verification and assess remaining dependency audit findings; implement verified Node DNS pinning before re-enabling remote image URLs.

## Task Status Tracking

- [x] No Supabase migration applied or modified.
- [x] Upstash requirements documented: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- [ ] Configure those environment variables in each deployed environment before enabling AI features.
- [ ] Configure a verified Resend sender domain and `RESEND_FROM_EMAIL` in Vercel.
- [ ] Reconcile Supabase production history from a confirmed backup before applying any local migrations.
- [ ] Review final `npm audit --omit=dev` report and schedule remaining transitive remediation.
