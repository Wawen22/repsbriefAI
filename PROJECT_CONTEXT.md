# 🏋️ RepsBrief — Project Context for AI Agents

## 📋 Task Status Tracking

- [ ] **Current Task:** Live Testing with Initial Fitness Creators & Phase 3 UI Growth
- [ ] **Next Task:** Deploy to Vercel
- [ ] **Completed Tasks:**
  - [x] Initial Context & Prompt Review
  - [x] Architectural Summarization
  - [x] Project Scaffold & Folder Structure
  - [x] GitHub Repo Synced
  - [x] AI Abstraction Layer Implementation
  - [x] Niche Configuration & Types Setup
  - [x] Supabase Schema & Migration Creation
  - [x] Scraper Orchestrator & All Modules (Reddit, YouTube, Google Trends, RSS)
  - [x] Brief Generator with AI Abstraction & Zod Validation
  - [x] Weekly Cron Job Orchestration (Scrape + Generate + Save)
  - [x] Resend Email Integration with React Email Template
  - [x] Stripe Checkout & Webhook Integration
  - [x] Dark Energetic Fitness Landing Page
  - [x] Fitness Dashboard with Format Filters & Empty State
  - [x] Niche Picker & Multi-format Content Display
  - [x] Supabase Auth (Login/Signup) Pages
  - [x] Verified Production Build
  - [x] Final Prototype Delivered (Phase 1-2 UI)

> **Use this file as context when working on any part of the project.**
> It contains all decisions already made: stack, architecture, business logic, and roadmap.

---

## 📌 Product Overview

**Name:** RepsBrief
**Domain:** repsbr ief.com
**Tagline:** "20 content ideas every Monday, based on what's trending in your niche."
**Type:** Micro-SaaS / Web App
**Current Launch Niche:** Fitness & Nutrition
**Architecture:** Multi-niche by design + AI provider-agnostic layer

**Problem Solved:** Creators spend 2–3 hours/week manually searching for content ideas. RepsBrief automates this by aggregating trends from Reddit, YouTube, and Google Trends, then generating a ready-to-use content brief via a swappable AI provider — delivered every Monday morning.
**Delivery:** Weekly email (Monday morning) + web dashboard

---

## 🤖 AI Provider Architecture (Critical)

### Core Decision

RepsBrief uses an **AI provider abstraction layer**. The app never calls any AI SDK directly — it always goes through a single interface defined in `/lib/ai/index.ts`. The active provider and model are controlled via environment variables, with no code changes required to switch.

This allows switching between providers based on cost, volume, rate limits, or quality at any time.

### Supported Providers

| Provider               | Models (examples)                | npm Package                  |
| ---------------------- | -------------------------------- | ---------------------------- |
| **OpenAI**             | gpt-4o, gpt-4o-mini, gpt-4-turbo | `openai`                     |
| **Anthropic (Claude)** | claude-sonnet-4-6, claude-haiku  | `@anthropic-ai/sdk`          |
| **Google Gemini**      | gemini-1.5-pro, gemini-1.5-flash | `@google/generative-ai`      |
| **Azure OpenAI**       | gpt-4o (via Azure endpoint)      | `openai` (with Azure config) |
| **Groq**               | llama3-70b, mixtral-8x7b         | `groq-sdk`                   |

### The Abstraction Layer

```typescript
// lib/ai/types.ts

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}
```

```typescript
// lib/ai/index.ts — Factory: returns the active provider based on env vars

import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { AzureProvider } from "./providers/azure";
import { GroqProvider } from "./providers/groq";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "openai";

  switch (provider) {
    case "openai":
      return new OpenAIProvider(
        process.env.OPENAI_API_KEY!,
        process.env.AI_MODEL!,
      );
    case "anthropic":
      return new AnthropicProvider(
        process.env.ANTHROPIC_API_KEY!,
        process.env.AI_MODEL!,
      );
    case "gemini":
      return new GeminiProvider(
        process.env.GEMINI_API_KEY!,
        process.env.AI_MODEL!,
      );
    case "azure":
      return new AzureProvider(
        process.env.AZURE_OPENAI_API_KEY!,
        process.env.AZURE_OPENAI_ENDPOINT!,
        process.env.AI_MODEL!,
      );
    case "groq":
      return new GroqProvider(process.env.GROQ_API_KEY!, process.env.AI_MODEL!);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
```

```typescript
// lib/ai/providers/anthropic.ts — Example provider implementation

import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIMessage, AIResponse, AIOptions } from "../types";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || "claude-sonnet-4-6";
  }

  async complete(
    messages: AIMessage[],
    options?: AIOptions,
  ): Promise<AIResponse> {
    const system = messages.find((m) => m.role === "system")?.content;
    const userMessages = messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      system,
      messages: userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return {
      text: response.content[0].type === "text" ? response.content[0].text : "",
      provider: "anthropic",
      model: this.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }
}
```

```typescript
// lib/ai/providers/openai.ts — OpenAI implementation (also works for Azure)

import OpenAI from "openai";
import type { AIProvider, AIMessage, AIResponse, AIOptions } from "../types";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model || "gpt-4o-mini";
  }

  async complete(
    messages: AIMessage[],
    options?: AIOptions,
  ): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: options?.jsonMode ? { type: "json_object" } : undefined,
    });

    return {
      text: response.choices[0].message.content ?? "",
      provider: "openai",
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }
}
```

```typescript
// lib/ai/providers/azure.ts — Azure OpenAI

import OpenAI from "openai";
import type { AIProvider, AIMessage, AIResponse, AIOptions } from "../types";

export class AzureProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, endpoint: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${model}`,
      defaultQuery: { "api-version": "2024-02-01" },
      defaultHeaders: { "api-key": apiKey },
    });
    this.model = model;
  }

  async complete(
    messages: AIMessage[],
    options?: AIOptions,
  ): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: options?.maxTokens ?? 4096,
    });

    return {
      text: response.choices[0].message.content ?? "",
      provider: "azure",
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    };
  }
}
```

### How the Generator Uses It

```typescript
// app/api/generator/claudePrompt.ts (name kept for legacy, but provider-agnostic)

import { getAIProvider } from "@/lib/ai";
import { z } from "zod";

export async function generateBrief(
  trendsData,
  ideaHistory,
  niche: NicheConfig,
) {
  const ai = getAIProvider(); // reads AI_PROVIDER + AI_MODEL from env

  const response = await ai.complete(
    [
      { role: "system", content: `You are ${niche.claudePersona}.` },
      { role: "user", content: buildPrompt(trendsData, ideaHistory, niche) },
    ],
    { jsonMode: true, maxTokens: 4096 },
  );

  // Validate with Zod, retry once on failure
  return parseAndValidate(response.text);
}
```

### Switching Provider — Zero Code Changes

To switch provider, just update `.env`:

```env
AI_PROVIDER=gemini        # openai | anthropic | gemini | azure | groq
AI_MODEL=gemini-1.5-flash # any model supported by that provider
```

---

## 🗺️ Multi-Niche Strategy

### Core Decision

Single app, single codebase. All niche-specific data lives in `/config/niches.ts`.
Adding a new niche = one new config entry. No refactoring needed.

```typescript
// config/niches.ts
export const NICHES: Record<string, NicheConfig> = {
  fitness: {
    id: "fitness",
    label: "Fitness & Nutrition",
    active: true,
    subreddits: [
      "fitness",
      "bodybuilding",
      "naturalbodybuilding",
      "xxfitness",
      "loseit",
      "nutrition",
      "veganfitness",
      "running",
      "weightlifting",
      "personaltraining",
    ],
    googleTrendsKeywords: [
      "workout",
      "diet",
      "protein",
      "cutting",
      "bulking",
      "intermittent fasting",
      "meal prep",
      "cardio",
      "strength training",
      "calorie deficit",
    ],
    youtubeCategories: ["Sports", "Health & Fitness"],
    rssFeeds: [
      "https://examine.com/feed/",
      "https://www.strongerbyscience.com/feed/",
      "https://renaissanceperiodization.com/feed",
      "https://www.t-nation.com/feed/",
    ],
    claudePersona: "a content strategist specialized in fitness and nutrition",
  },

  // Future niches — not active yet
  // personal_finance: { active: false, ... },
  // b2b_marketing:    { active: false, ... },
  // parenting:        { active: false, ... },
  // tech_ai:          { active: false, ... },
};
```

### Frontend Positioning

- Landing page focuses **exclusively on fitness** at launch
- Niche selector in dashboard: fitness active, others show "Coming Soon"

---

## 💰 Business Model

| Plan    | Price     | Features                                                |
| ------- | --------- | ------------------------------------------------------- |
| Starter | $9/month  | 1 niche, weekly email, 20 ideas, no dashboard           |
| Pro     | $19/month | Dashboard, 3-month history, format filters, idea memory |
| Team    | $39/month | Up to 3 niches, 2 users, white-label email              |

**Payment:** Stripe (subscriptions)
**Target MRR:** $500 (month 3) → $2,000 (month 6) → $5,000+ (month 12)

---

## 👤 Ideal Customer Profile (ICP) — Fitness Launch

- Age: 25–35
- Role: Personal trainer, nutritionist, fitness athlete, wellness creator
- Platform: Instagram Reels, TikTok, YouTube Shorts
- Posts: 3–5x per week
- Already pays for: Canva Pro, CapCut Pro, ChatGPT Plus
- Pain: Runs out of ideas, repeats content, wastes hours researching
- NOT: Mega-influencers (have teams) or beginners (don't pay for tools)

---

## 🛠️ Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Frontend  | Next.js 14+ (App Router), React, TypeScript       |
| Backend   | Node.js, Vercel Functions, TypeScript             |
| Database  | Supabase (PostgreSQL + Auth + Storage)            |
| Hosting   | Vercel                                            |
| Payments  | Stripe                                            |
| Email     | Resend                                            |
| AI Layer  | `/lib/ai` abstraction — provider set via env vars |
| Cron Jobs | Vercel Cron or Inngest                            |
| Styling   | Tailwind CSS + shadcn/ui                          |

**Language:** TypeScript throughout — no Python, no plain JS.

---

## 📊 Data Sources

All sources defined in `/config/niches.ts`. Never hardcoded in scrapers.

### Reddit (official API — free tier)

- Filter: Top posts, 500+ upvotes, last 7 days
- Extracted: title, upvotes, top comments, flair, URL

### YouTube Data API v3 (free with quota)

- Videos last 14 days with high view velocity
- Extracted: title, description, tags, view count, publish date

### Google Trends (`google-trends-api` npm)

- Region: Worldwide + IT — Timeframe: last 7 days
- Data: rising topics, related queries

### RSS Feeds (`rss-parser` npm)

- Feed URLs per niche in config

---

## 🗄️ Database Schema (Supabase)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'starter',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  active_niche TEXT DEFAULT 'fitness',
  enabled_niches TEXT[] DEFAULT '{fitness}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  niche TEXT NOT NULL DEFAULT 'fitness',
  week_date DATE NOT NULL,
  ideas JSONB NOT NULL,
  trends_raw JSONB,
  ai_provider TEXT,     -- which provider generated this brief (for logging/debugging)
  ai_model TEXT,        -- which model was used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trends_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  niche TEXT NOT NULL,
  week_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, niche, week_date)
);

CREATE TABLE idea_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  niche TEXT NOT NULL,
  idea_hash TEXT NOT NULL,
  idea_title TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** `briefs` stores `ai_provider` and `ai_model` for every brief — useful for debugging quality differences between providers.

**RLS:** `profiles`, `briefs`, `idea_history` — users own their rows. `trends_cache` — read-only for users, write via service role.

---

## 🏗️ Project Structure

```
repsbr ief/
├── config/
│   └── niches.ts                        # ⭐ Niche config — single source of truth
│
├── lib/
│   ├── ai/
│   │   ├── index.ts                     # ⭐ AI factory — getAIProvider()
│   │   ├── types.ts                     # AIProvider interface, AIMessage, AIResponse
│   │   └── providers/
│   │       ├── openai.ts                # OpenAI provider
│   │       ├── anthropic.ts             # Anthropic/Claude provider
│   │       ├── gemini.ts                # Google Gemini provider
│   │       ├── azure.ts                 # Azure OpenAI provider
│   │       └── groq.ts                  # Groq provider
│   ├── supabase.ts
│   ├── stripe.ts
│   └── utils.ts
│
├── app/                                 # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── history/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── scraper/
│   │   │   ├── index.ts                 # Orchestrator
│   │   │   ├── reddit.ts
│   │   │   ├── youtube.ts
│   │   │   ├── googleTrends.ts
│   │   │   └── rss.ts
│   │   ├── generator/
│   │   │   ├── cluster.ts
│   │   │   ├── deduplicate.ts
│   │   │   └── briefGenerator.ts        # Uses getAIProvider() — provider-agnostic
│   │   ├── email/
│   │   │   └── sendBrief.ts
│   │   ├── stripe/
│   │   │   ├── checkout.ts
│   │   │   └── webhook.ts
│   │   └── cron/
│   │       └── weeklyBrief.ts
│   ├── layout.tsx
│   └── page.tsx                         # Landing page
│
├── components/
│   ├── ui/
│   ├── brief/
│   │   ├── BriefCard.tsx
│   │   ├── BriefList.tsx
│   │   └── TrendBadge.tsx
│   ├── niche/
│   │   └── NichePicker.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
│
├── types/
│   ├── niche.ts                         # NicheConfig, TrendItem, IdeaObject, BriefData
│   └── ai.ts                            # Re-exports from lib/ai/types.ts
│
├── supabase/
│   └── migrations/001_initial_schema.sql
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

```env
# ─── AI Provider (swap anytime, zero code changes) ───────────────────────────
AI_PROVIDER=openai              # openai | anthropic | gemini | azure | groq
AI_MODEL=gpt-4o-mini            # any model supported by the chosen provider

# OpenAI
OPENAI_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Google Gemini
GEMINI_API_KEY=

# Azure OpenAI
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=          # https://YOUR_RESOURCE.openai.azure.com

# Groq
GROQ_API_KEY=

# ─── Supabase ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ─── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# ─── Data Sources ─────────────────────────────────────────────────────────────
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=RepsBrief/1.0
YOUTUBE_API_KEY=

# ─── Services ─────────────────────────────────────────────────────────────────
RESEND_API_KEY=

# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=
```

---

## 🔄 Weekly Cron Job Flow

```
Every Monday at 6:00 AM UTC → POST /api/cron/weeklyBrief

1. Verify CRON_SECRET
2. Get active niches from config (active === true)
3. For each niche: scrape all sources → cache in Supabase
4. Get all users with active Stripe subscription
5. For each user (try/catch — one failure never blocks others):
   ├── Load active_niche + idea_history
   ├── Load trends from trends_cache
   ├── getAIProvider() → generateBrief()    ← provider from env vars
   ├── Save brief to Supabase (with ai_provider + ai_model fields)
   └── Send email via Resend
6. Log: total, success, failures, errors
```

---

## 🚀 Launch Roadmap

### Phase 1 — Validation (Week 1–2)

- [ ] Contact 10 fitness creators via Instagram DM
- [ ] Waitlist landing page (email only)
- [ ] Run scraper + brief manually, send by hand

### Phase 2 — MVP (Week 3–6)

- [ ] Supabase auth, Stripe, cron job, email, basic dashboard

### Phase 3 — Growth (Month 2–3)

- [ ] Brief history, format filters, idea memory, affiliate program

### Phase 4 — Multi-Niche (Month 3+)

- [ ] Activate second niche, NichePicker UI, Team plan

---

## ⚠️ Key Decisions & Constraints

- **AI provider abstraction** — `getAIProvider()` in `/lib/ai/index.ts` is the only entry point for AI calls. No direct SDK imports anywhere else in the codebase.
- **Provider swap = env var change only** — no code changes, no redeployment of logic needed. Vercel env var update + redeploy is sufficient.
- **No X/Twitter API** — too expensive. Reddit + YouTube + Google Trends is sufficient.
- **No Python** — TypeScript only throughout.
- **Single codebase, multi-niche** — `config/niches.ts` is the single source of truth.
- **Shared trends cache** — scraped once per week per niche, reused for all users.
- **Resilient cron** — per-user errors never stop the job.
- **Brief provenance** — every brief stores which AI provider and model generated it, for quality comparison over time.

---

_Last updated: February 2026_
_Version: 1.2 — Added AI provider abstraction layer_
