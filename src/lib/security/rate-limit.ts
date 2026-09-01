import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type RateLimitPolicy = 'remix' | 'brandVoice' | 'imageGeneration'

const policies: Record<RateLimitPolicy, [number, `${number} ${'m' | 'h'}`]> = {
  remix: [10, '10 m'],
  brandVoice: [3, '24 h'],
  imageGeneration: [10, '24 h'],
}

export async function checkRateLimit(policy: RateLimitPolicy, identifier: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { allowed: false, unavailable: true, retryAfterSeconds: 0 }
  }
  const [limit, window] = policies[policy]
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `repsbrief:${policy}`,
  })
  const result = await limiter.limit(identifier)
  return {
    allowed: result.success,
    unavailable: false,
    retryAfterSeconds: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  }
}
