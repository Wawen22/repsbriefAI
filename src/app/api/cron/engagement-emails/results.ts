export type EngagementEmailResults = {
  day1: number
  day3: number
  day7: number
  briefReady: number
  errors: number
}

type DeliveryCounter = Exclude<keyof EngagementEmailResults, 'errors'>

export function recordDeliveryResult(
  results: EngagementEmailResults,
  counter: DeliveryCounter,
  success: boolean
) {
  if (success) {
    results[counter]++
  } else {
    results.errors++
  }
}
