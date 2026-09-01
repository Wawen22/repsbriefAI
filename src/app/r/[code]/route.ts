import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const referralCode = code.toUpperCase()
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .maybeSingle()

  if (!referrer) return new NextResponse('Not Found', { status: 404 })

  const response = NextResponse.redirect(new URL(`/signup?ref=${encodeURIComponent(referralCode)}`, request.url))
  response.cookies.set({
    name: 'repsbrief_ref', value: referralCode, httpOnly: false,
    maxAge: 60 * 60 * 24 * 30, path: '/', sameSite: 'lax',
  })
  return response
}
