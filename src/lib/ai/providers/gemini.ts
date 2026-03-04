// src/lib/ai/providers/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI
  private modelName: string

  constructor(apiKey: string, model: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.modelName = model || 'gemini-1.5-pro'
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: options?.maxTokens ?? 8192,
      temperature: options?.temperature ?? 0.7,
    }

    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json'
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content
    const conversationMessages = messages.filter(m => m.role !== 'system')

    // Pass systemInstruction at model level — this is the proper Gemini SDK approach
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig,
      ...(systemMessage ? { systemInstruction: systemMessage } : {}),
    })

    // Single-turn: use generateContent directly
    if (conversationMessages.length <= 1) {
      const userContent = conversationMessages[0]?.content ?? ''
      const result = await model.generateContent(userContent)
      const response = result.response
      const text = response.text()

      console.log(`[Gemini] generateContent done. Response length: ${text.length}, first 300 chars: ${text.substring(0, 300)}`)

      return {
        text,
        provider: 'gemini',
        model: this.modelName,
        tokensUsed: response.usageMetadata?.totalTokenCount,
      }
    }

    // Multi-turn: use chat API with systemInstruction set on model
    const history = conversationMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })

    const lastMessage = conversationMessages[conversationMessages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const response = result.response
    const text = response.text()

    console.log(`[Gemini] chat done. Response length: ${text.length}, first 300 chars: ${text.substring(0, 300)}`)

    return {
      text,
      provider: 'gemini',
      model: this.modelName,
      tokensUsed: response.usageMetadata?.totalTokenCount,
    }
  }
}
