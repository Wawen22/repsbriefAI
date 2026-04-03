// src/app/r/[code]/page.tsx
// Referral landing page — sets cookie then redirects to signup
// URL: repsbrief.com/r/ABCD1234

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  // Validate the code exists
  const supabase = getServiceClient()
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('referral_code', upperCode)
    .maybeSingle()

  if (!referrer) return notFound()

  // Set cookie so signup page can pick it up
  const cookieStore = await cookies()
  cookieStore.set('repsbrief_ref', upperCode, {
    httpOnly: false, // needs to be readable by client JS on signup
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  })

  redirect(`/signup?ref=${upperCode}`)
}
