// src/lib/ai/providers/gemini.ts

import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI
  private modelName: string

  constructor(apiKey: string, model: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.modelName = model || 'gemini-1.5-pro'
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      generationConfig: options?.jsonMode ? { responseMimeType: 'application/json' } : undefined
    })

    const systemMessage = messages.find(m => m.role === 'system')?.content
    const history = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }] as Part[],
      }))

    const chat = model.startChat({
      history: history.slice(0, -1),
      systemInstruction: systemMessage
    })

    const lastMessage = history[history.length - 1].parts[0].text || ''
    const result = await chat.sendMessage(lastMessage)
    const response = await result.response

    return {
      text: response.text(),
      provider: 'gemini',
      model: this.modelName,
      tokensUsed: response.usageMetadata?.totalTokenCount,
    }
  }
}
