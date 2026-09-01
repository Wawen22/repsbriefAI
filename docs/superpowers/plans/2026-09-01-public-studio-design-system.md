# Public Studio Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** Bring public and authentication routes into the Dark IDE Studio design system while preserving behaviour.

**Architecture:** `PublicStudioShell` exports the common frame and immutable Tailwind class vocabulary. Existing client and server routes compose it without moving their state or data access.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-01-public-studio-design-system.md`

## Tasks

- [ ] TDD: add a failing unit test for shared studio primitives, then create `PublicStudioShell`.
- [ ] Migrate login, signup, forgot/reset password and team invitations; retain all form/action behaviour.
- [ ] Migrate canonical share, terms and privacy routes; retain data, metadata and prose.
- [ ] Run full validation, update project state, commit, merge, push and archive non-destructively.

