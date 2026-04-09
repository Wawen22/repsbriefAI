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
        // Cast to satisfy OpenAI types; OpenRouter accepts all these sizes
        size: size as '1024x1024',
      })

      const url = response.data?.[0]?.url
      if (url) {
        return { url, provider: 'openrouter', model: this.model }
      }

      // Fallback: some models return base64
      const b64 = response.data?.[0]?.b64_json
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
