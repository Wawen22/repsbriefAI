import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

function getAppBaseUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  const reqUrl = new URL(req.url)
  return `${reqUrl.protocol}//${reqUrl.host}`
}

export async function POST(req: Request) {
  try {
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

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active billing profile found' }, { status: 400 })
    }

    const appBaseUrl = getAppBaseUrl(req)

    const customerId = profile.stripe_customer_id

    // Verify the customer exists in live mode before creating a portal session
    try {
      await stripe.customers.retrieve(customerId)
    } catch (stripeErr: unknown) {
      const msg = stripeErr instanceof Error ? stripeErr.message : ''
      if (msg.includes('No such customer') || msg.includes('test mode')) {
        // Stale test-mode customer — clear it and tell the client to re-subscribe
        const supabaseAdmin = (await import('@/lib/supabase')).getSupabaseAdmin('api/stripe/portal')
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: null, stripe_subscription_id: null, plan: 'starter' })
          .eq('id', user.id)
        return NextResponse.json({ error: 'Your billing profile was reset (test data). Please subscribe again.' }, { status: 400 })
      }
      throw stripeErr
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appBaseUrl}/dashboard/settings?tab=account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Billing portal creation failed'
    console.error('[Stripe Portal] Error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
