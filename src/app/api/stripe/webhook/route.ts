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
