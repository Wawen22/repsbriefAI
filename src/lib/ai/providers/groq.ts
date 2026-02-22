// src/lib/ai/providers/groq.ts

import Groq from 'groq-sdk'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class GroqProvider implements AIProvider {
  private client: Groq
  private model: string

  constructor(apiKey: string, model: string) {
    this.client = new Groq({ apiKey })
    this.model = model || 'llama3-70b-8192'
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
    })

    return {
      text: response.choices[0].message.content ?? '',
      provider: 'groq',
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    }
  }
}
