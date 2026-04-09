# Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add on-demand AI image generation for brief ideas using `bytedance-seed/seedream-4.5` via OpenRouter — Pro/Team only, images persisted in Supabase Storage.

**Architecture:** A new `ImageProvider` abstraction (parallel to `AIProvider`) drives a dedicated `OpenRouterImageProvider`. A new API route handles auth, plan gating, generation, and storage upload. A new `GenerateVisualButton` client component handles all UI state and is wired into `StrategicBriefView` between Phase 01 and Phase 02.

**Tech Stack:** Next.js 15 App Router, Supabase (DB + Storage + RLS), OpenAI SDK (OpenRouter compat), Vitest (unit tests), Zustand (`useUpgradeModal`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `supabase/migrations/20260409120000_create_idea_images.sql` | Create | `idea_images` table + RLS + `idea-images` Storage bucket |
| `src/lib/ai/image-provider.ts` | Create | `ImageProvider` interface, `ImageOptions`, `ImageResponse`, `generateIdeaImagePrompt()` |
| `src/lib/ai/providers/openrouter-image.ts` | Create | `OpenRouterImageProvider` — calls OpenRouter images endpoint via OpenAI SDK |
| `tests/unit/image-provider.test.ts` | Create | Unit tests for `generateIdeaImagePrompt()` |
| `src/app/api/generator/generate-image/route.ts` | Create | `POST` — auth, plan check, generate, upload to Storage, upsert DB |
| `src/components/brief/GenerateVisualButton.tsx` | Create | Client component — locked/generate/loading/success/download states |
| `src/components/brief/StrategicBriefView.tsx` | Modify | Import + render `GenerateVisualButton` between Phase 01 and Phase 02 |
| `.env.example` | Modify | Add `OPENROUTER_IMAGE_MODEL` |

---

## Task 1: DB Migration — `idea_images` table + Storage bucket

**Files:**
- Create: `supabase/migrations/20260409120000_create_idea_images.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260409120000_create_idea_images.sql

-- 1. Table
CREATE TABLE IF NOT EXISTS idea_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  idea_history_id UUID NOT NULL REFERENCES idea_history(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (idea_history_id)
);

-- 2. RLS
ALTER TABLE idea_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own idea images"
ON idea_images FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('idea-images', 'idea-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read idea images"
ON storage.objects FOR SELECT
USING (bucket_id = 'idea-images');

CREATE POLICY "Authenticated upload idea images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'idea-images');

CREATE POLICY "Authenticated delete idea images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'idea-images');

CREATE POLICY "Authenticated update idea images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'idea-images');
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the Supabase MCP tool: `apply_migration` with the SQL above.

Or via CLI (if linked):
```bash
pnpm supabase db push
```

Expected: migration applied with no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260409120000_create_idea_images.sql
git commit -m "feat: add idea_images table and idea-images storage bucket"
```

---

## Task 2: Image Provider Interface + Prompt Builder

**Files:**
- Create: `src/lib/ai/image-provider.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/ai/image-provider.ts

import type { IdeaObject } from '@/types/niche'

export interface ImageOptions {
  size?: '1024x1024' | '1024x576' | '576x1024'
}

export interface ImageResponse {
  url: string   // HTTPS URL or data: URL (base64)
  provider: string
  model: string
}

export interface ImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse>
}

/**
 * Builds an image generation prompt from a brief idea.
 * Uses title, format, and keyVisuals (if present).
 */
export function generateIdeaImagePrompt(idea: IdeaObject): string {
  const parts: string[] = [
    `Professional social media ${idea.format.toLowerCase()} cover image.`,
    `Topic: ${idea.title}.`,
  ]
  if (idea.keyVisuals) {
    parts.push(`Visual style: ${idea.keyVisuals}.`)
  }
  parts.push(
    'Clean, modern, cinematic lighting, eye-catching composition. No text overlay. No watermarks. Photorealistic.'
  )
  return parts.join(' ')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm typecheck
```

Expected: no errors.

---

## Task 3: Unit Tests for `generateIdeaImagePrompt`

**Files:**
- Create: `tests/unit/image-provider.test.ts`

- [ ] **Step 1: Write the tests**

```typescript
// tests/unit/image-provider.test.ts

import { generateIdeaImagePrompt } from '@/lib/ai/image-provider'
import type { IdeaObject } from '@/types/niche'

const BASE_IDEA: IdeaObject = {
  title: 'How I Lost 10kg in 30 Days',
  hook: 'The one habit that changed everything',
  description: 'A personal fitness journey breakdown',
  format: 'Reel',
  whyItWorks: 'Relatability + proof',
  keyVisuals: 'Before/after split screen, gym lighting',
}

describe('generateIdeaImagePrompt', () => {
  it('includes the format in lowercase', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('reel')
  })

  it('includes the idea title', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('How I Lost 10kg in 30 Days')
  })

  it('includes keyVisuals when present', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('Before/after split screen, gym lighting')
  })

  it('omits keyVisuals section when field is absent', () => {
    const idea: IdeaObject = { ...BASE_IDEA, keyVisuals: undefined }
    const prompt = generateIdeaImagePrompt(idea)
    expect(prompt).not.toContain('Visual style:')
  })

  it('always ends with quality directives', () => {
    const prompt = generateIdeaImagePrompt(BASE_IDEA)
    expect(prompt).toContain('No text overlay')
    expect(prompt).toContain('Photorealistic')
  })
})
```

- [ ] **Step 2: Run tests — verify all 5 pass**

```bash
pnpm test
```

Expected: 5 tests PASS (the function was created in Task 2 before these tests).

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/image-provider.ts tests/unit/image-provider.test.ts
git commit -m "feat: add ImageProvider interface and generateIdeaImagePrompt"
```

---

## Task 4: OpenRouterImageProvider

**Files:**
- Create: `src/lib/ai/providers/openrouter-image.ts`

- [ ] **Step 1: Create the provider**

```typescript
// src/lib/ai/providers/openrouter-image.ts

import OpenAI from 'openai'
import type { ImageProvider, ImageOptions, ImageResponse } from '../image-provider'

export class OpenRouterImageProvider implements ImageProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://repsbrief.com',
        'X-Title': 'RepsBrief',
      },
    })
    this.model = model || 'bytedance-seed/seedream-4.5'
  }

  async generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse> {
    const size = options?.size ?? '1024x1024'

    try {
      const response = await this.client.images.generate({
        model: this.model,
        prompt,
        n: 1,
        size,
        // @ts-expect-error — OpenRouter accepts response_format; not in base OpenAI types for all models
        response_format: 'url',
      })

      const url = response.data[0]?.url
      if (url) {
        return { url, provider: 'openrouter', model: this.model }
      }

      // Fallback: some models return base64
      const b64 = response.data[0]?.b64_json
      if (b64) {
        return {
          url: `data:image/png;base64,${b64}`,
          provider: 'openrouter',
          model: this.model,
        }
      }

      throw new Error('No image data in response')
    } catch (err) {
      // If model rejects the requested size, retry with square fallback
      const message = err instanceof Error ? err.message : String(err)
      if (size !== '1024x1024' && (message.includes('size') || message.includes('invalid'))) {
        return this.generateImage(prompt, { ...options, size: '1024x1024' })
      }
      throw err
    }
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors (the `@ts-expect-error` suppresses the known OpenAI SDK type gap).

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/providers/openrouter-image.ts
git commit -m "feat: add OpenRouterImageProvider for image generation"
```

---

## Task 5: API Endpoint `POST /api/generator/generate-image`

**Files:**
- Create: `src/app/api/generator/generate-image/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/generator/generate-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { OpenRouterImageProvider } from '@/lib/ai/providers/openrouter-image'
import { generateIdeaImagePrompt } from '@/lib/ai/image-provider'
import type { IdeaObject } from '@/types/niche'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function getImageProvider(): OpenRouterImageProvider {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')
  const model = process.env.OPENROUTER_IMAGE_MODEL || 'bytedance-seed/seedream-4.5'
  return new OpenRouterImageProvider(apiKey, model)
}

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) {
    const base64 = url.split(',')[1]
    if (!base64) throw new Error('Invalid base64 data URL')
    return Buffer.from(base64, 'base64')
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse + validate body
    let ideaHistoryId: string
    try {
      const body = await req.json() as { ideaHistoryId?: unknown }
      ideaHistoryId = body?.ideaHistoryId as string
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    if (!ideaHistoryId || typeof ideaHistoryId !== 'string') {
      return NextResponse.json({ error: 'ideaHistoryId is required' }, { status: 400 })
    }

    const admin = getSupabaseAdmin('api/generator/generate-image')

    // 3. Plan check — starter cannot generate images
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (!profile || profile.plan === 'starter') {
      return NextResponse.json(
        { error: 'upgrade_required', upgradeUrl: '/dashboard/settings?tab=billing' },
        { status: 403 }
      )
    }

    // 4. Fetch the idea — must belong to this user
    const { data: ideaRow } = await admin
      .from('idea_history')
      .select('id, idea_data, user_id')
      .eq('id', ideaHistoryId)
      .eq('user_id', user.id)
      .single()

    if (!ideaRow) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const ideaData = ideaRow.idea_data as IdeaObject | null
    if (!ideaData) {
      return NextResponse.json({ error: 'Idea has no content' }, { status: 400 })
    }

    // 5. Delete old Storage file if regenerating
    const storagePath = `${user.id}/${ideaHistoryId}.png`
    const { data: existing } = await admin
      .from('idea_images')
      .select('id')
      .eq('idea_history_id', ideaHistoryId)
      .single()

    if (existing) {
      await admin.storage.from('idea-images').remove([storagePath])
    }

    // 6. Generate image
    const provider = getImageProvider()
    const prompt = generateIdeaImagePrompt(ideaData)
    const imageResult = await provider.generateImage(prompt)

    // 7. Upload to Supabase Storage
    const imageBuffer = await fetchImageAsBuffer(imageResult.url)

    const { error: uploadError } = await admin.storage
      .from('idea-images')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // 8. Get public URL
    const { data: { publicUrl } } = admin.storage
      .from('idea-images')
      .getPublicUrl(storagePath)

    // 9. Upsert into idea_images table
    await admin
      .from('idea_images')
      .upsert(
        { user_id: user.id, idea_history_id: ideaHistoryId, image_url: publicUrl },
        { onConflict: 'idea_history_id' }
      )

    return NextResponse.json({ imageUrl: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[generate-image] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generator/generate-image/route.ts
git commit -m "feat: add POST /api/generator/generate-image endpoint"
```

---

## Task 6: `GenerateVisualButton` Component

**Files:**
- Create: `src/components/brief/GenerateVisualButton.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/brief/GenerateVisualButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { Wand2, Loader2, Lock, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUpgradeModal } from '@/components/ui/UpgradeModal'

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[7px] font-black text-blue-400 uppercase tracking-widest leading-none">
      PRO
    </span>
  )
}

interface GenerateVisualButtonProps {
  ideaHistoryId: string
  isStarter: boolean
}

export function GenerateVisualButton({ ideaHistoryId, isStarter }: GenerateVisualButtonProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const openUpgrade = useUpgradeModal((s) => s.open)

  // Load existing image on mount
  useEffect(() => {
    if (isStarter || !ideaHistoryId) return
    const supabase = createClient()
    supabase
      .from('idea_images')
      .select('image_url')
      .eq('idea_history_id', ideaHistoryId)
      .single()
      .then(({ data }) => {
        if (data?.image_url) setImageUrl(data.image_url)
      })
  }, [ideaHistoryId, isStarter])

  const handleGenerate = async () => {
    if (isStarter) {
      openUpgrade('AI Visual Generation')
      return
    }

    setIsLoading(true)
    const tid = toast.loading('Generating AI visual…')
    try {
      const res = await fetch('/api/generator/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaHistoryId }),
      })

      const data = await res.json() as { imageUrl?: string; error?: string }

      if (!res.ok) {
        if (res.status === 403) {
          toast.dismiss(tid)
          openUpgrade('AI Visual Generation')
          return
        }
        throw new Error(data.error || 'Generation failed')
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        toast.success('Visual generated!', { id: tid })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image'
      toast.error(message, { id: tid })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'repsbrief-visual.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI Visual</span>
      </div>

      {/* Generated image display */}
      {imageUrl && (
        <div className="relative rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02]">
          <img
            src={imageUrl}
            alt="AI-generated visual"
            className="w-full max-h-72 object-cover"
          />
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleDownload}
              className="h-8 px-3 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[9px] font-black text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Action button */}
      {isStarter ? (
        <Button
          onClick={() => openUpgrade('AI Visual Generation')}
          className="h-10 px-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
        >
          <Lock className="w-3.5 h-3.5" />
          {imageUrl ? 'Regenerate Visual' : 'Generate AI Visual'}
          <ProBadge />
        </Button>
      ) : (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          {isLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
          ) : imageUrl ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Regenerate Visual</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5" /> Generate AI Visual</>
          )}
        </Button>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/brief/GenerateVisualButton.tsx
git commit -m "feat: add GenerateVisualButton component"
```

---

## Task 7: Wire up `GenerateVisualButton` in `StrategicBriefView`

**Files:**
- Modify: `src/components/brief/StrategicBriefView.tsx`

- [ ] **Step 1: Add import at the top of `StrategicBriefView.tsx`**

After the existing imports (around line 60–61, near the Notion import), add:

```typescript
import { GenerateVisualButton } from '@/components/brief/GenerateVisualButton'
```

- [ ] **Step 2: Add the component between Phase 01 and Phase 02**

In the left column JSX (`<div className="flex-1 overflow-y-auto ...">`, around line 573), locate the end of the Phase 01 section:

```tsx
          </section>

          {/* Phase 02: Script — gated for starter */}
          <section className="max-w-4xl mx-auto space-y-12">
```

Insert `GenerateVisualButton` between them:

```tsx
          </section>

          {/* AI Visual Generation */}
          <GenerateVisualButton
            ideaHistoryId={ideaId}
            isStarter={isStarter}
          />

          {/* Phase 02: Script — gated for starter */}
          <section className="max-w-4xl mx-auto space-y-12">
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: all tests PASS (5 image-provider tests + existing suite).

- [ ] **Step 5: Commit**

```bash
git add src/components/brief/StrategicBriefView.tsx
git commit -m "feat: wire GenerateVisualButton into StrategicBriefView"
```

---

## Task 8: Update `.env.example` + Final Build Check

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add new env var to `.env.example`**

Locate the existing OpenRouter line:
```
OPENROUTER_API_KEY=   # https://openrouter.ai — set AI_PROVIDER=openrouter and AI_MODEL=openrouter/free
```

Add below it:
```
OPENROUTER_IMAGE_MODEL=bytedance-seed/seedream-4.5   # image generation model — requires OPENROUTER_API_KEY
```

- [ ] **Step 2: Run full build**

```bash
pnpm build
```

Expected: build completes with no errors or type failures.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add OPENROUTER_IMAGE_MODEL to env example"
```

---

## Manual Testing Checklist

After all tasks complete:

1. Add `OPENROUTER_IMAGE_MODEL=bytedance-seed/seedream-4.5` to `.env.local`
2. Ensure `OPENROUTER_API_KEY` is set in `.env.local`
3. Run `pnpm dev`
4. **Pro user flow:**
   - Generate a brief → open any strategy (`/dashboard/strategy/[id]`)
   - Find the "AI Visual" section between Phase 01 and Phase 02
   - Click "Generate AI Visual" → verify spinner appears
   - Verify image appears after ~5-10s
   - Refresh the page → verify image reloads (persisted in DB)
   - Click "Regenerate Visual" → verify new image replaces old one
   - Click "Download" → verify PNG downloads
5. **Starter user flow:**
   - Log in as a starter user, open any strategy
   - Verify button shows "Generate AI Visual" with lock icon + PRO badge
   - Click it → verify UpgradeModal opens with feature name "AI Visual Generation"
6. **API edge cases:**
   - `POST /api/generator/generate-image` with no body → expect 400
   - `POST /api/generator/generate-image` without auth cookie → expect 401
   - Check Supabase Storage bucket `idea-images` → verify PNG file at path `{userId}/{ideaHistoryId}.png`
   - Check `idea_images` table → verify row with correct `image_url`
