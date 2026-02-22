// src/lib/ai/providers/openai.ts

import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey })
    this.model = model || 'gpt-4o-mini'
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
      provider: 'openai',
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    }
  }
}
