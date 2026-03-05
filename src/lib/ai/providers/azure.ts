// src/lib/ai/providers/azure.ts

import OpenAI from 'openai'
import type { AIProvider, AIMessage, AIResponse, AIOptions } from '../types'

type AzureEndpointConfig = {
  baseURL: string
  apiVersion?: string
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveAzureEndpointConfig(endpoint: string, model: string, fallbackApiVersion?: string): AzureEndpointConfig {
  const raw = endpoint.trim()
  if (!raw) {
    throw new Error('AZURE_OPENAI_ENDPOINT is empty')
  }

  const defaultApiVersion = fallbackApiVersion || '2024-05-01-preview'
  const parsedUrl = new URL(raw)
  const normalizedPath = parsedUrl.pathname.replace(/\/+$/, '')

  // Foundry/OpenAI-compatible endpoint: https://<resource>.openai.azure.com/openai/v1/
  if (normalizedPath.endsWith('/openai/v1')) {
    return {
      baseURL: `${parsedUrl.origin}/openai/v1/`,
    }
  }

  // Full legacy target URI: https://<resource>.cognitiveservices.azure.com/openai/deployments/<deployment>/chat/completions?api-version=...
  if (normalizedPath.includes('/openai/deployments/') && normalizedPath.endsWith('/chat/completions')) {
    const match = normalizedPath.match(/\/openai\/deployments\/([^/]+)\/chat\/completions$/)
    const deployment = match?.[1] || model
    const apiVersion = parsedUrl.searchParams.get('api-version') || defaultApiVersion
    return {
      baseURL: `${parsedUrl.origin}/openai/deployments/${deployment}`,
      apiVersion,
    }
  }

  // Root resource endpoint (legacy): https://<resource>.cognitiveservices.azure.com
  // or https://<resource>.openai.azure.com
  if (!normalizedPath || normalizedPath === '/') {
    const host = parsedUrl.hostname

    if (host.endsWith('.openai.azure.com')) {
      return {
        baseURL: `${trimTrailingSlash(parsedUrl.origin)}/openai/v1/`,
      }
    }

    return {
      baseURL: `${trimTrailingSlash(parsedUrl.origin)}/openai/deployments/${model}`,
      apiVersion: defaultApiVersion,
    }
  }

  // Partial legacy path support: https://<resource>.cognitiveservices.azure.com/openai/deployments/<deployment>
  if (normalizedPath.includes('/openai/deployments/')) {
    const match = normalizedPath.match(/\/openai\/deployments\/([^/]+)/)
    const deployment = match?.[1] || model
    return {
      baseURL: `${parsedUrl.origin}/openai/deployments/${deployment}`,
      apiVersion: parsedUrl.searchParams.get('api-version') || defaultApiVersion,
    }
  }

  throw new Error(
    `Unsupported AZURE_OPENAI_ENDPOINT format: "${endpoint}". Use either a Foundry endpoint (.../openai/v1/) or a legacy Azure OpenAI endpoint.`
  )
}

export class AzureProvider implements AIProvider {
  private client: OpenAI
  private model: string
  private fallbackModel?: string

  constructor(apiKey: string, endpoint: string, model: string, apiVersion?: string, fallbackModel?: string) {
    const config = resolveAzureEndpointConfig(endpoint, model, apiVersion)

    this.client = new OpenAI({
      apiKey,
      defaultHeaders: { 'api-key': apiKey },
      baseURL: config.baseURL,
      defaultQuery: config.apiVersion ? { 'api-version': config.apiVersion } : undefined,
    })
    this.model = model
    this.fallbackModel = fallbackModel
  }

  private isGpt5Model(modelName: string): boolean {
    return /^gpt-5(\.|-|$)/i.test(modelName)
  }

  private isUnsupportedParameterError(error: unknown, paramName: string): boolean {
    if (!error || typeof error !== 'object') return false
    const withCode = error as { code?: string; param?: string }
    return withCode.code === 'unsupported_parameter' && withCode.param === paramName
  }

  private isModelNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const withStatus = error as { status?: number; code?: string }
    return (
      withStatus.code === 'DeploymentNotFound' ||
      withStatus.code === 'unknown_model' ||
      withStatus.status === 404
    )
  }

  private async requestCompletion(modelName: string, messages: AIMessage[], options?: AIOptions) {
    const isGpt5 = this.isGpt5Model(modelName)
    const payload: Record<string, unknown> = {
      model: modelName,
      messages,
    }

    if (isGpt5) {
      payload.max_completion_tokens = options?.maxTokens ?? 4096
    } else {
      payload.max_tokens = options?.maxTokens ?? 4096
      payload.temperature = options?.temperature ?? 0.4
    }

    if (options?.jsonMode) {
      payload.response_format = { type: 'json_object' }
    }

    try {
      return await this.client.chat.completions.create(
        payload as OpenAI.Chat.ChatCompletionCreateParams
      )
    } catch (error) {
      if (this.isUnsupportedParameterError(error, 'response_format') && options?.jsonMode) {
        const retryPayload = { ...payload }
        delete retryPayload.response_format
        return await this.client.chat.completions.create(
          retryPayload as OpenAI.Chat.ChatCompletionCreateParams
        )
      }
      throw error
    }
  }

  async complete(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    let usedModel = this.model
    let response

    try {
      response = await this.requestCompletion(usedModel, messages, options)
    } catch (error) {
      const shouldFallback =
        this.fallbackModel &&
        this.fallbackModel !== this.model &&
        this.isModelNotFoundError(error)

      if (!shouldFallback) {
        throw error
      }

      usedModel = this.fallbackModel as string
      response = await this.requestCompletion(usedModel, messages, options)
    }

    return {
      text: response.choices[0].message.content ?? '',
      provider: 'azure',
      model: usedModel,
      tokensUsed: response.usage?.total_tokens,
    }
  }
}
