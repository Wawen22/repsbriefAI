// src/app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type Stripe from 'stripe'

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
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        if (!userId) throw new Error('No userId in metadata')

        // Update profile in Supabase
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan: 'pro', // Simplified logic, update based on priceId if needed
          })
          .eq('id', userId)

        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find profile by subscription ID and set plan back to free/expired
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        break
      }

      // Add more events like subscription updated as needed
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`[Webhook] Error processing event ${event.type}:`, err)
    return new Response(`Webhook handler error: ${err.message}`, { status: 500 })
  }
}
