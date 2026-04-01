# Onboarding Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing informational OnboardingModal into an interactive 3-step guided tour and add a persistent checklist widget that tracks activation completion.

**Architecture:** Upgrade `OnboardingModal` to a wizard with actionable CTAs. Add a new `OnboardingChecklist` floating widget that derives completion state from existing DB data (brand_voice on profiles, briefs count, idea_history saved count) passed as server-side props from `dashboard/page.tsx`. No DB migration needed.

**Tech Stack:** Next.js App Router, React, Tailwind, Supabase, `next/navigation`, existing design system (deep black, glassmorphism, blue/emerald accents).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/dashboard/OnboardingModal.tsx` | Modify | Interactive 3-step wizard with navigation CTAs |
| `src/components/dashboard/OnboardingChecklist.tsx` | Create | Floating persistent checklist widget |
| `src/app/(dashboard)/dashboard/page.tsx` | Modify | Add 3 completion-check queries, render checklist |

---

## Task 1: Upgrade OnboardingModal to interactive wizard

**Files:**
- Modify: `src/components/dashboard/OnboardingModal.tsx`

### Steps

- [ ] **Step 1.1 — Replace the existing file** with the interactive wizard version

Replace the full content of `src/components/dashboard/OnboardingModal.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BrainCircuit, Zap, LayoutGrid, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { completeOnboardingAction } from "@/app/actions/profile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface OnboardingModalProps {
  userName: string
}

const STEPS = [
  {
    id: 'voice',
    badge: 'Step 01 — Your Identity',
    badgeColor: 'text-emerald-400',
    icon: <BrainCircuit className="w-10 h-10 text-emerald-400" />,
    glowColor: 'bg-emerald-600/[0.05]',
    title: 'Train Your AI Voice',
    description: 'The AI writes in YOUR voice. Upload writing samples so every strategy sounds exactly like you — not a robot. This is what makes RepsBrief personal.',
    cta: 'Set Up My Voice',
    ctaStyle: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
  },
  {
    id: 'generate',
    badge: 'Step 02 — Market Intelligence',
    badgeColor: 'text-blue-400',
    icon: <Zap className="w-10 h-10 text-blue-400" />,
    glowColor: 'bg-blue-600/[0.05]',
    title: 'Generate Your First Brief',
    description: '20 content strategies built from live trends — Reddit, YouTube, Google Trends. Hit generate and watch the engine work in real time.',
    cta: 'Generate Now',
    ctaStyle: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
  },
  {
    id: 'kanban',
    badge: 'Step 03 — Production Pipeline',
    badgeColor: 'text-purple-400',
    icon: <LayoutGrid className="w-10 h-10 text-purple-400" />,
    glowColor: 'bg-purple-600/[0.05]',
    title: 'Move an Idea to Production',
    description: 'The Kanban board is your content pipeline. Drag ideas from Backlog → In Progress → Done to track what you\'re publishing.',
    cta: 'Go to My Ideas',
    ctaStyle: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20',
  },
]

export function OnboardingModal({ userName }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  const current = STEPS[step]

  const handleSkip = async () => {
    setIsOpen(false)
    await completeOnboardingAction()
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleCTA = async () => {
    if (current.id === 'voice') {
      setIsOpen(false)
      await completeOnboardingAction()
      router.push('/dashboard/settings?tab=voice')
    } else if (current.id === 'generate') {
      setGenerating(true)
      try {
        const res = await fetch('/api/generator/generate-now', { method: 'POST' })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Generation failed. Try again.')
          setGenerating(false)
          return
        }
        setIsOpen(false)
        await completeOnboardingAction()
        router.refresh()
      } catch {
        toast.error('Generation failed. Please try again.')
        setGenerating(false)
      }
    } else if (current.id === 'kanban') {
      setIsOpen(false)
      await completeOnboardingAction()
      router.push('/dashboard/ideas')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl p-0 bg-[#050505] border-white/10 overflow-hidden rounded-[3rem] shadow-[0_0_100px_-20px_rgba(59,130,246,0.2)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to RepsBrief</DialogTitle>
          <DialogDescription>Get started in 3 steps.</DialogDescription>
        </DialogHeader>

        {/* Background glow */}
        <div className={cn("absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-colors duration-700", current.glowColor)} />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col">
          {/* Header */}
          <div className="p-10 pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Sparkles className="w-3 h-3" /> Studio Setup
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest h-8">
                Skip all
              </Button>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{userName || 'Creator'}</span>.
              </h2>
              <p className="text-slate-500 text-sm font-light mt-1">3 steps to your first content strategy.</p>
            </div>
          </div>

          {/* Step content */}
          <div className="px-10 py-6">
            <div className="bg-white/[0.02] border border-white/8 rounded-[2rem] p-8 space-y-5 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                  {current.icon}
                </div>
                <div className="space-y-1.5">
                  <Badge variant="outline" className={cn("text-[9px] uppercase font-black tracking-widest border-none px-0", current.badgeColor)}>
                    {current.badge}
                  </Badge>
                  <h3 className="text-2xl font-black text-white tracking-tight">{current.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-light">{current.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 pb-10 pt-2 flex items-center justify-between gap-4">
            {/* Step dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === step ? "w-8 bg-blue-500" : i < step ? "w-3 bg-white/30" : "w-3 bg-white/10"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {step < STEPS.length - 1 && (
                <Button variant="ghost" onClick={handleNext} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest">
                  Next →
                </Button>
              )}
              <Button
                onClick={handleCTA}
                disabled={generating}
                className={cn(
                  "rounded-full px-7 h-12 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 group",
                  current.ctaStyle
                )}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <>{current.cta} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 1.2 — Verify no TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors on `OnboardingModal.tsx`

- [ ] **Step 1.3 — Commit**

```bash
git add src/components/dashboard/OnboardingModal.tsx
git commit -m "feat: upgrade OnboardingModal to interactive 3-step wizard"
```

---

## Task 2: Create OnboardingChecklist floating widget

**Files:**
- Create: `src/components/dashboard/OnboardingChecklist.tsx`

### Steps

- [ ] **Step 2.1 — Create the file**

Create `src/components/dashboard/OnboardingChecklist.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface OnboardingChecklistProps {
  voiceConfigured: boolean
  briefGenerated: boolean
  ideaSaved: boolean
}

const ITEMS = [
  {
    key: 'voiceConfigured' as const,
    label: 'Set up your AI Voice',
    href: '/dashboard/settings?tab=voice',
    linkLabel: 'Go to Voice settings',
  },
  {
    key: 'briefGenerated' as const,
    label: 'Generate your first brief',
    href: '/dashboard',
    linkLabel: 'Go to Dashboard',
  },
  {
    key: 'ideaSaved' as const,
    label: 'Move an idea to production',
    href: '/dashboard/ideas',
    linkLabel: 'Go to Ideas board',
  },
]

export function OnboardingChecklist({ voiceConfigured, briefGenerated, ideaSaved }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)

  const completionMap = { voiceConfigured, briefGenerated, ideaSaved }
  const completedCount = Object.values(completionMap).filter(Boolean).length
  const allDone = completedCount === 3

  // Auto-dismiss when all steps complete
  if (allDone) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 rounded-[1.5rem] bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-white uppercase tracking-widest">Getting Started</p>
            <p className="text-[10px] text-slate-500 font-medium">{completedCount}/3 steps complete</p>
          </div>
        </div>
        {collapsed
          ? <ChevronUp className="w-4 h-4 text-slate-600" />
          : <ChevronDown className="w-4 h-4 text-slate-600" />
        }
      </button>

      {/* Progress bar */}
      <div className="h-px bg-white/5 mx-5">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="px-5 py-4 space-y-3">
          {ITEMS.map(item => {
            const done = completionMap[item.key]
            return (
              <div key={item.key} className="flex items-center gap-3">
                {done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  : <Circle className="w-4 h-4 text-white/20 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs font-semibold truncate", done ? "text-slate-600 line-through" : "text-slate-300")}>
                    {item.label}
                  </p>
                  {!done && (
                    <Link
                      href={item.href}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors"
                    >
                      {item.linkLabel} →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2.2 — Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 2.3 — Commit**

```bash
git add src/components/dashboard/OnboardingChecklist.tsx
git commit -m "feat: add OnboardingChecklist persistent floating widget"
```

---

## Task 3: Wire OnboardingChecklist into dashboard page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

### Steps

- [ ] **Step 3.1 — Add import at the top of the file**

Add after the existing `OnboardingModal` import (around line 15):

```tsx
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist"
```

- [ ] **Step 3.2 — Add 3 completion queries to the parallel Promise.all block**

The current `Promise.all` (lines ~91–111) fetches brief, generatedToday, profile. Expand it to also fetch voice, briefCount, and savedIdea:

```tsx
const [
  { data: brief },
  { data: generatedToday },
  { data: profile },
  { data: teamVoice },
  { data: anyBrief },
  { data: anySavedIdea },
] = await Promise.all([
  supabase
    .from('briefs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
  supabase
    .from('briefs')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())
    .limit(1)
    .maybeSingle(),
  supabase
    .from('profiles')
    .select('active_niche, plan, current_team_id, has_onboarded')
    .eq('id', user.id)
    .single(),
  supabase
    .from('profiles')
    .select('brand_voice')
    .eq('id', user.id)
    .single(),
  supabase
    .from('briefs')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle(),
  supabase
    .from('idea_history')
    .select('id')
    .eq('team_id', profile?.current_team_id ?? '')
    .eq('saved', true)
    .limit(1)
    .maybeSingle(),
])
```

> Note: `profile` is used in the last query. Since `Promise.all` runs in parallel, `profile` from the 3rd query won't be available yet. Instead, run the `anySavedIdea` query **after** the main Promise.all, using `profile?.current_team_id`. Replace the Promise.all with this pattern:

```tsx
const [
  { data: brief },
  { data: generatedToday },
  { data: profile },
  { data: teamVoice },
  { data: anyBrief },
] = await Promise.all([
  supabase
    .from('briefs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(),
  supabase
    .from('briefs')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())
    .limit(1)
    .maybeSingle(),
  supabase
    .from('profiles')
    .select('active_niche, plan, current_team_id, has_onboarded')
    .eq('id', user.id)
    .single(),
  supabase
    .from('profiles')
    .select('brand_voice')
    .eq('id', user.id)
    .single(),
  supabase
    .from('briefs')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle(),
])

// Sequential: needs profile.current_team_id
const { data: anySavedIdea } = await supabase
  .from('idea_history')
  .select('id')
  .eq('team_id', profile?.current_team_id ?? '')
  .eq('saved', true)
  .limit(1)
  .maybeSingle()
```

- [ ] **Step 3.3 — Derive completion flags and render checklist**

After `const showOnboarding = !profile?.has_onboarded` (around line 153), add:

```tsx
const voiceConfigured = !!(teamVoice?.brand_voice)
const briefGenerated = !!anyBrief
const ideaSaved = !!anySavedIdea
const showChecklist = !!profile?.has_onboarded && !(voiceConfigured && briefGenerated && ideaSaved)
```

Then in the JSX, add the checklist **after** the OnboardingModal render (around line 157):

```tsx
{showOnboarding && <OnboardingModal userName={user.user_metadata?.full_name || user.email?.split('@')[0]} />}
{showChecklist && (
  <OnboardingChecklist
    voiceConfigured={voiceConfigured}
    briefGenerated={briefGenerated}
    ideaSaved={ideaSaved}
  />
)}
```

- [ ] **Step 3.4 — Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 3.5 — Run lint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: `0 errors, 0 warnings`

- [ ] **Step 3.6 — Run build**

```bash
npm run build 2>&1 | tail -15
```

Expected: build completes successfully

- [ ] **Step 3.7 — Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: wire OnboardingChecklist into dashboard with completion state"
```

---

## Task 4: Push and verify

- [ ] **Step 4.1 — Push to trigger Vercel deploy**

```bash
git push origin main
```

- [ ] **Step 4.2 — Manual smoke test (12-point checklist)**

Test on `https://repsbrief.com` or `https://repsbrief-wawen22s-projects.vercel.app`:

1. **New user modal:** Register new account → `/dashboard` shows OnboardingModal automatically
2. **Step dots:** Click step dots at bottom → navigates between steps
3. **Skip all:** Click "Skip all" → modal closes, no checklist yet (has_onboarded just set)... actually checklist should appear after skip since steps aren't done. Verify checklist shows.
4. **CTA Step 1 (Voice):** On step 1 click "Set Up My Voice" → navigates to `/dashboard/settings?tab=voice`, modal gone
5. **CTA Step 2 (Generate):** On step 2 click "Generate Now" → spinner appears, generation runs, modal closes on success, dashboard refreshes with brief
6. **CTA Step 2 error:** Disconnect internet briefly → click "Generate Now" → error toast, modal stays open
7. **CTA Step 3 (Kanban):** On step 3 click "Go to My Ideas" → navigates to `/dashboard/ideas`, modal gone
8. **Checklist appears:** After modal dismissed (any CTA or skip), refresh dashboard → checklist widget visible bottom-right
9. **Voice complete:** Set brand voice in settings → return to dashboard → voice item shows ✅
10. **Brief complete:** Generate brief → checklist brief item shows ✅
11. **Idea complete:** Save/approve an idea in Kanban → checklist idea item shows ✅
12. **Auto-dismiss:** All 3 ✅ → checklist widget disappears completely

- [ ] **Step 4.3 — Update PROJECT_CONTEXT.md**

Mark onboarding tour as complete in Phase 6 checklist and ROADMAP_UIUX:

```bash
# In PROJECT_CONTEXT.md, update:
#   - [ ] Guided Onboarding Tour — CRITICO per conversioni
# to:
#   - [x] Guided Onboarding Tour — interactive wizard + persistent checklist widget
```

- [ ] **Step 4.4 — Final commit**

```bash
git add PROJECT_CONTEXT.md
git commit -m "Docs: mark onboarding tour complete"
git push origin main
```
