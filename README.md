# RepsBrief

SaaS Next.js + Supabase per generare brief di contenuti da trend reali con AI. Live su [repsbrief.com](https://repsbrief.com).

## Stack

- **Frontend**: Next.js 16 App Router + TypeScript + Tailwind
- **Backend**: Supabase (Postgres + Auth + RLS + Storage)
- **Billing**: Stripe (Pro $19/mo, Team $39/mo, 7-day free trial)
- **Email**: Resend (welcome sequence + brief-ready notifications)
- **AI**: Provider-agnostic via `getAIProvider()` in `src/lib/ai/index.ts`
- **Monitoring**: Sentry
- **Hosting**: Vercel (auto-deploy da `main`)

## Avvio rapido

```bash
pnpm install
pnpm dev
```

App locale: `http://localhost:3000`

## Auth flow

```
Signup (/signup)
  → Supabase invia email di verifica
  → link porta a /auth/callback?code=xxx
  → exchangeCodeForSession → redirect /dashboard

Forgot password (/forgot-password)
  → email con link → /auth/callback?code=xxx&next=/reset-password
  → /reset-password → updateUser({ password })
```

## Variabili ambiente richieste

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_TEAM_MONTHLY=

RESEND_API_KEY=
CRON_SECRET=

AI_PROVIDER=openai        # openai | anthropic | gemini | azure | groq
AI_MODEL=gpt-4o
```

Per config completa integrazioni OAuth (Google Calendar, Notion, Slack…): [INTEGRATIONS_CHECKLIST.md](./INTEGRATIONS_CHECKLIST.md)

## Switch AI Provider

Solo variabili env, zero modifiche al codice:

```env
AI_PROVIDER=anthropic
AI_MODEL=claude-sonnet-4-6
```

Providers supportati: `openai`, `anthropic`, `gemini`, `azure`, `groq`

### Config Azure OpenAI

```env
AI_PROVIDER=azure
AI_MODEL=gpt-4o
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/openai/v1/
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_FALLBACK_MODEL=gpt-4o-mini
```

### Config Gemini

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=...
```

## Billing

Piani in `src/lib/billing.ts`:

| Piano | Env var | Prezzo |
|-------|---------|--------|
| Pro | `STRIPE_PRICE_PRO_MONTHLY` | $19/mo |
| Team | `STRIPE_PRICE_TEAM_MONTHLY` | $39/mo |

Webhook Stripe: `https://repsbrief.com/api/stripe/webhook`

## Cron jobs (vercel.json)

| Route | Schedule | Cosa fa |
|-------|----------|---------|
| `/api/cron/weeklyBrief` | Lunedì 09:00 UTC | Genera brief settimanali |
| `/api/cron/engagement-emails` | Ogni giorno 10:00 UTC | Email Day 1/3/7 + brief-ready |

## Architettura AI

Tutte le chiamate AI passano da:

```ts
import { getAIProvider } from '@/lib/ai'
const ai = getAIProvider()
const response = await ai.complete(messages, options)
```

Non chiamare SDK AI direttamente fuori da `src/lib/ai/providers/`.

## Script utili

```bash
pnpm dev          # sviluppo locale
pnpm build        # build produzione
pnpm typecheck    # TypeScript check
pnpm lint         # ESLint
```
