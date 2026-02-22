// src/lib/ai/index.ts — Factory: returns the active provider based on env vars

import type { AIProvider } from './types'

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? 'openai'
  const model = process.env.AI_MODEL!

  // Note: For a true factory without top-level imports, 
  // we would use dynamic requires or a lazy-loading pattern.
  // In Next.js/TypeScript environments, dynamic 'import()' is preferred,
  // but here we use classes that will be imported in the factory.
  // To strictly follow the "no top-level imports" rule in a Node context:

  switch (provider) {
    case 'openai': {
      const { OpenAIProvider } = require('./providers/openai')
      return new OpenAIProvider(process.env.OPENAI_API_KEY!, model)
    }
    case 'anthropic': {
      const { AnthropicProvider } = require('./providers/anthropic')
      return new AnthropicProvider(process.env.ANTHROPIC_API_KEY!, model)
    }
    case 'gemini': {
      const { GeminiProvider } = require('./providers/gemini')
      return new GeminiProvider(process.env.GEMINI_API_KEY!, model)
    }
    case 'azure': {
      const { AzureProvider } = require('./providers/azure')
      return new AzureProvider(process.env.AZURE_OPENAI_API_KEY!, process.env.AZURE_OPENAI_ENDPOINT!, model)
    }
    case 'groq': {
      const { GroqProvider } = require('./providers/groq')
      return new GroqProvider(process.env.GROQ_API_KEY!, model)
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}
