import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { resolvePlanFromPriceId } from '@/lib/billing'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
]

async function updateProfileFromSubscription(
  subscription: Stripe.Subscription,
  userIdFromEvent?: string
) {
  const supabaseAdmin = getSupabaseAdmin('api/stripe/webhook')

  const priceId = subscription.items.data[0]?.price?.id
  const metadataPlan = subscription.metadata?.plan
  const planFromMetadata = metadataPlan === 'team' || metadataPlan === 'pro' ? metadataPlan : null
  const planFromPrice = resolvePlanFromPriceId(priceId)
  const resolvedPaidPlan =
    planFromPrice !== 'starter' ? planFromPrice : planFromMetadata || 'pro'
  const nextPlan = ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)
    ? resolvedPaidPlan
    : 'starter'
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
  const userId = userIdFromEvent || subscription.metadata?.userId

  const updateData = {
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id,
    plan: nextPlan,
  }

  if (userId) {
    const { error } = await supabaseAdmin.from('profiles').update(updateData).eq('id', userId)
    if (error) throw error
    return
  }

  if (customerId) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('stripe_customer_id', customerId)
    if (error) throw error
    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
  if (error) throw error
}

async function rewardReferrer(subscription: Stripe.Subscription) {
  try {
    const supabaseAdmin = getSupabaseAdmin('api/stripe/webhook/referral')
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
    const userId = subscription.metadata?.userId

    // Find the converting user's profile
    let profile: { referred_by_code?: string | null } | null = null
    if (userId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('referred_by_code')
        .eq('id', userId)
        .maybeSingle()
      profile = data
    } else if (customerId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('referred_by_code')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()
      profile = data
    }

    if (!profile?.referred_by_code) return

    // Find referrer
    const { data: referrer } = await supabaseAdmin
      .from('profiles')
      .select('id, stripe_customer_id, plan')
      .eq('referral_code', profile.referred_by_code)
      .maybeSingle()

    if (!referrer?.stripe_customer_id) {
      console.log(`[Referral] Referrer has no stripe_customer_id — skipping credit for code ${profile.referred_by_code}`)
      return
    }

    // Apply $19 credit (1 month Pro free) to referrer's Stripe account
    await stripe.customers.createBalanceTransaction(referrer.stripe_customer_id, {
      amount: -1900, // -$19.00 in cents
      currency: 'usd',
      description: `Referral reward — your invite converted to Pro`,
    })

    console.log(`[Referral] Applied $19 credit to referrer ${referrer.id} (stripe: ${referrer.stripe_customer_id})`)
  } catch (err) {
    // Non-fatal — don't fail the webhook
    console.error('[Referral] Error applying referrer reward:', err)
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const headerList = await headers()
  const sig = headerList.get('Stripe-Signature')

  let event: Stripe.Event

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response('No signature or secret', { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Invalid webhook signature'
    console.error(`[Webhook] Signature verification failed: ${errorMessage}`)
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id || undefined
        const subscriptionId = session.subscription as string
        if (!subscriptionId) throw new Error('No subscriptionId found in checkout session')

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await updateProfileFromSubscription(subscription, userId)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await updateProfileFromSubscription(subscription)

        // Referral reward: when a trial converts to active, reward the referrer
        if (
          event.type === 'customer.subscription.updated' &&
          subscription.status === 'active'
        ) {
          const prevAttrs = (event.data as Stripe.Event.Data).previous_attributes as Record<string, unknown> | undefined
          const wasTrialing = prevAttrs?.status === 'trialing'
          if (wasTrialing) {
            await rewardReferrer(subscription)
          }
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Webhook processing failed'
    console.error(`[Webhook] Error processing event ${event.type}:`, err)
    return new Response(`Webhook handler error: ${errorMessage}`, { status: 500 })
  }
}
