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
