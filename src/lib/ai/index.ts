// src/lib/ai/index.ts — Factory: returns the active provider based on env vars

import type { AIProvider } from './types'
import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { GeminiProvider } from './providers/gemini'
import { AzureProvider } from './providers/azure'
import { GroqProvider } from './providers/groq'

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL!

  switch (provider) {
    case 'openai': {
      return new OpenAIProvider(process.env.OPENAI_API_KEY!, model)
    }
    case 'anthropic': {
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY!, model)
    }
    case 'gemini': {
      return new GeminiProvider(process.env.GEMINI_API_KEY!, model)
    }
    case 'azure': {
      if (!process.env.AZURE_OPENAI_API_KEY) {
        throw new Error('AZURE_OPENAI_API_KEY is not set')
      }
      if (!process.env.AZURE_OPENAI_ENDPOINT) {
        throw new Error('AZURE_OPENAI_ENDPOINT is not set')
      }
      return new AzureProvider(
        process.env.AZURE_OPENAI_API_KEY,
        process.env.AZURE_OPENAI_ENDPOINT,
        model,
        process.env.AZURE_OPENAI_API_VERSION,
        process.env.AZURE_OPENAI_FALLBACK_MODEL
      )
    }
    case 'groq': {
      return new GroqProvider(process.env.GROQ_API_KEY!, model)
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}
