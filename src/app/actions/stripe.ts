'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch the user's profile to get the stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.stripe_customer_id) {
    // If no customer ID exists, they haven't subscribed yet.
    throw new Error('No active subscription found.')
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: returnUrl,
  })

  // Redirect to Stripe Customer Portal
  redirect(session.url)
}
