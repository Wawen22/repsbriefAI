// src/lib/ai/providers/anthropic.ts

import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey })
    this.model = model || 'claude-3-5-sonnet-20240620'
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const system = messages.find(m => m.role === 'system')?.content
    const userMessages = messages.filter(m => m.role !== 'system')

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options?.maxTokens ?? 4096,
      system,
      messages: userMessages.map(m => ({ 
        role: m.role as 'user' | 'assistant', 
        content: m.content 
      })),
    })

    return {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      provider: 'anthropic',
      model: this.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    }
  }
}
