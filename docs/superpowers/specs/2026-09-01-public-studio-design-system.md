# Public Studio Design System

## Goal

Extend RepsBrief's existing Dark IDE Studio language from the authenticated dashboard to every public, authentication, invitation, and shared-strategy route without changing authentication, invitation, sharing, or legal-content behavior.

## Architecture

A server-safe `PublicStudioShell` provides the shared black canvas, technical grid, brand bar, heading frame, and reusable studio primitives. Auth and server routes keep their existing state, actions, Supabase calls, metadata, and content while composing these primitives.

## Constraints

- No dependency, API, database, billing, AI-provider, niche configuration, or pricing-copy changes.
- Preserve every route contract, error state, redirect, invitation action, Open Graph metadata, and legal text.
- Validate with focused unit test, typecheck, lint, full tests, and placeholder-backed build.

