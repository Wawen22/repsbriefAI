# 🚀 RepsBrief — Initialization Prompt for AI Agents

## 📋 Development Progress
- [ ] **Phase 1: Foundation**
    - [x] Project Scaffold & Structure
    - [x] GitHub Repo Synced
    - [x] AI Abstraction Layer
    - [x] Niche Configuration & Types
    - [x] Supabase Schema & Migrations
- [ ] **Phase 2: Scrapers & Generator**
    - [x] Scraper Orchestrator
    - [x] Reddit Scraper
    - [x] YouTube Scraper
    - [x] Google Trends Scraper
    - [x] RSS Scraper
    - [x] Brief Generator (AI Layer Integration)
- [ ] **Phase 3: Automation & Delivery**
    - [x] Weekly Cron Job
    - [x] Resend Email Integration
    - [x] Stripe Payment Integration
- [ ] **Phase 4: UI/UX**
    - [x] Landing Page
    - [x] User Dashboard
    - [x] Niche Picker

Copy and paste this prompt to start any session with an AI agent (Claude, Cursor, Copilot, Windsurf, etc.)
Always attach PROJECT_CONTEXT.md alongside this prompt.

---

## 🟢 MAIN PROMPT — Use this to start any session

```
You are a senior full-stack developer helping me build RepsBrief, a micro-SaaS web application.

I'm attaching the full project context file (PROJECT_CONTEXT.md). Read it entirely before doing anything.
It contains all decisions already made. Do not suggest changes to the stack or architecture unless I ask.

## Tech Stack (non-negotiable)
- Frontend: Next.js 14+ with App Router, React, TypeScript
- Backend: Node.js with Vercel Functions, TypeScript
- Database: Supabase (PostgreSQL + Auth + Storage)
- Hosting: Vercel
- Styling: Tailwind CSS + shadcn/ui
- Payments: Stripe
- Email: Resend
- AI: abstraction layer in /lib/ai — provider and model set via env vars (see below)
- Cron: Vercel Cron
- NO Python, NO plain JavaScript — TypeScript only

## AI Provider Architecture (critical — read carefully)
The app NEVER calls any AI SDK directly. All AI calls go through the abstraction layer:

  import { getAIProvider } from '@/lib/ai'
  const ai = getAIProvider()
  const response = await ai.complete(messages, options)

The active provider is set via environment variables:
  AI_PROVIDER=openai        # openai | anthropic | gemini | azure | groq
  AI_MODEL=gpt-4o-mini      # any model supported by the chosen provider

Switching provider = changing .env only. Zero code changes.
The /lib/ai/providers/ folder contains one file per provider, all implementing the AIProvider interface.
Never import OpenAI, Anthropic, Gemini, or any AI SDK directly outside of /lib/ai/providers/.

## Multi-Niche Architecture (critical)
All niche-specific data lives in /config/niches.ts.
Scrapers and generators must NEVER hardcode niche data — always receive a NicheConfig parameter.
At launch only "fitness" is active. Others are in config with active: false.

## Your Task for This Session
[REPLACE THIS LINE with what you want to build, for example:
- "Initialize the Next.js project with the full folder structure from the context"
- "Build the AI abstraction layer: /lib/ai/types.ts, /lib/ai/index.ts, and all providers"
- "Build /config/niches.ts with all TypeScript types"
- "Build the Reddit scraper module"
- "Build the YouTube scraper module"
- "Build the Google Trends scraper module"
- "Build the RSS scraper module"
- "Build the scraper orchestrator"
- "Build the brief generator using the AI abstraction layer"
- "Set up Supabase schema and RLS policies"
- "Set up Stripe subscriptions"
- "Build the weekly cron job"
- "Build the Resend email template"
- "Build the landing page"
- "Build the dashboard page"
]

## Rules
1. TypeScript everywhere — no plain JS, ever.
2. Follow the folder structure in PROJECT_CONTEXT.md exactly.
3. Use the exact database schema from PROJECT_CONTEXT.md.
4. NEVER import AI SDKs directly — always use getAIProvider() from /lib/ai.
5. NEVER hardcode niche data outside /config/niches.ts.
6. Supabase: service role in backend, anon client in frontend.
7. Cron must be resilient — wrap per-user logic in try/catch, one failure never blocks others.
8. Use env vars from PROJECT_CONTEXT.md — never hardcode credentials.
9. Save ai_provider and ai_model on every brief row in Supabase.
10. Handle errors gracefully with meaningful logs.

## Output Format
- Complete, working code — no pseudocode unless I ask for a skeleton.
- Each file shown with its full path from project root.
- Brief list of next steps after the code.

Start by confirming you've read PROJECT_CONTEXT.md, summarize the 5 most important architectural
decisions in bullet points, then proceed with the task.
```

---

## 🔧 Specialized Session Prompts

Always attach PROJECT_CONTEXT.md. Replace [your task] with the specific work needed.

---

### 🤖 AI Abstraction Layer Session — START HERE

```
Read PROJECT_CONTEXT.md. Focus on the AI Provider Architecture section.

Task: Build the complete AI abstraction layer.

Files to create:
- lib/ai/types.ts         → AIProvider interface, AIMessage, AIResponse, AIOptions types
- lib/ai/index.ts         → getAIProvider() factory function reading AI_PROVIDER from env
- lib/ai/providers/openai.ts      → OpenAI implementation
- lib/ai/providers/anthropic.ts   → Anthropic/Claude implementation
- lib/ai/providers/gemini.ts      → Google Gemini implementation
- lib/ai/providers/azure.ts       → Azure OpenAI implementation (uses openai SDK with custom baseURL)
- lib/ai/providers/groq.ts        → Groq implementation

Requirements:
- All providers implement the AIProvider interface exactly
- jsonMode option: enable JSON output mode where the provider supports it natively
  (OpenAI: response_format json_object, Gemini: responseMimeType, others: prompt instruction)
- Each provider stores and returns provider name + model name in AIResponse
- getAIProvider() throws a clear error if AI_PROVIDER env var is not set or unrecognized
- No provider is imported at the top level of index.ts — use dynamic requires or inline imports
  to avoid loading unused SDK dependencies
```

---

### ⚙️ Niche Config & Types Session

```
Read PROJECT_CONTEXT.md. Focus on the Multi-Niche Strategy section.

Task: Create /config/niches.ts and /types/niche.ts

- /types/niche.ts: NicheConfig interface, TrendItem, IdeaObject, BriefData types
- /config/niches.ts: NICHES object with fitness fully configured,
  personal_finance and b2b_marketing commented out as future reference
- Fitness niche must include all subreddits, keywords, YouTube categories, RSS feeds,
  and claudePersona defined in PROJECT_CONTEXT.md
```

---

### 🗄️ Database & Supabase Session

```
Read PROJECT_CONTEXT.md. Focus on the Database Schema section.

Task: [your task]

Apply the exact schema — migration at supabase/migrations/001_initial_schema.sql.
Important: briefs table must include ai_provider and ai_model TEXT columns.
RLS policies:
- profiles, briefs, idea_history: users read/write own rows only
- trends_cache: read-only for authenticated users, write via service role only
Also create lib/supabase.ts with both anon client (frontend) and service role client (backend).
```

---

### 🕷️ Scraper Module Session

```
Read PROJECT_CONTEXT.md. Focus on the Data Sources section.

Task: Build the [reddit | youtube | googleTrends | rss] scraper.
File: app/api/scraper/[module].ts

Requirements:
- Function signature: scrape[Source](niche: NicheConfig): Promise<TrendItem[]>
- Read ALL niche-specific config (subreddits, keywords, feeds) from the NicheConfig param — never hardcode
- Return normalized TrendItem[] compatible with trends_cache schema
- Log errors but never throw — cron resilience
```

---

### 🧠 Brief Generator Session

```
Read PROJECT_CONTEXT.md. Focus on AI Provider Architecture and AI Integration sections.

Task: Build app/api/generator/briefGenerator.ts

Requirements:
- Import and use getAIProvider() from /lib/ai — never import any AI SDK directly
- Function signature: generateBrief(trendsData, ideaHistory, niche: NicheConfig): Promise<IdeaObject[]>
- Build prompt dynamically using niche.claudePersona and niche.label
- Use jsonMode: true in AI options
- Validate response with Zod IdeaObject schema
- On invalid JSON: retry once, then throw with detailed error
- Must return exactly 20 validated IdeaObject items
- Log which provider and model were used
```

---

### ⏰ Cron Job Session

```
Read PROJECT_CONTEXT.md. Focus on the Weekly Cron Job Flow section.

Task: Build app/api/cron/weeklyBrief.ts

Requirements:
- Protect with CRON_SECRET header
- Follow the exact flow from the context
- Iterate only over niches with active === true
- Per-user operations wrapped in try/catch — failures never stop others
- Save ai_provider and ai_model on each brief (comes from AIResponse)
- Final log: total users, success, failures, error list
```

---

### 💳 Stripe Session

```
Read PROJECT_CONTEXT.md. Focus on the Business Model section.

Task: Set up Stripe subscriptions for Starter ($9), Pro ($19), Team ($39).
Build:
1. app/api/stripe/checkout.ts — create checkout session
2. app/api/stripe/webhook.ts — handle subscription events, update profiles.plan in Supabase
3. app/api/stripe/portal.ts — customer portal for self-service plan management
4. Middleware: protect /dashboard, redirect to /login if unauthenticated,
   redirect to /pricing if no active subscription
```

---

### 📧 Email Template Session

```
Read PROJECT_CONTEXT.md. Focus on the Email Template Structure section.

Task: Build app/api/email/sendBrief.ts with React Email + Resend.

Requirements:
- Follow the 6-section structure from the context exactly
- Mobile-responsive, clean and energetic design
- Function signature: sendBrief(userEmail: string, brief: BriefData, niche: NicheConfig): Promise<void>
- Subject: "🏋️ Your RepsBrief is ready — 20 ideas for this week"
```

---

### 🎨 Landing Page Session

```
Read PROJECT_CONTEXT.md. Focus on Product Overview and ICP sections.

Task: Build app/page.tsx (fitness-focused landing page)

Sections: Hero, Problem (2-3 hours of research), Solution, How It Works, Pricing (3 plans), CTA
- No mention of multi-niche publicly
- Waitlist/signup CTA with Supabase auth
- Design: dark, energetic, modern fitness brand — not generic corporate SaaS
- Tailwind CSS + shadcn/ui
```

---

### 📊 Dashboard Session

```
Read PROJECT_CONTEXT.md. Focus on Project Structure and Database Schema.

Task: Build app/(dashboard)/dashboard/page.tsx

Requirements:
- Fetch current week's brief from Supabase for logged-in user
- Display 20 ideas with BriefCard and BriefList components
- Format filter tabs: All | Reel | Carousel | Thread | Newsletter
- NichePicker: fitness active, others "Coming Soon"
- Empty state if no brief yet for this week
- Starter plan users: preview with upgrade prompt
```

---

_Always attach PROJECT_CONTEXT.md when starting a new session._
_PROJECT_CONTEXT.md is the single source of truth for the entire project._
_Version: 1.2 — AI provider abstraction layer added_
