// src/lib/ai/types.ts

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  text: string
  provider: string
  model: string
  tokensUsed?: number
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>
}

export interface AIOptions {
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}
