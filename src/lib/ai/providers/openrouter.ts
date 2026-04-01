// src/lib/ai/providers/openrouter.ts

import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class OpenRouterProvider implements AIProvider {
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
    this.model = model || 'openrouter/auto'
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
    })

    return {
      text: response.choices[0].message.content ?? '',
      provider: 'openrouter',
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    }
  }
}
