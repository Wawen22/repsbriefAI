'use client'

import { track } from '@vercel/analytics'

export const PRODUCT_EVENTS = [
  'waitlist_submitted',
  'signup_cta_clicked',
  'strategy_shared',
] as const

export type ProductEvent = (typeof PRODUCT_EVENTS)[number]

type ProductEventProperties = {
  location?: 'hero' | 'pricing' | 'shared_strategy'
}

/**
 * Optional product telemetry. It deliberately carries no email, user ID, or
 * generated-content data, and a telemetry outage cannot affect the product.
 */
export function trackProductEvent(event: ProductEvent, properties?: ProductEventProperties) {
  try {
    track(event, properties)
  } catch {
    // Analytics must never break a conversion or sharing action.
  }
}
