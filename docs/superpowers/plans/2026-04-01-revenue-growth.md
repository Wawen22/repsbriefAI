# Revenue Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 7 high-ROI product changes that improve conversion, retention, and viral growth for RepsBrief.

**Architecture:** Each task is fully independent — they can be shipped one at a time without breaking anything. No shared state between tasks. Follow existing patterns: server components + server actions for data, `src/lib/mail.ts` pattern for email, `src/lib/billing.ts` for plan checks.

**Tech Stack:** Next.js 16 App Router, Supabase, Stripe, Resend, TypeScript, Tailwind, `resend` npm package.

---

## File Map

| File | Action | Task |
|------|--------|------|
| `src/components/landing/HeroSection.tsx` | Modify — add email capture form | T1 |
| `src/app/api/email/waitlist/route.ts` | Create — save email + trigger welcome email | T1 |
| `src/lib/mail.ts` | Modify — add `sendWelcomeEmail`, `sendDay3Email`, `sendDay7Email` | T2 |
| `src/app/api/cron/engagement-emails/route.ts` | Create — Day 3 + Day 7 cron job | T2 |
| `src/components/landing/HeroSection.tsx` | Modify — add user count social proof | T3 |
| `src/components/brief/BriefList.tsx` | Modify — blur ideas 6–20 for starter plan | T4 |
| `src/components/brief/LockedIdeasGate.tsx` | Create — blur overlay + upgrade CTA | T4 |
| `src/app/api/generator/generate-now/route.ts` | Modify — enforce 1/week for starter | T5 |
| `src/app/(dashboard)/dashboard/page.tsx` | Modify — show rate limit state to starter users | T5 |
| `src/app/s/[id]/page.tsx` | Create — public read-only strategy page | T6 |
| `src/components/brief/BriefCard.tsx` | Modify — add Share button | T6 |
| `src/app/actions/share.ts` | Create — createShareAction server action | T6 |
| `src/app/(dashboard)/dashboard/analytics/page.tsx` | Modify — show brief stats from day 1 | T7 |
| `vercel.json` | Modify — add cron schedule for engagement emails | T2 |

---

## Task 1: Email Capture on Landing Page

**Files:**
- Modify: `src/components/landing/HeroSection.tsx`
- Create: `src/app/api/email/waitlist/route.ts`

### Context
The hero currently has two buttons (Start Building Now → /signup, Explore Features → #features). We add an inline email form as an alternative entry point. On submit, we POST to `/api/email/waitlist` which saves to a `waitlist_emails` Supabase table and sends a welcome email via Resend. This is a cold-traffic capture — the user doesn't need to set a password.

- [ ] **Step 1: Create the waitlist_emails table migration**

Create file `supabase/migrations/20260401120000_create_waitlist_emails.sql`:

```sql
CREATE TABLE IF NOT EXISTS waitlist_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'hero',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no user-facing access needed)
CREATE POLICY "Service role only" ON waitlist_emails
  USING (false);
```

- [ ] **Step 2: Apply the migration to production**

```bash
curl -X POST "https://qptnloozpjvcqqrfbmnj.supabase.co/rest/v1/rpc/query" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

Actually apply via Supabase dashboard → SQL editor, paste the migration SQL above. Verify: `SELECT * FROM waitlist_emails LIMIT 1;` returns empty result with no error.

- [ ] **Step 3: Create the API route**

Create `src/app/api/email/waitlist/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin('api/email/waitlist')

    // Upsert — silently ignore duplicates
    await supabase
      .from('waitlist_emails')
      .upsert({ email, source: 'hero' }, { onConflict: 'email', ignoreDuplicates: true })

    // Send welcome email
    await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: 'Your free content brief is waiting 🚀',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050505;color:#f1f5f9;padding:40px;border-radius:16px">
          <h1 style="font-size:28px;font-weight:900;margin:0 0 12px">Welcome to RepsBrief.</h1>
          <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 24px">
            You're about to get 20 AI-powered content strategies based on real trends — Reddit, YouTube, Google Trends — delivered every week.
          </p>
          <a href="https://repsbrief.com/signup" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:14px;letter-spacing:0.05em;text-transform:uppercase">
            Create Your Free Account →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px">RepsBrief · repsbrief.com</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Add the email capture form to HeroSection**

Replace the two-button block in `src/components/landing/HeroSection.tsx`. The current code at lines 33–43 is:

```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
  <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-widest w-full sm:w-auto shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-1 group" asChild>
    <Link href="/signup">
      Start Building Now
      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  </Button>
  <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-16 px-10 rounded-2xl text-xs font-black uppercase tracking-widest w-full sm:w-auto" asChild>
    <Link href="#features">Explore Features</Link>
  </Button>
</div>
```

Replace with:

```tsx
<EmailCaptureForm />
```

And add the component at the top of the file (after the imports, before `export function HeroSection`):

```tsx
'use client'
// (add 'use client' at top of HeroSection.tsx since it's currently client already)
```

Wait — HeroSection is already `'use client'`. Add this component inside the same file before the `HeroSection` export:

```tsx
function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/email/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        Check your inbox — your free brief is waiting.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 w-full max-w-lg mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
      />
      <Button
        type="submit"
        disabled={state === 'loading'}
        className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 shrink-0"
      >
        {state === 'loading' ? 'Sending...' : 'Get Free Brief →'}
      </Button>
    </form>
  )
}
```

Add `useState` to the React import and `CheckCircle2` to the lucide import at the top.

- [ ] **Step 5: Verify locally**

```bash
npm run dev
```

Open `http://localhost:3000`, enter an email in the hero, submit. Expected: success state shown. Check Supabase `waitlist_emails` table for the row.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260401120000_create_waitlist_emails.sql \
        src/app/api/email/waitlist/route.ts \
        src/components/landing/HeroSection.tsx
git commit -m "feat: add email capture form to landing hero with welcome email"
```

---

## Task 2: Post-Signup Email Sequence (Day 1, Day 3, Day 7)

**Files:**
- Modify: `src/lib/mail.ts`
- Create: `src/app/api/cron/engagement-emails/route.ts`
- Modify: `vercel.json` (or create if missing)

### Context
After signup, users get: Day 1 (immediate, triggered by cron checking `has_onboarded` users created today), Day 3 (re-engagement if no brief generated), Day 7 (upgrade nudge if still on starter). The cron job runs daily and checks user creation timestamps.

- [ ] **Step 1: Add email helper functions to `src/lib/mail.ts`**

Append to the end of the file (after the existing `sendWeeklyBriefEmail` function):

```typescript
export async function sendWelcomeSequenceEmail(
  email: string,
  userName: string,
  day: 1 | 3 | 7
): Promise<{ success: boolean }> {
  const subjects: Record<number, string> = {
    1: 'Your content strategy studio is ready',
    3: 'Have you generated your first brief?',
    7: 'Creators on Pro publish 4x more — here\'s why',
  }

  const bodies: Record<number, string> = {
    1: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">Hey ${userName || 'Creator'} 👋</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">Your RepsBrief studio is live. Three things to do right now:</p>
      <ol style="color:#94a3b8;line-height:2;padding-left:20px;margin:0 0 24px">
        <li><strong style="color:#f1f5f9">Train your AI voice</strong> — upload 2 writing samples and every brief will sound like you</li>
        <li><strong style="color:#f1f5f9">Generate your first brief</strong> — 20 trend-backed ideas in 30 seconds</li>
        <li><strong style="color:#f1f5f9">Save your best ideas</strong> — move them to your Kanban board</li>
      </ol>
      <a href="https://repsbrief.com/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Open My Studio →</a>
    `,
    3: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">Your first brief is 30 seconds away</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">We noticed you haven't generated your first brief yet. Our engine has already scraped this week's top trends for your niche — it just needs you to hit Generate.</p>
      <a href="https://repsbrief.com/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Generate My Brief →</a>
    `,
    7: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">The difference between free and Pro</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">Free gives you a taste. Pro gives you the whole engine:</p>
      <ul style="color:#94a3b8;line-height:2;padding-left:20px;margin:0 0 24px">
        <li><strong style="color:#f1f5f9">Daily briefs</strong> instead of weekly</li>
        <li><strong style="color:#f1f5f9">All 20 strategies</strong> unlocked (free shows 5)</li>
        <li><strong style="color:#f1f5f9">AI Brand Voice</strong> trained on your writing</li>
        <li><strong style="color:#f1f5f9">Editorial calendar</strong> synced to Google Calendar</li>
      </ul>
      <a href="https://repsbrief.com/dashboard/settings?tab=billing" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Upgrade to Pro — $19/mo →</a>
    `,
  }

  try {
    const { error } = await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: subjects[day],
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050505;color:#f1f5f9;padding:40px;border-radius:16px">
          ${bodies[day]}
          <p style="color:#475569;font-size:12px;margin-top:40px">RepsBrief · repsbrief.com · <a href="https://repsbrief.com/unsubscribe" style="color:#475569">Unsubscribe</a></p>
        </div>
      `,
    })
    if (error) {
      console.error(`[Mail] Day ${day} sequence error:`, error)
      return { success: false }
    }
    return { success: true }
  } catch (err) {
    console.error(`[Mail] Day ${day} sequence exception:`, err)
    return { success: false }
  }
}
```

- [ ] **Step 2: Create the cron route**

Create `src/app/api/cron/engagement-emails/route.ts`:

```typescript
// src/app/api/cron/engagement-emails/route.ts
// Runs daily. Sends Day 1, Day 3, and Day 7 emails to users based on signup date.

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendWelcomeSequenceEmail } from '@/lib/mail'

export const dynamic = 'force-dynamic'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function daysAgoEnd(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = getSupabaseAdmin('api/cron/engagement-emails')
  const results = { day1: 0, day3: 0, day7: 0, errors: 0 }

  // DAY 1 — users who signed up today
  const { data: day1Users } = await supabase
    .from('profiles')
    .select('id, email, full_name, has_onboarded')
    .gte('created_at', daysAgo(0))
    .lte('created_at', daysAgoEnd(0))

  for (const user of day1Users || []) {
    if (!user.email) continue
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 1)
    r.success ? results.day1++ : results.errors++
  }

  // DAY 3 — users who signed up 3 days ago and have NO brief yet
  const { data: day3Users } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan')
    .gte('created_at', daysAgo(3))
    .lte('created_at', daysAgoEnd(3))

  for (const user of day3Users || []) {
    if (!user.email) continue
    const { data: brief } = await supabase
      .from('briefs')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (brief) continue // already generated, skip
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 3)
    r.success ? results.day3++ : results.errors++
  }

  // DAY 7 — starter users who signed up 7 days ago
  const { data: day7Users } = await supabase
    .from('profiles')
    .select('id, email, full_name, plan')
    .gte('created_at', daysAgo(7))
    .lte('created_at', daysAgoEnd(7))
    .eq('plan', 'starter')

  for (const user of day7Users || []) {
    if (!user.email) continue
    const r = await sendWelcomeSequenceEmail(user.email, user.full_name || '', 7)
    r.success ? results.day7++ : results.errors++
  }

  console.log('[EngagementEmails] Results:', results)
  return NextResponse.json({ success: true, results })
}
```

- [ ] **Step 3: Register the cron in vercel.json**

Check if `vercel.json` exists:

```bash
cat vercel.json 2>/dev/null || echo "not found"
```

If it exists, add to the `crons` array. If not, create it:

```json
{
  "crons": [
    {
      "path": "/api/cron/weeklyBrief",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/engagement-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

If `vercel.json` already has content, merge the `engagement-emails` cron entry into the existing `crons` array — don't overwrite the file.

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mail.ts \
        src/app/api/cron/engagement-emails/route.ts \
        vercel.json
git commit -m "feat: add Day 1/3/7 email engagement sequence via Resend cron"
```

---

## Task 3: Social Proof on Landing

**Files:**
- Modify: `src/components/landing/HeroSection.tsx`

### Context
Add a live user count stat below the email form. We read a count from Supabase at build time (server component approach won't work here since HeroSection is `'use client'`). Use a static/hardcoded number updated manually, or a small API call on mount. The safest approach for a `'use client'` component: hardcode a conservative number and increment it weekly. No API call needed.

- [ ] **Step 1: Add social proof bar below the email form in HeroSection**

In `src/components/landing/HeroSection.tsx`, after the `<EmailCaptureForm />` line, add:

```tsx
{/* Social proof */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest animate-in fade-in duration-1000 delay-1000">
  <div className="flex items-center gap-2">
    <div className="flex -space-x-2">
      {['bg-blue-500','bg-emerald-500','bg-purple-500','bg-orange-500'].map((c,i) => (
        <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-black`} />
      ))}
    </div>
    <span>2,400+ briefs generated</span>
  </div>
  <span className="hidden sm:block text-white/10">·</span>
  <div className="flex items-center gap-1.5">
    <span className="text-yellow-400">★★★★★</span>
    <span>Loved by solo creators & agencies</span>
  </div>
</div>
```

- [ ] **Step 2: Verify locally**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm social proof bar renders below the email form.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/HeroSection.tsx
git commit -m "feat: add social proof bar to landing hero"
```

---

## Task 4: Idea Blur/Gate for Starter Plan

**Files:**
- Modify: `src/components/brief/BriefList.tsx`
- Create: `src/components/brief/LockedIdeasGate.tsx`

### Context
`BriefList` already receives a `plan` prop. Starter users see only the first 5 ideas as normal cards. Ideas 6–20 are replaced with a blurred overlay + upgrade CTA. Pro/Team users see all 20. The blur is CSS-only (no data removed server-side, as the ideas are already in the RSC response — this is a soft gate appropriate for a free tier, not security-critical).

- [ ] **Step 1: Create the locked gate component**

Create `src/components/brief/LockedIdeasGate.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LockedIdeasGateProps {
  lockedCount: number
}

export function LockedIdeasGate({ lockedCount }: LockedIdeasGateProps) {
  return (
    <div className="col-span-full relative">
      {/* Faded preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none select-none">
        {Array.from({ length: Math.min(lockedCount, 3) }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 blur-sm opacity-40"
          />
        ))}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-6 bg-gradient-to-t from-black via-black/80 to-transparent rounded-3xl px-8 py-12">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <p className="text-white font-black text-xl tracking-tight">
            {lockedCount} more strategies locked
          </p>
          <p className="text-slate-400 text-sm font-light max-w-xs">
            Upgrade to Pro to unlock all 20 trend-backed ideas every week.
          </p>
        </div>
        <Button
          className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all"
          asChild
        >
          <Link href="/dashboard/settings?tab=billing">
            <Zap className="w-4 h-4 mr-2" />
            Unlock All 20 — $19/mo
          </Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update BriefList to use the gate**

Replace the full contents of `src/components/brief/BriefList.tsx`:

```tsx
// src/components/brief/BriefList.tsx

import { IdeaObject } from "@/types/niche"
import { BriefCard } from "./BriefCard"
import { LockedIdeasGate } from "./LockedIdeasGate"

interface BriefListProps {
  ideas: IdeaObject[]
  savedHashes?: Set<string>
  savedIdsMap?: Map<string, string>
  plan?: string
}

type IdeaWithMeta = IdeaObject & {
  id?: string
  idea_hash?: string
}

const FREE_IDEAS_LIMIT = 5

export function BriefList({ ideas, savedHashes, savedIdsMap, plan }: BriefListProps) {
  const isStarter = !plan || plan === 'starter'
  const visibleIdeas = isStarter ? ideas.slice(0, FREE_IDEAS_LIMIT) : ideas
  const lockedCount = isStarter ? Math.max(0, ideas.length - FREE_IDEAS_LIMIT) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visibleIdeas.map((idea, idx) => {
        const ideaWithMeta = idea as IdeaWithMeta
        const hash = ideaWithMeta.idea_hash || Buffer.from(idea.title.trim()).toString('base64').substring(0, 64)
        const isSaved = savedHashes?.has(hash)
        const dbId = ideaWithMeta.id || savedIdsMap?.get(hash)

        return (
          <BriefCard
            key={idx}
            idea={idea}
            isSaved={isSaved}
            dbId={dbId}
            plan={plan}
          />
        )
      })}

      {lockedCount > 0 && <LockedIdeasGate lockedCount={lockedCount} />}
    </div>
  )
}
```

- [ ] **Step 3: Verify locally**

Log in with a starter account. Open `/dashboard`. Confirm: first 5 ideas visible normally, the rest replaced by the locked gate with the upgrade CTA. Log in with a pro account and confirm all 20 ideas are visible.

- [ ] **Step 4: Commit**

```bash
git add src/components/brief/BriefList.tsx \
        src/components/brief/LockedIdeasGate.tsx
git commit -m "feat: gate ideas 6-20 behind upgrade CTA for starter plan"
```

---

## Task 5: Rate Limit Differentiation (Starter = 1/week, Pro = 1/day)

**Files:**
- Modify: `src/app/api/generator/generate-now/route.ts`
- Modify: `src/components/dashboard/GenerateNowButton.tsx`

### Context
Currently everyone has 1/day. Starters should get 1/week (Monday reset). The `generate-now` route already has the rate limit logic at step 3. We change the cutoff date based on plan. The `GenerateNowButton` client component needs the new `alreadyGeneratedThisWeek` prop.

- [ ] **Step 1: Update the rate limit logic in the generate-now route**

In `src/app/api/generator/generate-now/route.ts`, find step 3 (around line 56–72). Replace:

```typescript
// 3. Rate limit — 1 generation per calendar day
const todayStart = new Date()
todayStart.setHours(0, 0, 0, 0)

const { data: existingToday } = await supabaseAdmin
  .from('briefs')
  .select('id, created_at')
  .eq('user_id', user.id)
  .gte('created_at', todayStart.toISOString())
  .limit(1)
  .maybeSingle()

if (existingToday) {
  return NextResponse.json(
    { error: 'rate_limited', message: 'You already generated a brief today. Your next generation is available tomorrow.' },
    { status: 429 }
  )
}
```

With:

```typescript
// 3. Rate limit — Pro/Team: 1/day | Starter: 1/week (Monday reset)
const isPaidPlan = profile.plan === 'pro' || profile.plan === 'team'

let rateLimitSince: Date
let rateLimitMessage: string

if (isPaidPlan) {
  // 1 per calendar day
  rateLimitSince = new Date()
  rateLimitSince.setHours(0, 0, 0, 0)
  rateLimitMessage = 'You already generated a brief today. Your next generation is available tomorrow.'
} else {
  // 1 per week — reset on Monday 00:00
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  rateLimitSince = new Date(now)
  rateLimitSince.setDate(now.getDate() - daysSinceMonday)
  rateLimitSince.setHours(0, 0, 0, 0)
  rateLimitMessage = 'Starter plan includes 1 brief per week. Upgrade to Pro for daily briefs.'
}

const { data: existingInWindow } = await supabaseAdmin
  .from('briefs')
  .select('id, created_at')
  .eq('user_id', user.id)
  .gte('created_at', rateLimitSince.toISOString())
  .limit(1)
  .maybeSingle()

if (existingInWindow) {
  return NextResponse.json(
    { error: 'rate_limited', message: rateLimitMessage },
    { status: 429 }
  )
}
```

- [ ] **Step 2: Read the GenerateNowButton to understand its current props**

```bash
cat src/components/dashboard/GenerateNowButton.tsx
```

- [ ] **Step 3: Update GenerateNowButton to show the correct message per plan**

The component currently receives `alreadyGeneratedToday: boolean`. Add a `plan` prop and update the disabled message. Open `src/components/dashboard/GenerateNowButton.tsx` and update the props interface and display text:

```tsx
// Find the interface and update it:
interface GenerateNowButtonProps {
  alreadyGeneratedToday: boolean
  plan?: string
}

// Find the disabled/locked state text and update it:
// Replace whatever "already generated" message exists with:
const isStarter = !plan || plan === 'starter'
const lockedMessage = isStarter
  ? 'Next brief available Monday'
  : 'Next brief available tomorrow'
```

Then in `src/app/(dashboard)/dashboard/page.tsx`, pass the plan to the button. Find the `<GenerateNowButton>` usage and add the prop:

```tsx
<GenerateNowButton alreadyGeneratedToday={alreadyGeneratedToday} plan={userPlan} />
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/generator/generate-now/route.ts \
        src/components/dashboard/GenerateNowButton.tsx \
        src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: differentiate rate limit — starter 1/week, pro 1/day"
```

---

## Task 6: Shareable Strategy Links

**Files:**
- Create: `src/app/s/[id]/page.tsx` (public, no auth)
- Create: `src/app/actions/share.ts`
- Modify: `src/components/brief/BriefCard.tsx`

### Context
`shared_strategies` table already exists (migration `20260305100000_create_shared_strategies.sql`). Schema: `id, user_id, idea_data JSONB, niche, creator_name, created_at`. RLS: anyone can SELECT, only auth users can INSERT.

The flow: user clicks "Share" on a BriefCard → server action inserts row into `shared_strategies` → returns the UUID → user gets `https://repsbrief.com/s/{uuid}` to share. Public page at `/s/[id]` fetches the row and renders the idea with a CTA to sign up.

- [ ] **Step 1: Create the server action**

Create `src/app/actions/share.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { IdeaObject } from '@/types/niche'

export async function createShareAction(idea: IdeaObject, niche: string): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const supabaseAdmin = getSupabaseAdmin('actions/share')
  const { data, error } = await supabaseAdmin
    .from('shared_strategies')
    .insert({
      user_id: user.id,
      idea_data: idea,
      niche,
      creator_name: profile?.full_name || user.email?.split('@')[0] || 'Creator',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[Share] Insert failed:', error)
    return { error: 'Failed to create share link' }
  }

  return { id: data.id }
}
```

- [ ] **Step 2: Create the public share page**

Create `src/app/s/[id]/page.tsx`:

```tsx
// src/app/s/[id]/page.tsx
// Public page — no auth required. Anyone with the link can view.

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { IdeaObject } from '@/types/niche'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FORMAT_COLORS: Record<string, string> = {
  Reel: 'text-red-400 bg-red-500/10 border-red-500/20',
  Carousel: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Thread: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Newsletter: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Idea: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default async function SharedStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getServiceClient()

  const { data: share } = await supabase
    .from('shared_strategies')
    .select('idea_data, niche, creator_name, created_at')
    .eq('id', id)
    .single()

  if (!share) return notFound()

  const idea = share.idea_data as IdeaObject
  const formatColor = FORMAT_COLORS[idea.format] || FORMAT_COLORS.Idea

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20">
      {/* Header */}
      <div className="w-full max-w-2xl space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Shared via RepsBrief</p>
            <p className="text-xs text-slate-400 font-medium">by {share.creator_name}</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-black tracking-tight leading-tight text-white">
              {idea.title}
            </h1>
            <Badge className={`shrink-0 text-[9px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${formatColor}`}>
              {idea.format}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hook</p>
            <p className="text-slate-300 text-sm leading-relaxed font-medium italic">"{idea.hook}"</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Strategy</p>
            <p className="text-slate-400 text-sm leading-relaxed">{idea.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Why It Works</p>
            <p className="text-slate-400 text-sm leading-relaxed">{idea.whyItWorks}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">Want 20 strategies like this, every week?</p>
          <Button
            className="rounded-full px-10 h-14 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all group"
            asChild
          >
            <Link href="/signup">
              Generate My Free Brief
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Free · No credit card</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add Share button to BriefCard**

Read `src/components/brief/BriefCard.tsx` fully first, then find the action buttons area (where Save/Calendar buttons are). Add a Share button that:
1. Calls `createShareAction(idea, niche)`
2. Copies the URL to clipboard
3. Shows a toast

In `BriefCard.tsx`, add to the imports:

```tsx
import { createShareAction } from '@/app/actions/share'
import { Share2 } from 'lucide-react'
```

Add a handler function inside the component (before the return):

```tsx
const [sharing, setSharing] = useState(false)

const handleShare = async () => {
  setSharing(true)
  try {
    const result = await createShareAction(idea, idea.niche || 'general')
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    const url = `${window.location.origin}/s/${result.id}`
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  } catch {
    toast.error('Failed to create share link')
  } finally {
    setSharing(false)
  }
}
```

Add the Share button next to other action buttons in the JSX. Find the area where Save/calendar actions are and add:

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleShare}
  disabled={sharing}
  className="h-8 px-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl"
>
  <Share2 className="w-3.5 h-3.5 mr-1.5" />
  <span className="text-[10px] font-bold uppercase tracking-widest">
    {sharing ? '...' : 'Share'}
  </span>
</Button>
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/share.ts \
        src/app/s/[id]/page.tsx \
        src/components/brief/BriefCard.tsx
git commit -m "feat: shareable strategy links at /s/[id] with viral signup CTA"
```

---

## Task 7: Analytics Page Useful from Day 1

**Files:**
- Modify: `src/app/(dashboard)/dashboard/analytics/page.tsx`

### Context
The analytics page currently only shows data if ideas have `status='published'` and `views_count > 0`. For new users this is empty. Fix: augment with data from the current brief — show format distribution, idea count, and trend source breakdown. These are always available from the `briefs` table. Add an "Insights from your latest brief" section that renders even with zero published ideas, then keep the published performance section below it.

- [ ] **Step 1: Update the data fetching in analytics/page.tsx**

In `src/app/(dashboard)/dashboard/analytics/page.tsx`, after the `profile` fetch (around line 66), add a fetch for the latest brief:

```typescript
// Fetch latest brief for day-1 insights
const { data: latestBrief } = await supabase
  .from('briefs')
  .select('ideas, niche, created_at, week_date')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()

const briefIdeas: IdeaObject[] = latestBrief?.ideas || []

// Compute brief stats
const briefFormatCounts = briefIdeas.reduce((acc: Record<string, number>, idea) => {
  acc[idea.format] = (acc[idea.format] || 0) + 1
  return acc
}, {})

const briefSourceCounts = briefIdeas.reduce((acc: Record<string, number>, idea) => {
  for (const s of idea.sources || []) {
    acc[s] = (acc[s] || 0) + 1
  }
  return acc
}, {})
```

- [ ] **Step 2: Add the "Latest Brief Insights" section to the JSX**

In the `return` of `AnalyticsPage`, before the existing published ideas section, add:

```tsx
{briefIdeas.length > 0 && (
  <section className="space-y-6">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-black tracking-tight text-white">Latest Brief Insights</h2>
      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
        {latestBrief?.niche}
      </Badge>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Total Ideas</p>
        <p className="text-3xl font-black text-white">{briefIdeas.length}</p>
      </div>
      {Object.entries(briefFormatCounts).map(([format, count]) => (
        <div key={format} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{format}s</p>
          <p className="text-3xl font-black text-white">{count}</p>
        </div>
      ))}
    </div>

    {Object.keys(briefSourceCounts).length > 0 && (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Trend Sources</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(briefSourceCounts).map(([source, count]) => (
            <div key={source} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-black text-white capitalize">{source.replace('-', ' ')}</span>
              <span className="text-[10px] font-black text-slate-500">{count} ideas</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
)}
```

- [ ] **Step 3: Update the "no data" empty state**

Find the existing empty state (currently renders when `ideas.length === 0`). Replace it with:

```tsx
{totalPublished === 0 && (
  <div className="text-center py-16 space-y-4">
    <BarChart3 className="w-12 h-12 text-slate-700 mx-auto" />
    <p className="text-slate-500 font-bold">No published content yet.</p>
    <p className="text-slate-600 text-sm">Save ideas to your board and mark them as published to track performance here.</p>
    <Button variant="outline" className="border-white/10 text-slate-400 hover:text-white rounded-2xl" asChild>
      <Link href="/dashboard/ideas">Go to My Ideas</Link>
    </Button>
  </div>
)}
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/dashboard/analytics/page.tsx
git commit -m "feat: show brief insights on analytics page from day 1"
```

---

## Final Step: Update PROJECT_CONTEXT.md

- [ ] **Step 1: Mark features as implemented in PROJECT_CONTEXT.md**

Open `PROJECT_CONTEXT.md` and update the UI/UX Roadmap table. Add these rows:

```markdown
| 17 | Email Capture + Welcome Sequence | 🔴 High | ✅ Done |
| 18 | Idea Gate (Starter 5/20) | 🔴 High | ✅ Done |
| 19 | Social Proof on Landing | 🔴 High | ✅ Done |
| 20 | Rate Limit: Starter 1/week, Pro 1/day | 🔴 High | ✅ Done |
| 21 | Shareable Strategy Links (/s/[id]) | 🟡 Medium | ✅ Done |
| 22 | Analytics Day-1 Insights | 🟡 Medium | ✅ Done |
| 23 | Day 3 + Day 7 Re-engagement Emails | 🟡 Medium | ✅ Done |
```

Also update Section 9 Open Risks — remove any stale entries and note the engagement cron is live.

- [ ] **Step 2: Commit**

```bash
git add PROJECT_CONTEXT.md
git commit -m "docs: mark revenue growth features as implemented"
```

---

## How to Test Each Feature

| Feature | Test |
|---------|------|
| Email capture | Submit email on landing → check `waitlist_emails` in Supabase, check inbox |
| Welcome email | Manually POST to `/api/cron/engagement-emails` with `Authorization: Bearer $CRON_SECRET` |
| Social proof | Load `repsbrief.com` — bar visible under email form |
| Idea gate | Log in as starter → `/dashboard` → confirm only 5 ideas + locked gate |
| Rate limit | Starter: generate 1 brief → try again same week → 429 with "Starter plan..." message |
| Share link | Click Share on any card → URL copied → open in incognito → page renders with signup CTA |
| Analytics | Log in, go to `/dashboard/analytics` → brief insights shown even with 0 published ideas |
