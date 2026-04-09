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
