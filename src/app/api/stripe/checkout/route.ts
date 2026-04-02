import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getPriceIdForPlan } from '@/lib/billing'

type CheckoutBody = {
  plan?: 'pro' | 'team'
}

function getAppBaseUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  const reqUrl = new URL(req.url)
  return `${reqUrl.protocol}//${reqUrl.host}`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as CheckoutBody
    const plan = body.plan === 'team' ? 'team' : 'pro'

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const appBaseUrl = getAppBaseUrl(req)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: getPriceIdForPlan(plan),
          quantity: 1,
        },
      ],
      success_url: `${appBaseUrl}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBaseUrl}/dashboard/settings?upgrade=canceled`,
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        trial_period_days: plan === 'pro' ? 7 : undefined,
        metadata: {
          userId: user.id,
          plan,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Checkout creation failed'
    console.error('[Stripe Checkout] Error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
