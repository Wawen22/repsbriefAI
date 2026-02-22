// src/lib/ai/providers/azure.ts

import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class AzureProvider implements AIProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, endpoint: string, model: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${model}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': apiKey },
    })
    this.model = model
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: options?.maxTokens ?? 4096,
    })

    return {
      text: response.choices[0].message.content ?? '',
      provider: 'azure',
      model: this.model,
      tokensUsed: response.usage?.total_tokens,
    }
  }
}
