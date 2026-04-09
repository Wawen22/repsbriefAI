# RepsBrief — Image Generation Feature

**Date:** 2026-04-09  
**Status:** Approved  
**Scope:** On-demand AI image generation per brief idea (cover thumbnail)

---

## Overview

Users on Pro/Team plans can click "Generate Visual" on any idea in `StrategicBriefView` to generate a cover thumbnail using `bytedance-seed/seedream-4.5` via OpenRouter's images endpoint. The generated image is stored in Supabase Storage and the URL persisted in a new `idea_images` table. Starter users see a locked button that opens the UpgradeModal.

**Goal:** differenziare la feature Pro, aumentare il perceived value del brief, ridurre l'attrito creativo per chi deve produrre contenuto.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `src/lib/ai/image-provider.ts` | `ImageProvider` interface + `generateIdeaImagePrompt()` helper |
| `src/lib/ai/providers/openrouter-image.ts` | OpenRouter image provider (OpenAI SDK `images.generate`) |
| `src/app/api/generator/generate-image/route.ts` | `POST` endpoint — auth, plan check, generate, store |
| `supabase/migrations/20260409120000_create_idea_images.sql` | New `idea_images` table + RLS + Storage bucket |
| `src/components/brief/GenerateVisualButton.tsx` | Client component: button + loading + image display |

### Modified files

| File | Change |
|------|--------|
| `src/components/brief/StrategicBriefView.tsx` | Add `GenerateVisualButton` above TrendIntelligencePanel |

---

## Database

### New table: `idea_images`

```sql
CREATE TABLE idea_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  idea_history_id UUID REFERENCES idea_history(id) ON DELETE CASCADE NOT NULL,
  image_url       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (idea_history_id)  -- one image per idea (overwrite on regenerate)
);

ALTER TABLE idea_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own images" ON idea_images
  FOR ALL USING (auth.uid() = user_id);
```

### Supabase Storage

- Bucket: `idea-images` (public)  
- Path pattern: `{userId}/{ideaHistoryId}.png`
- Old file deleted on regenerate before uploading new one

---

## API: `POST /api/generator/generate-image`

### Request

```json
{ "ideaHistoryId": "uuid" }
```

### Server logic

1. Authenticate via Supabase `createClient()`
2. Fetch `idea_history` row → verify `user_id = auth.uid()`
3. Check `profiles.plan` → if `starter`, return `403` with `{ error: 'upgrade_required' }`
4. Check `idea_images` for existing → delete from Storage if present (regenerate flow)
5. Build prompt from `idea_data` (see Prompt section)
6. Call `OpenRouterImageProvider.generateImage(prompt)`
7. Fetch image bytes → upload to `idea-images/{userId}/{ideaHistoryId}.png`
8. Upsert into `idea_images` table
9. Return `{ imageUrl: string }`

### Response

```json
{ "imageUrl": "https://...supabase.co/storage/v1/object/public/idea-images/..." }
```

### Error codes

| Code | Meaning |
|------|---------|
| 400 | Missing/invalid `ideaHistoryId` |
| 401 | Not authenticated |
| 403 | Starter plan — include `{ upgradeUrl: '/dashboard/settings?tab=billing' }` |
| 404 | `idea_history` row not found or not owned by user |
| 500 | Generation or storage failure |

---

## Image Provider

### Interface (`src/lib/ai/image-provider.ts`)

```typescript
export interface ImageOptions {
  size?: '1024x1024' | '1024x576' | '576x1024'
  n?: 1
}

export interface ImageResponse {
  url: string       // direct URL returned by model, or base64 data URL
  provider: string
  model: string
}

export interface ImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse>
}

export function generateIdeaImagePrompt(idea: IdeaObject): string {
  const parts = [
    `Professional social media ${idea.format.toLowerCase()} content cover image.`,
    `Topic: ${idea.title}.`,
    idea.keyVisuals ? `Visual style: ${idea.keyVisuals}.` : '',
    'Clean, modern, cinematic lighting, eye-catching composition.',
    'No text overlay. No watermarks. Photorealistic.'
  ]
  return parts.filter(Boolean).join(' ')
}
```

### OpenRouterImageProvider (`src/lib/ai/providers/openrouter-image.ts`)

Uses `openai` SDK pointing at `https://openrouter.ai/api/v1` — calls `client.images.generate()`:

```typescript
const response = await this.client.images.generate({
  model: this.model,          // bytedance-seed/seedream-4.5
  prompt,
  n: 1,
  size: options?.size ?? '1024x1024',  // fallback to square if 1024x576 unsupported
  response_format: 'url',     // or 'b64_json' as fallback
})
```

Model sourced from env var `OPENROUTER_IMAGE_MODEL` (default: `bytedance-seed/seedream-4.5`).  
Uses same `OPENROUTER_API_KEY` as text provider.

---

## UI: `GenerateVisualButton`

### Placement

In `StrategicBriefView`, a new section between the main idea content and `TrendIntelligencePanel`:

```
[ Title + Format Badge ]
[ Hook ]
[ Description ]
[ Why It Works ]
[ Script Draft ]
──────────────────────────────
[ 🎨 Generate Visual ]   ← new section
──────────────────────────────
[ Trend Intelligence ▼ ]
```

### States

| State | UI |
|-------|-----|
| **Starter** | Button with `Lock` icon + `PRO` badge → click opens UpgradeModal |
| **Pro/Team – no image** | Button "Generate Visual" with `Wand2` icon, enabled |
| **Loading** | Button disabled, `Loader2` spinning, text "Generating…" |
| **Success** | Image rendered above button (rounded-2xl, w-full, max-h-72, object-cover) + "Regenerate" button below |
| **Error** | Toast error + button re-enabled |

### Component props

```typescript
interface GenerateVisualButtonProps {
  ideaHistoryId: string
  isStarter: boolean
  idea: IdeaObject
}
```

Manages its own state: `imageUrl`, `isLoading`, `error`. On mount, checks `idea_images` table via Supabase client for existing image.

---

## Environment Variables

| Var | Description |
|-----|-------------|
| `OPENROUTER_IMAGE_MODEL` | Image model to use (default: `bytedance-seed/seedream-4.5`) |
| `OPENROUTER_API_KEY` | Already in use — shared with text provider |

---

## Plan Gating

| Plan | Image generation |
|------|-----------------|
| Starter | Locked — UpgradeModal |
| Pro | Unlocked — unlimited |
| Team | Unlocked — unlimited |

No monthly quota for v1. Can add later if cost becomes an issue.

---

## Testing

1. Set `OPENROUTER_API_KEY` in `.env.local` + `OPENROUTER_IMAGE_MODEL=bytedance-seed/seedream-4.5`
2. Log in as **Pro user** → generate a brief → open any strategy
3. Click "Generate Visual" → verify spinner → image appears
4. Refresh page → verify image persists (loaded from `idea_images` table)
5. Click "Regenerate" → verify new image replaces old one in Storage + DB
6. Log in as **Starter user** → open any strategy → verify button is locked
7. Click locked button → verify UpgradeModal opens with correct feature name
8. Call `POST /api/generator/generate-image` with invalid `ideaHistoryId` → expect 404
9. Call unauthenticated → expect 401
10. Check Supabase Storage bucket `idea-images` → verify file exists at correct path
